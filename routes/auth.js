const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { query } = require("../db");

// تابع برای هش کردن رمز عبور (امن و بدون نیاز به نصب پکیج)
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

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

        // ذخیره رمز به صورت هش شده (امن)
        const hashedPassword = hashPassword(password);
        const newUser = await query(
            "INSERT INTO users (phone, username, password_hash, coins, created_at) VALUES ($1, $2, $3, 50, $4) RETURNING *",
            [phone, username, hashedPassword, Date.now()]
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
        const hashedInput = hashPassword(password);

        // 👇 منطق هوشمند برای ارتقای امنیت 👇
        if (user.password_hash === "otp" || user.password_hash === password) {
            // اگر کاربر قبلاً رمزش ساده بوده (otp یا متن ساده)، حالا رمزش رو هش می‌کنیم و ذخیره می‌کنیم
            await query("UPDATE users SET password_hash = $1 WHERE phone = $2", [hashedInput, phone]);
        } else if (user.password_hash !== hashedInput) {
            // اگر رمز هش شده بود ولی با رمز وارد شده مطابقت نداشت
            return res.status(400).json({ ok: false, error: "رمز اشتباه است" });
        }

        const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
        res.json({ ok: true, token, user });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
