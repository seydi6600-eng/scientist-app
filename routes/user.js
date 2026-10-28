// routes/user.js — مدیریت کاربران
const express = require("express");
const { query } = require("../db");

// 👇 اینجا از اسم auth استفاده می‌کنیم تا مطمئن شویم لوکال و گلوبال با هم قاطی نمی‌شوند
const { authMiddleware: auth } = require("../middleware/auth");

const router = express.Router();

// —— گرفتن اطلاعات کاربر ——
router.get("/get", auth, async (req, res) => {
    try {
        const phone = req.user.phone;
        const result = await query(
            `SELECT phone, username, avatar, xp, level, coins, 
                    games_played, correct_answers, wrong_answers, best_score, 
                    league_id, league_wins, online_wins, online_games, 
                    online_best_score, category_stats, vip_avatars, honors, 
                    subscription_until, subscription_type, last_daily_heart_claim, 
                    items, transactions, weekly_league_points, league_joined 
             FROM users 
             WHERE phone = $1`,
            [phone]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "کاربر پیدا نشد" });
        }

        return res.json({ ok: true, user: result.rows[0] });
    } catch (err) {
        console.error("User get error:", err.message);
        return res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// —— به‌روزرسانی اطلاعات کاربر ——
router.post("/update", auth, async (req, res) => {
    try {
        const phone = req.user.phone;
        const updates = req.body.updates || {};

        // فیلدهای مجاز برای آپدیت
        const allowedKeys = [
            "games_played", "correct_answers", "wrong_answers", "best_score",
            "league_wins", "online_wins", "online_games", "online_best_score",
            "league_id", "vip_avatars", "category_stats", "last_daily_heart_claim",
            "subscription_until", "subscription_type", "items",
            "weekly_league_points", "league_joined"
        ];

        const setClauses = [];
        const values = [];
        let index = 1;

        for (const key of Object.keys(updates)) {
            if (!allowedKeys.includes(key)) continue;

            setClauses.push(`${key} = $${index}`);
            // برای فیلدهای JSONB باید به رشته تبدیل شوند
            if (["vip_avatars", "category_stats", "items"].includes(key)) {
                values.push(JSON.stringify(updates[key]));
            } else {
                values.push(updates[key]);
            }
            index++;
        }

        if (setClauses.length === 0) {
            return res.json({ ok: true, message: "هیچ تغییری اعمال نشد" });
        }

        const queryText = `UPDATE users SET ${setClauses.join(", ")} WHERE phone = $${index}`;
        values.push(phone);

        await query(queryText, values);

        return res.json({ ok: true });
    } catch (err) {
        console.error("User update error:", err.message);
        return res.status(500).json({ ok: false, error: "خطا در به‌روزرسانی" });
    }
});

module.exports = router;
