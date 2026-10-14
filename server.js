// server.js — سرور اصلی
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { testConnection, query } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🚀 Booting Daneshmand backend...");
console.log("📡 PORT =", PORT);
console.log("🗄️ DB_HOST =", process.env.DB_HOST);

// ─── Middleware ───
app.use(cors({
    origin: 'https://daneshmand-app.ir'
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// ─── Health check ───
app.get("/health", (req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});

// ═══════════════════════════════════════════════════════
// ✅ مسیرهای عمومی برای PWABuilder (بدون نیاز به JWT)
// ═══════════════════════════════════════════════════════

app.get('/api/public/hello', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to Daneshmand App public endpoint!',
        appName: 'دانشمند',
        version: '1.0.0'
    });
});

app.get('/guest', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>دانشمند | خوش آمدید</title>
            <link rel="manifest" href="/manifest.json">
            <meta name="theme-color" content="#0f172a">
        </head>
        <body style="text-align: center; padding: 50px; font-family: Tahoma; background-color: #0f172a; color: white; min-height: 100vh; margin: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 2rem; margin-bottom: 20px;">🧠 به اپلیکیشن دانشمند خوش آمدید</h1>
            <p style="font-size: 1.1rem; color: #94a3b8; margin-bottom: 40px;">بازی فکری آنلاین — چالش، لیگ و رقابت</p>
            <a href="/login" style="padding: 14px 32px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold;">
                ورود به حساب کاربری
            </a>
        </body>
        </html>
    `);
});

// ═══════════════════════════════════════════════════════
// پایان مسیرهای عمومی
// ═══════════════════════════════════════════════════════

// ─── Setup Database ───
async function setupDatabase() {
    try {
        const result = await query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);

        if (result.rows.length > 0) {
            console.log("✅ Tables already exist");
            return;
        }

        console.log("🔧 Creating tables...");

        await query(`
            CREATE TABLE IF NOT EXISTS users (
                phone TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                avatar TEXT DEFAULT '👨',
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                coins INTEGER DEFAULT 50,
                games_played INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                wrong_answers INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                league_id TEXT DEFAULT 'division3',
                league_wins INTEGER DEFAULT 0,
                online_wins INTEGER DEFAULT 0,
                online_games INTEGER DEFAULT 0,
                online_best_score INTEGER DEFAULT 0,
                category_stats JSONB DEFAULT '{}'::jsonb,
                vip_avatars JSONB DEFAULT '[]'::jsonb,
                honors JSONB DEFAULT '[]'::jsonb,
                subscription_until BIGINT DEFAULT 0,
                subscription_type TEXT,
                last_daily_heart_claim BIGINT DEFAULT 0,
                created_at BIGINT
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS league_seasons (
                id SERIAL PRIMARY KEY,
                season_start BIGINT NOT NULL,
                season_end BIGINT NOT NULL,
                league_id TEXT NOT NULL,
                group_number INTEGER NOT NULL,
                status TEXT DEFAULT 'active'
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS league_members (
                id SERIAL PRIMARY KEY,
                season_id INTEGER REFERENCES league_seasons(id) ON DELETE CASCADE,
                user_phone TEXT NOT NULL,
                username TEXT NOT NULL,
                avatar TEXT DEFAULT '👤',
                points INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                played INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                topic1 TEXT,
                topic2 TEXT,
                topic3 TEXT,
                joined_at BIGINT
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS league_matches (
                id SERIAL PRIMARY KEY,
                season_id INTEGER REFERENCES league_seasons(id) ON DELETE CASCADE,
                round_number INTEGER,
                home_phone TEXT,
                away_phone TEXT,
                home_score INTEGER,
                away_score INTEGER,
                home_submitted BOOLEAN DEFAULT false,
                away_submitted BOOLEAN DEFAULT false,
                home_topic TEXT,
                away_topic TEXT,
                start_time BIGINT,
                end_time BIGINT,
                status TEXT DEFAULT 'scheduled',
                result TEXT
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS league_bootstrap_queue (
                user_phone TEXT PRIMARY KEY,
                username TEXT,
                avatar TEXT,
                league_id TEXT,
                paid_amount INTEGER,
                registered_at BIGINT
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS pvp_queue (
                id SERIAL PRIMARY KEY,
                user_phone TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                avatar TEXT DEFAULT '👤',
                level INTEGER DEFAULT 1,
                joined_at BIGINT NOT NULL
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS pvp_matches (
                id SERIAL PRIMARY KEY,
                player1_phone TEXT NOT NULL,
                player1_username TEXT NOT NULL,
                player1_avatar TEXT,
                player1_topic TEXT,
                player1_score INTEGER DEFAULT 0,
                player1_answered INTEGER DEFAULT 0,
                player1_finished BOOLEAN DEFAULT false,
                player2_phone TEXT NOT NULL,
                player2_username TEXT NOT NULL,
                player2_avatar TEXT,
                player2_topic TEXT,
                player2_score INTEGER DEFAULT 0,
                player2_answered INTEGER DEFAULT 0,
                player2_finished BOOLEAN DEFAULT false,
                questions JSONB NOT NULL,
                current_set INTEGER DEFAULT 1,
                status TEXT DEFAULT 'selecting_topics',
                started_at BIGINT,
                finished_at BIGINT,
                winner_phone TEXT,
                created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS pvp_topic_selections (
                id SERIAL PRIMARY KEY,
                match_id INTEGER REFERENCES pvp_matches(id) ON DELETE CASCADE,
                user_phone TEXT NOT NULL,
                topic_id TEXT NOT NULL,
                selected_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
                UNIQUE(match_id, user_phone)
            );
        `);

        await query(`
            CREATE INDEX IF NOT EXISTS idx_members_season ON league_members(season_id);
            CREATE INDEX IF NOT EXISTS idx_members_phone ON league_members(user_phone);
            CREATE INDEX IF NOT EXISTS idx_matches_season ON league_matches(season_id);
            CREATE INDEX IF NOT EXISTS idx_matches_status ON league_matches(status);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_pvp_queue_joined ON pvp_queue(joined_at);
            CREATE INDEX IF NOT EXISTS idx_pvp_matches_status ON pvp_matches(status);
            CREATE INDEX IF NOT EXISTS idx_pvp_matches_players ON pvp_matches(player1_phone, player2_phone);
            CREATE INDEX IF NOT EXISTS idx_pvp_selections_match ON pvp_topic_selections(match_id);
        `);

        console.log("✅ All tables created successfully!");
    } catch (err) {
        console.error("❌ Setup DB error:", err.message);
    }
}

// ─── Load Routes ───
function loadRoutes() {
    try {
        const authRoutes = require("./routes/auth");
        const userRoutes = require("./routes/user");
        const leagueRoutes = require("./routes/league");
        const pvpRoutes = require("./routes/pvp");

        app.use("/auth", authRoutes);
        app.use("/user", userRoutes);
        app.use("/league", leagueRoutes);
        app.use("/pvp", pvpRoutes);

        console.log("✅ Routes loaded");
    } catch (err) {
        console.error("❌ Routes error:", err.message);
    }
}

// ─── Static files ───
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

// ─── Serve manifest.json and service-worker.js safely ───
function sendFileSafe(res, fileName, contentType) {
    const rootPath = path.join(__dirname, fileName);
    const publicPath = path.join(__dirname, "public", fileName);

    console.log("🔍 Looking for:", fileName);
    console.log("   - rootPath:", rootPath, "exists:", fs.existsSync(rootPath));
    console.log("   - publicPath:", publicPath, "exists:", fs.existsSync(publicPath));

    if (fs.existsSync(rootPath)) {
        res.setHeader("Content-Type", contentType);
        return res.sendFile(rootPath);
    }
    if (fs.existsSync(publicPath)) {
        res.setHeader("Content-Type", contentType);
        return res.sendFile(publicPath);
    }
    console.warn("⚠️ File not found:", fileName);
    return res.status(404).send("File not found: " + fileName);
}

app.get("/manifest.json", (req, res) => {
    sendFileSafe(res, "manifest.json", "application/manifest+json");
});

app.get("/service-worker.js", (req, res) => {
    sendFileSafe(res, "service-worker.js", "application/javascript");
});

// ─── SPA fallback ───
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ─── Error handler ───
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ ok: false, error: "خطای سرور" });
});

// ─── Start Server ───
async function start() {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server running on port ${PORT}`);
    });

    try {
        const dbOk = await testConnection();
        if (dbOk) {
            await setupDatabase();
            loadRoutes();
            try {
                const { startCronJobs } = require("./cron/league");
                startCronJobs();
            } catch (e) {
                console.warn("⚠️ Cron not loaded:", e.message);
            }
        } else {
            console.error("⚠️ Database not available, continuing without DB");
        }
    } catch (err) {
        console.warn("⚠️ Startup warning:", err.message);
    }
}

start();
