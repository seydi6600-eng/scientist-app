const express = require("express");
const router = express.Router();
const { sendOTP } = require("./sms");
const { query } = require("./db");
const jwt = require("jsonwebtoken");

async function ensureOtpTable() {
    try {
        await query(`CREATE TABLE IF NOT EXISTS otp_codes (phone TEXT PRIMARY KEY, code TEXT, expires BIGINT)`);
    } catch(e) {}
}
ensureOtpTable();

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

router.post("/verify-otp", async (req, res) => {
    const { phone, code } = req.body;
    try {
        const result = await query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
        const record = result.rows[0];

        if (!record || Number(record.expires) < Date.now()) {
            return res.status(400).json({ ok: false, error: "کد منقضی شده" });
        }

        if (record.code === code) {
            await query("DELETE FROM otp_codes WHERE phone = $1", [phone]);
            
            // چک میکنیم آیا کاربر قبلا ثبت‌نام کرده یا نه
            const userRes = await query("SELECT * FROM users WHERE phone = $1", [phone]);
            
            if (userRes.rows.length > 0) {
                // کاربر وجود دارد -> ورود
                const user = userRes.rows[0];
                const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET || "secret_key", { expiresIn: '30d' });
                res.json({ ok: true, token: token, user: user, isNew: false });
            } else {
                // کاربر جدید است -> نیاز به ثبت‌نام
                res.json({ ok: true, isNew: true });
            }
        } else {
            res.status(400).json({ ok: false, error: "کد اشتباه" });
        }
    } catch(err) {
        res.status(500).json({ ok: false, error: "خطای دیتابیس" });
    }
});

module.exports = router;
