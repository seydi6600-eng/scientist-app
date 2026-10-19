const { sendOTP } = require('./sms');
const otpStore = {};

function setupSmsRoutes(app, query) {
    app.post("/api/send-otp", async (req, res) => {
        const { phone } = req.body;
        if (!phone || !/^09\d{9}$/.test(phone)) return res.status(400).json({ ok: false, error: "شماره معتبر نیست" });
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const result = await sendOTP(phone, code);
        if (result.ok) {
            otpStore[phone] = { code, expires: Date.now() + 120000 };
            res.json({ ok: true });
        } else {
            res.status(500).json({ ok: false, error: result.error });
        }
    });

    app.post("/api/verify-otp", async (req, res) => {
        const { phone, code } = req.body;
        const record = otpStore[phone];
        if (!record || record.expires < Date.now()) return res.status(400).json({ ok: false, error: "کد منقضی شده" });
        if (record.code === code) {
            delete otpStore[phone];
            try {
                await query(`CREATE TABLE IF NOT EXISTS verified_phones (phone TEXT PRIMARY KEY, verified_at BIGINT)`);
                await query("INSERT INTO verified_phones (phone, verified_at) VALUES ($1, $2) ON CONFLICT (phone) DO UPDATE SET verified_at = $2", [phone, Date.now()]);
            } catch(e) {}
            res.json({ ok: true, message: "شماره تایید شد" });
        } else {
            res.status(400).json({ ok: false, error: "کد اشتباه" });
        }
    });
}

module.exports = { setupSmsRoutes };
