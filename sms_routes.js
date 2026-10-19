const express = require("express");
const router = express.Router();
const { sendOTP } = require("./sms");
const { query } = require("./db");

// ساخت جدول ذخیره کدهای پیامک در دیتابیس
async function ensureOtpTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                phone TEXT PRIMARY KEY,
                code TEXT,
                expires BIGINT
            )
        `);
    } catch(e) { console.error("OTP table error:", e); }
}
ensureOtpTable();

router.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^09\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: "شماره معتبر نیست" });
    
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const result = await sendOTP(phone, code);

    if (result.ok) {
        try {
            // ذخیره کد در دیتابیس
            await query(
                "INSERT INTO otp_codes (phone, code, expires) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires = $3",
                [phone, code, Date.now() + 120000]
            );
            res.json({ ok: true });
        } catch(err) {
            console.error("Save OTP Error:", err);
            res.status(500).json({ ok: false, error: "خطای دیتابیس" });
        }
    } else {
        res.status(500).json({ ok: false, error: result.error });
    }
});

router.post("/verify-otp", async (req, res) => {
    const { phone, code } = req.body;
    try {
        // خواندن کد از دیتابیس
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];

        if (!record || Number(record.expires) < Date.now()) {
            return res.status(400).json({ ok: false, error: "کد منقضی شده" });
        }

        if (record.code === code) {
            // پاک کردن کد بعد از استفاده موفق
            await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
            res.json({ ok: true, message: "شماره تایید شد" });
        } else {
            res.status(400).json({ ok: false, error: "کد اشتباه" });
        }
    } catch(err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ ok: false, error: "خطای دیتابیس" });
    }
});

module.exports = router;
