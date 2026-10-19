const express = require("express");
const router = express.Router();
const { sendOTP } = require("./sms");
const { query } = require("./db");
const jwt = require("jsonwebtoken");

// ساخت جدول در صورت نبود
async function ensureTable() {
    try {
        await query(`CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, expires BIGINT)`);
    } catch(e) { console.error(e); }
}
ensureTable();

// ۱. مسیر ارسال کد
router.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^09\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: "شماره معتبر نیست" });
    
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const result = await sendOTP(phone, code);

    if (result.ok) {
        try {
            await query("INSERT INTO otp_codes (phone, code, expires) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires = $3", [phone, code, Date.now() + 120000]);
            res.json({ ok: true });
        } catch(err) {
            res.status(500).json({ ok: false, error: "خطای دیتابیس" });
        }
    } else {
        res.status(500).json({ ok: false, error: result.error });
    }
});

// ۲. مسیر تایید کد (همون چیزی که دنبالش بودی)
router.post("/verify-otp", async (req, res) => {
    const { phone, code, actionType } = req.body;
    
    try {
        // پیدا کردن کد تایید در دیتابیس
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];

        // چک کردن انقضا یا اشتباه بودن
        if (!record || Number(record.expires) < Date.now()) {
            return res.status(400).json({ ok: false, error: "کد منقضی شده یا ارسال نشده است" });
        }

        if (record.code !== code) {
            return res.status(400).json({ ok: false, error: "کد وارد شده اشتباه است" });
        }

        // اگر کد درست بود، از دیتابیس پاکش کن
        await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);

        // چک کردن اینکه آیا کاربر قبلا ثبت‌نام کرده یا نه
        const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);

        if (actionType === "register") {
            if (userRes.rows.length > 0) {
                return res.status(400).json({ ok: false, error: "این شماره قبلا ثبت‌نام کرده است" });
            }
            
            // ساخت کاربر جدید (چون در پیامک نام کاربری نداریم، یک نام پیش‌فرض می‌سازیم)
            const defaultUsername = "user_" + phone.slice(-4) + Math.floor(Math.random() * 1000);
            const newUser = await query(
                `INSERT INTO users (phone, username, password_hash, avatar, coins, created_at) VALUES ($1, $2, $3, '👨', 50, $4) RETURNING *`,
                [phone, defaultUsername, "otp_login", Date.now()]
            );
            const user = newUser.rows[0];
            const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
            
            return res.json({ ok: true, token, user });

        } else {
            // ورود با پیامک (کاربر باید از قبل وجود داشته باشه)
            if (userRes.rows.length === 0) {
                return res.status(400).json({ ok: false, error: "کاربری با این شماره یافت نشد. لطفا ابتدا ثبت‌نام کنید." });
            }
            const user = userRes.rows[0];
            const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
            
            return res.json({ ok: true, token, user });
        }

    } catch(err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

module.exports = router;
