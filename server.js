// server.js — سرور اصلی
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { testConnection, query } = require("./db");
const { startCronJobs } = require("./cron/league");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const leagueRoutes = require("./routes/league");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/league", leagueRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});

// Static files (کلاینت)
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

// ─── Setup Database (اجرای خودکار) ───
async function setupDatabase() {
    try {
        // چک کن آیا جدول users وجود داره
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

        await query(`
            CREATE INDEX IF NOT EXISTS idx_members_season ON league_members(season_id);
            CREATE INDEX IF NOT EXISTS idx_members_phone ON league_members(user_phone);
            CREATE INDEX IF NOT EXISTS idx_matches_season ON league_matches(season_id);
            CREATE INDEX IF NOT EXISTS idx_matches_status ON league_matches(status);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);

        console.log("✅ All tables created successfully!");
    } catch (err) {
        console.error("❌ Setup DB error:", err.message);
        throw err;
    }
}

// ─── Start Server ───
async function start() {
    console.log("🚀 Starting Daneshmand backend...");

    const dbOk = await testConnection();
    if (!dbOk) {
        console.error("❌ Cannot start without database");
        process.exit(1);
    }

    // اجرای خودکار setup
    await setupDatabase();

    // شروع Cron
    startCronJobs();

    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🌐 http://localhost:${PORT}`);
    });
}

start();
