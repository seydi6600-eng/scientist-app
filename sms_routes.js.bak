const express = require("express");
const router = express.Router();
const { sendOTP } = require("./sms");
const { query } = require("./db");
const jwt = require("jsonwebtoken");

async function ensureTable() {
    try {
        await query(`CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, expires BIGINT)`);
    } catch(e) {}
}
ensureTable();

// ارسال کد
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

// تایید کد و لاگین/ثبت‌نام
router.post("/verify-otp", async (req, res) => {
    const { phone, code, username, password, actionType } = req.body;
    try {
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];

        if (!record || Number(record.expires) < Date.now()) {
            return res.status(400).json({ ok: false, error: "کد نامعتبر یا منقضی شده است" });
        }

        if (record.code === code) {
            await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
            
            const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);
            
            let user;
            if (actionType === "register") {
                if (userRes.rows.length > 0) return res.status(400).json({ ok: false, error: "این شماره قبلا ثبت‌نام کرده است" });
                // ثبت‌نام (نیاز به هش رمز ندارد چون فقط با پیامک وارد می‌شود)
                const newUser = await query(
                    `INSERT INTO users (phone, username, password_hash, avatar, coins, created_at) VALUES ($1, $2, $3, '👨', 50, $4) RETURNING *`,
                    [phone, username, "otp_login_no_password", Date.now()]
                );
                user = newUser.rows[0];
            } else {
                if (userRes.rows.length === 0) return res.status(400).json({ ok: false, error: "کاربر یافت نشد. ابتدا ثبت‌نام کنید." });
                user = userRes.rows[0];
            }

            const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
            res.json({ ok: true, token: token, user: user });
        } else {
            res.status(400).json({ ok: false, error: "کد وارد شده اشتباه است" });
        }
    } catch(err) {
        res.status(500).json({ ok: false, error: "خطای دیتابیس" });
    }
});

module.exports = router;
