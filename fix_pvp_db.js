const { query } = require("./db");

async function fixPvP() {
    try {
        console.log("⏳ Dropping old PvP tables...");
        // پاک کردن جدول‌های قدیمی برای رفع تداخل
        await query(`DROP TABLE IF EXISTS pvp_topic_selections CASCADE;`);
        await query(`DROP TABLE IF EXISTS pvp_matches CASCADE;`);
        await query(`DROP TABLE IF EXISTS pvp_queue CASCADE;`);

        console.log("⏳ Creating new PvP tables...");
        // ساخت جدول‌ها با ساختار دقیق و کامل
        await query(`
            CREATE TABLE pvp_queue (
                id SERIAL PRIMARY KEY, user_phone TEXT UNIQUE, username TEXT, avatar TEXT,
                level INTEGER DEFAULT 1, joined_at BIGINT
            );
            CREATE TABLE pvp_matches (
                id SERIAL PRIMARY KEY,
                player1_phone TEXT, player1_username TEXT, player1_avatar TEXT, player1_topic TEXT, player1_score INTEGER DEFAULT 0, player1_answered INTEGER DEFAULT 0, player1_finished BOOLEAN DEFAULT false,
                player2_phone TEXT, player2_username TEXT, player2_avatar TEXT, player2_topic TEXT, player2_score INTEGER DEFAULT 0, player2_answered INTEGER DEFAULT 0, player2_finished BOOLEAN DEFAULT false,
                questions JSONB, current_set INTEGER DEFAULT 1, status TEXT DEFAULT 'selecting_topics',
                started_at BIGINT, finished_at BIGINT, winner_phone TEXT, created_at BIGINT
            );
            CREATE TABLE pvp_topic_selections (
                id SERIAL PRIMARY KEY, match_id INTEGER, user_phone TEXT, topic_id TEXT, selected_at BIGINT, UNIQUE(match_id, user_phone)
            );
        `);
        console.log("✅ PvP Tables Recreated Successfully");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e.message);
        process.exit(1);
    }
}
fixPvP();
