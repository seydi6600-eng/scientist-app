require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const { pool, testConnection, query } = require("./db");
const { sendOTP } = require("./sms");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set({ "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" });
    next();
});

async function setupDatabase() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                phone TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL, avatar TEXT DEFAULT '👨',
                xp INTEGER DEFAULT 0, level INTEGER DEFAULT 1, coins INTEGER DEFAULT 50,
                games_played INTEGER DEFAULT 0, correct_answers INTEGER DEFAULT 0,
                wrong_answers INTEGER DEFAULT 0, best_score INTEGER DEFAULT 0,
                league_id TEXT DEFAULT 'division3', league_wins INTEGER DEFAULT 0,
                online_wins INTEGER DEFAULT 0, online_games INTEGER DEFAULT 0,
                online_best_score INTEGER DEFAULT 0, category_stats JSONB DEFAULT '{}'::jsonb,
                vip_avatars JSONB DEFAULT '[]'::jsonb, honors JSONB DEFAULT '[]'::jsonb,
                subscription_until BIGINT DEFAULT 0, subscription_type TEXT,
                last_daily_heart_claim BIGINT DEFAULT 0, 
                items JSONB DEFAULT '{"removeTwo":0,"extraTime":0,"rename":0}'::jsonb,
                transactions JSONB DEFAULT '[]'::jsonb,
                created_at BIGINT
            );
            CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, expires BIGINT);
            CREATE TABLE IF NOT EXISTS league_seasons (id SERIAL PRIMARY KEY, season_start BIGINT, season_end BIGINT, league_id TEXT, group_number INTEGER, status TEXT DEFAULT 'active');
            CREATE TABLE IF NOT EXISTS league_members (id SERIAL PRIMARY KEY, season_id INTEGER, user_phone TEXT, username TEXT, avatar TEXT, points INTEGER DEFAULT 0, correct_answers INTEGER DEFAULT 0, played INTEGER DEFAULT 0, wins INTEGER DEFAULT 0, draws INTEGER DEFAULT 0, losses INTEGER DEFAULT 0, topic1 TEXT, topic2 TEXT, topic3 TEXT, joined_at BIGINT);
            CREATE TABLE IF NOT EXISTS league_matches (id SERIAL PRIMARY KEY, season_id INTEGER, round_number INTEGER, home_phone TEXT, away_phone TEXT, home_score INTEGER, away_score INTEGER, home_submitted BOOLEAN DEFAULT false, away_submitted BOOLEAN DEFAULT false, home_topic TEXT, away_topic TEXT, start_time BIGINT, end_time BIGINT, status TEXT DEFAULT 'scheduled', result TEXT);
            CREATE TABLE IF NOT EXISTS pvp_queue (id SERIAL PRIMARY KEY, user_phone TEXT UNIQUE, username TEXT, avatar TEXT, level INTEGER DEFAULT 1, joined_at BIGINT);
            CREATE TABLE IF NOT EXISTS pvp_matches (id SERIAL PRIMARY KEY, player1_phone TEXT, player1_username TEXT, player1_avatar TEXT, player1_topic TEXT, player1_score INTEGER DEFAULT 0, player1_answered INTEGER DEFAULT 0, player1_finished BOOLEAN DEFAULT false, player2_phone TEXT, player2_username TEXT, player2_avatar TEXT, player2_topic TEXT, player2_score INTEGER DEFAULT 0, player2_answered INTEGER DEFAULT 0, player2_finished BOOLEAN DEFAULT false, questions JSONB, current_set INTEGER DEFAULT 1, status TEXT DEFAULT 'selecting_topics', started_at BIGINT, finished_at BIGINT, winner_phone TEXT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS pvp_topic_selections (id SERIAL PRIMARY KEY, match_id INTEGER, user_phone TEXT, topic_id TEXT, selected_at BIGINT, UNIQUE(match_id, user_phone));
        `);

        await query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS online_wins INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS online_games INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS online_best_score INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS category_stats JSONB DEFAULT '{}'::jsonb;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_avatars JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS honors JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_until BIGINT DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_heart_claim BIGINT DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '{"removeTwo":0,"extraTime":0,"rename":0}'::jsonb;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS transactions JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_league_points INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS league_joined BOOLEAN DEFAULT false;
        `);

        console.log("✅ Tables Ready and Columns Updated");
    } catch (err) { console.error("❌ DB Error:", err.message); }
}

