
// server.js — سرور اصلی
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { testConnection, query } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🚀 Booting Daneshmand backend...");
console.log("📡 PORT =", PORT);
console.log("🗄️ DB_HOST =", process.env.DB_HOST);

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Health check (بدون وابستگی به دیتابیس)
app.get("/health", (req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});

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

        console.log("✅ All tables created successfully!");
    } catch (err) {
        console.error("❌ Setup DB error:", err.message);
    }
}

// ─── Load Routes (بعد از Setup) ───
async function loadRoutes() {
    try {
        const authRoutes = require("./routes/auth");
        const userRoutes = require("./routes/user");
        const leagueRoutes = require("./routes/league");

        app.use("/auth", authRoutes);
        app.use("/user", userRoutes);
        app.use("/league", leagueRoutes);

        console.log("✅ Routes loaded");
    } catch (err) {
        console.error("❌ Routes error:", err.message);
    }
}

// ─── Static files ───
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

// SPA fallback
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ ok: false, error: "خطای سرور" });
});

// ─── Start Server ───
async function start() {
    // اول سرور رو راه بنداز (تا لیارا ببینه)
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server running on port ${PORT}`);
    });

    // بعد با دیتابیس کار کن
    try {
        const dbOk = await testConnection();
        if (dbOk) {
            await setupDatabase();
            await loadRoutes();
        } else {
            console.error("⚠️ Database not available, continuing without DB");
        }
    } catch (err) {
        console.error("⚠️ Startup warning:", err.message);
    }
}

start();
