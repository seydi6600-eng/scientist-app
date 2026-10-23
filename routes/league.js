const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../db");

// میدلور برای چک کردن توکن
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ ok: false, error: "توکن ندارد" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, error: "توکن نامعتبر" });
    }
};

// دریافت وضعیت لیگ و جدول رده‌بندی
router.get("/state", auth, async (req, res) => {
    try {
        const phone = req.user.phone;
        
        // اطلاعات کاربر رو بگیر
        const userRes = await query("SELECT league_id, league_joined FROM users WHERE phone = $1", [phone]);
        if (userRes.rows.length === 0) return res.status(404).json({ ok: false, error: "کاربر یافت نشد" });
        
        const user = userRes.rows[0];
        
        // اگر کاربر عضو لیگ نیست، فقط یه پیغام بده
        if (!user.league_joined) {
            return res.json({ ok: true, state: { joined: false } });
        }

        // اگر عضو لیگه، لیست بازیکنان همون لیگ رو بر اساس امتیاز بفرست
        const playersRes = await query(
            "SELECT phone, username, avatar, weekly_league_points FROM users WHERE league_id = $1 AND league_joined = true ORDER BY weekly_league_points DESC LIMIT 50",
            [user.league_id]
        );

        res.json({ 
            ok: true, 
            state: { 
                joined: true, 
                leagueId: user.league_id, 
                players: playersRes.rows 
            } 
        });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ثبت‌نام در لیگ
router.post("/join", auth, async (req, res) => {
    try {
        const phone = req.user.phone;
        const { leagueId } = req.body;
        
        if (!leagueId) return res.status(400).json({ ok: false, error: "شناسه لیگ مشخص نیست" });

        // کاربر رو عضو لیگ کن
        await query(
            "UPDATE users SET league_id = $1, league_joined = true, weekly_league_points = 0 WHERE phone = $2",
            [leagueId, phone]
        );

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
