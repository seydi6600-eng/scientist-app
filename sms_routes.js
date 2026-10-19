const express = require("express");
const router = express.Router();
const { sendOTP } = require("./sms");
const { query } = require("./db");
const bcrypt = require("bcryptjs"); // برای هش کردن رمز
const jwt = require("jsonwebtoken");

async function ensureTables() {
    try {
        await query(`CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, expires BIGINT)`);
    } catch(e) { console.error(e); }
}
ensureTables();

// ۱. ارسال کد
router.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^09\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: "شماره معتبر نیست" });
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const result = await sendOTP(phone, code);
    if (result.ok) {
        await query("INSERT INTO otp_codes (phone, code, expires) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires = $3", [phone, code, Date.now() + 120000]);
        res.json({ ok: true });
    } else {
        res.status(500).json({ ok: false, error: result.error });
    }
});

// ۲. تایید کد و ثبت‌نام/ورود
router.post("/verify-otp", async (req, res) => {
    const { phone, code, username, password, actionType } = req.body;
    
    try {
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];

        if (!record || Number(record.expires) < Date.now()) {
            return res.status(400).json({ ok: false, error: "کد منقضی شده یا اشتباه است" });
        }

        if (record.code === code) {
            await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
            
            const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);

            if (actionType === "register") {
                if (userRes.rows.length > 0) {
                    return res.status(400).json({ ok: false, error: "این شماره قبلا ثبت‌نام کرده است" });
                }
                
                // ثبت‌نام جدید
                const hashedPassword = await bcrypt.hash(password, 10);
                const newUserRes = await query(
                    `INSERT INTO users (phone, username, password_hash, avatar, coins, created_at) 
                     VALUES ($1, $2, $3, '👨', 50, $4) RETURNING *`,
                    [phone, username, hashedPassword, Date.now()]
                );
                const user = newUserRes.rows[0];
                const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
                res.json({ ok: true, token, user });
            } else {
                // ورود با پیامک
                if (userRes.rows.length === 0) {
                    return res.status(400).json({ ok: false, error: "کاربری با این شماره یافت نشد. ابتدا ثبت‌نام کنید" });
                }
                const user = userRes.rows[0];
                const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
                res.json({ ok: true, token, user });
            }
        } else {
            res.status(400).json({ ok: false, error: "کد وارد شده اشتباه است" });
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "خطای دیتابیس" });
    }
});

module.exports = router;
