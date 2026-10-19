const { query } = require("./db");
async function fix() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS league_bootstrap_queue (
                id SERIAL PRIMARY KEY, user_phone VARCHAR(20) NOT NULL,
                username VARCHAR(50), avatar VARCHAR(50), league_id VARCHAR(50) NOT NULL,
                paid_amount INT NOT NULL, registered_at BIGINT NOT NULL
            );
        `);
        console.log("✅ جدول league_bootstrap_queue ساخته شد");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
