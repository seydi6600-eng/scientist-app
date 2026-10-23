const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../db");

// مسیر ثبت‌نام (Register)
router.post("/register", async (req, res) => {
    const { phone, username, password } = req.body;
    if (!phone || !username || !password) {
        return res.status(400).json({ ok: false, error: "همه فیلدها الزامی است" });
    }
    try {
        const checkUser = await query("SELECT * FROM users WHERE phone = $1 OR username = $2", [phone, username]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ ok: false, error: "شماره یا نام کاربری تکراری است" });
        }

        // ذخیره رمز به صورت ساده (برای هماهنگی با سیستم OTP)
        const newUser = await query(
            "INSERT INTO users (phone, username, password_hash, coins, created_at) VALUES ($1, $2, $3, 50, $4) RETURNING *",
            [phone, username, password, Date.now()]
        );

        const user = newUser.rows[0];
        const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
        res.json({ ok: true, token, user });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// مسیر ورود (Login)
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.status(400).json({ ok: false, error: "شماره و رمز الزامی است" });
    }

    try {
        const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ ok: false, error: "کاربر یافت نشد" });
        }

        const user = userRes.rows[0];

        // 👇 منطق حل مشکل رمز 👇
        if (user.password_hash === "otp") {
            // اگر رمز کاربر 'otp' بود (ثبت‌نام پیامکی)، رمز جدیدی که الان زده رو ذخیره کن
            await query("UPDATE users SET password_hash = $1 WHERE phone = $2", [password, phone]);
            user.password_hash = password;
        } else if (user.password_hash !== password) {
            // اگر رمز معمولی بود و اشتباه زده شد
            return res.status(400).json({ ok: false, error: "رمز اشتباه است" });
        }

        const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
        res.json({ ok: true, token, user });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