app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^09\d{9}$/.test(phone)) {
        return res.status(400).json({ ok: false, error: "شماره معتبر نیست" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existing = await client.query(
            `SELECT code, expires FROM otp_codes WHERE phone = $1 FOR UPDATE`,
            [phone]
        );

        let codeToSend;

        if (existing.rows.length > 0 && Number(existing.rows[0].expires) > Date.now()) {
            codeToSend = existing.rows[0].code;
        } else {
            codeToSend = Math.floor(10000 + Math.random() * 90000).toString();
            
            await client.query(
                `INSERT INTO otp_codes (phone, code, expires)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (phone) 
                 DO UPDATE SET code = EXCLUDED.code, expires = EXCLUDED.expires`,
                [phone, codeToSend, Date.now() + 600000]
            );
        }

        await client.query('COMMIT');

        const result = await sendOTP(phone, codeToSend);
        
        if (!result.ok) {
            return res.status(500).json({ 
                ok: false, 
                error: result.error || "خطا در ارسال پیامک" 
            });
        }

        return res.json({ ok: true });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("خطا در send-otp:", err);
        return res.status(500).json({ ok: false, error: "خطای سرور" });
    } finally {
        client.release();
    }
});

app.post("/api/verify-otp", async (req, res) => {
    const { phone, code, actionType, username, password } = req.body;
    
    const normalizeCode = (c) => {
        if (!c) return "";
        return String(c)
            .trim()
            .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
            .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
            .replace(/\s+/g, "");
    };

    try {
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];
        
        if (!record || Number(record.expires) < Date.now()) return res.status(400).json({ ok: false, error: "کد منقضی شده" });
        
        const dbCode = normalizeCode(record.code);
        const userCode = normalizeCode(code);

        if (dbCode !== userCode) {
            return res.status(400).json({ ok: false, error: "کد اشتباه" });
        }
        
        await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
        
        const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);
        
        if (userRes.rows.length > 0) {
            const user = userRes.rows[0];
            const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret", { expiresIn: '30d' });
            return res.json({ ok: true, token, user });
        } 
        
        let finalUsername = (username && username.trim()) ? username.trim() : "user_" + phone.slice(-4);
        const checkUser = await query("SELECT * FROM users WHERE username = $1", [finalUsername]);
        if (checkUser.rows.length > 0) finalUsername = finalUsername + Math.floor(Math.random() * 1000);
        
        let finalPass = (password && password.trim()) ? password.trim() : "otp";
        // هش کردن رمز برای امنیت
        const hashedPass = finalPass === "otp" ? "otp" : crypto.createHash("sha256").update(finalPass).digest("hex");

        const newUser = await query(
            `INSERT INTO users (phone, username, password_hash, coins, created_at) VALUES ($1, $2, $3, 50, $4) RETURNING *`, 
            [phone, finalUsername, hashedPass, Date.now()]
        );
        const user = newUser.rows[0];
        const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret", { expiresIn: '30d' });
        return res.json({ ok: true, token, user });
        
    } catch (err) { res.status(500).json({ ok: false, error: "خطای دیتابیس: " + err.message }); }
});
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/league", require("./routes/league"));
app.use("/pvp", require("./routes/pvp"));
app.use("/quiz", require("./routes/quiz"));    

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, "index.html"));
    } else {
        next();
    }
});

async function start() {
    app.listen(PORT, "0.0.0.0", () => { console.log(`✅ Server running on ${PORT}`); });
    try {
        const dbOk = await testConnection();
        if (dbOk) await setupDatabase();
    } catch (err) { console.warn("⚠️ Startup:", err.message); }
}
start();
