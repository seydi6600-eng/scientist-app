// db.js — اتصال به PostgreSQL
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "postgres",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
    console.error("❌ Database pool error:", err.message);
});

async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === "development") {
            console.log("📊 Query:", text.slice(0, 50), "|", duration + "ms");
        }
        return result;
    } catch (err) {
        console.error("❌ Query error:", err.message);
        throw err;
    }
}

async function testConnection() {
    try {
        const result = await query("SELECT NOW()");
        console.log("✅ Database connected:", result.rows[0].now);
        return true;
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        return false;
    }
}

module.exports = {
    pool,
    query,
    testConnection,
};
