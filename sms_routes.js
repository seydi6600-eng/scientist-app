const express = require("express");
const router = express.Router();
const { sendOTP } = require("./sms");
const { query } = require("./db");
const jwt = require("jsonwebtoken");

// ===== ۱. ساخت جدول در صورت نبود =====
async function ensureTable() {
    try {
        await query(`CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, expires BIGINT)`);
    } catch(e) { 
        console.error("OTP Table Error:", e.message); 
    }
}
ensureTable();

// ===== ۲. مسیر ارسال کد پیامک =====
router.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    
    // اعتبارسنجی شماره
    if (!phone || !/^09\d{9}$/.test(phone)) {
        return res.status(400).json({ ok: false, error: "شماره معتبر نیست" });
    }
    
    // تولید کد ۵ رقمی
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    // ارسال پیامک با تابع ملی پیامک
    const result = await sendOTP(phone, code);

    if (result.ok) {
        try {
            // ذخیره کد در دیتابیس با اعتبار ۲ دقیقه
            await query(
                "INSERT INTO otp_codes (phone, code, expires) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires = $3", 
                [phone, code, Date.now() + 120000]
            );
            res.json({ ok: true });
        } catch(err) {
            console.error("Save OTP Error:", err.message);
            res.status(500).json({ ok: false, error: "خطای دیتابیس" });
        }
    } else {
        res.status(500).json({ ok: false, error: result.error || "خطا در ارسال پیامک" });
    }
});

// ===== ۳. مسیر تایید کد و لاگین/ثبت‌نام =====
router.post("/verify-otp", async (req, res) => {
    const { phone, code, actionType } = req.body;
    
    try {
        // خواندن کد از دیتابیس
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];

        // چک کردن اینکه کد وجود داره یا منقضی شده
        if (!record || Number(record.expires) < Date.now()) {
            return res.status(400).json({ ok: false, error: "کد منقضی شده یا ارسال نشده است" });
        }

        // چک کردن صحت کد
        if (record.code !== code) {
            return res.status(400).json({ ok: false, error: "کد وارد شده اشتباه است" });
        }

        // اگر کد درست بود، از دیتابیس پاکش کن
        await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);

        // چک کردن اینکه آیا کاربر قبلا ثبت‌نام کرده یا نه
        const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);

        if (actionType === "register") {
            if (userRes.rows.length > 0) {
                return res.status(400).json({ ok: false, error: "این شماره قبلا ثبت‌نام کرده است. لطفا از دکمه ورود استفاده کنید" });
            }
            
            // ساخت کاربر جدید (چون در پیامک نام کاربری نداریم، یک نام پیش‌فرض می‌سازیم)
            const defaultUsername = "user_" + phone.slice(-4) + Math.floor(Math.random() * 1000);
            const newUser = await query(
                `INSERT INTO users (phone, username, password_hash, avatar, coins, created_at) VALUES ($1, $2, $3, '👨', 50, $4) RETURNING *`,
                [phone, defaultUsername, "otp_login", Date.now()]
            );
            const user = newUser.rows[0];
            const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
            
            return res.json({ ok: true, token: token, user: user });

        } else {
            // ورود با پیامک (کاربر باید از قبل وجود داشته باشه)
            if (userRes.rows.length === 0) {
                return res.status(400).json({ ok: false, error: "کاربری با این شماره یافت نشد. لطفا ابتدا ثبت‌نام کنید." });
            }
            const user = userRes.rows[0];
            const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
            
            return res.json({ ok: true, token: token, user: user });
        }

    } catch(err) {
        console.error("Verify OTP Error:", err.message);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

module.exports = router;
