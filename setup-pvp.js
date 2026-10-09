// setup-pvp.js — ساخت جدول‌های PvP
require("dotenv").config();
const { query } = require("./db");

async function setupPvPTables() {
    console.log("🔧 در حال ساخت جدول‌های PvP...");

    try {
        // ۱. جدول صف انتظار
        await query(`
            CREATE TABLE IF NOT EXISTS pvp_queue (
                id SERIAL PRIMARY KEY,
                user_phone TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                avatar TEXT DEFAULT '👤',
                level INTEGER DEFAULT 1,
                joined_at BIGINT NOT NULL
            )
        `);
        console.log("✅ pvp_queue ساخته شد");

        // ۲. جدول مسابقات
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
            )
        `);
        console.log("✅ pvp_matches ساخته شد");

        // ۳. جدول انتخاب موضوع
        await query(`
            CREATE TABLE IF NOT EXISTS pvp_topic_selections (
                id SERIAL PRIMARY KEY,
                match_id INTEGER REFERENCES pvp_matches(id) ON DELETE CASCADE,
                user_phone TEXT NOT NULL,
                topic_id TEXT NOT NULL,
                selected_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
                UNIQUE(match_id, user_phone)
            )
        `);
        console.log("✅ pvp_topic_selections ساخته شد");

        // ۴. آپدیت users
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS online_wins INTEGER DEFAULT 0
        `);
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS online_games INTEGER DEFAULT 0
        `);
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS online_best_score INTEGER DEFAULT 0
        `);
        console.log("✅ users آپدیت شد");

        // ۵. آپدیت league_members (برای موضوعات)
        await query(`
            ALTER TABLE league_members 
            ADD COLUMN IF NOT EXISTS topic1 TEXT,
            ADD COLUMN IF NOT EXISTS topic2 TEXT,
            ADD COLUMN IF NOT EXISTS topic3 TEXT
        `);
        console.log("✅ league_members آپدیت شد");

        // ۶. ایندکس‌ها
        await query(`
            CREATE INDEX IF NOT EXISTS idx_pvp_queue_joined ON pvp_queue(joined_at);
            CREATE INDEX IF NOT EXISTS idx_pvp_matches_status ON pvp_matches(status);
            CREATE INDEX IF NOT EXISTS idx_pvp_matches_players ON pvp_matches(player1_phone, player2_phone);
            CREATE INDEX IF NOT EXISTS idx_pvp_selections_match ON pvp_topic_selections(match_id);
            CREATE INDEX IF NOT EXISTS idx_pvp_selections_user ON pvp_topic_selections(user_phone);
        `);
        console.log("✅ ایندکس‌ها ساخته شدن");

        console.log("\n🎉 همه‌ی جدول‌ها با موفقیت ساخته شدن!");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ خطا:", err.message);
        process.exit(1);
    }
}

setupPvPTables();
