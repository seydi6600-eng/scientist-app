const { query } = require("./db");
async function createPvP() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS pvp_queue (
                id SERIAL PRIMARY KEY, user_phone TEXT UNIQUE, username TEXT, avatar TEXT,
                level INTEGER DEFAULT 1, joined_at BIGINT
            );
            CREATE TABLE IF NOT EXISTS pvp_matches (
                id SERIAL PRIMARY KEY,
                player1_phone TEXT, player1_username TEXT, player1_avatar TEXT, player1_topic TEXT, player1_score INTEGER DEFAULT 0, player1_answered INTEGER DEFAULT 0, player1_finished BOOLEAN DEFAULT false,
                player2_phone TEXT, player2_username TEXT, player2_avatar TEXT, player2_topic TEXT, player2_score INTEGER DEFAULT 0, player2_answered INTEGER DEFAULT 0, player2_finished BOOLEAN DEFAULT false,
                questions JSONB, current_set INTEGER DEFAULT 1, status TEXT DEFAULT 'selecting_topics',
                started_at BIGINT, finished_at BIGINT, winner_phone TEXT, created_at BIGINT
            );
            CREATE TABLE IF NOT EXISTS pvp_topic_selections (
                id SERIAL PRIMARY KEY, match_id INTEGER, user_phone TEXT, topic_id TEXT, selected_at BIGINT, UNIQUE(match_id, user_phone)
            );
        `);
        console.log("✅ PvP Tables Created Successfully");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
createPvP();
