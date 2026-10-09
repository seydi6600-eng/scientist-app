// routes/user.js — اطلاعات کاربر
const express = require("express");
const { query } = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/get", authMiddleware, async (req, res) => {
    try {
        const result = await query(
            `SELECT phone, username, avatar, xp, level, coins,
                    games_played, correct_answers, wrong_answers, best_score,
                    league_id, league_wins, online_wins,
                    category_stats, vip_avatars, honors,
                    subscription_until, subscription_type,
                    last_daily_heart_claim
             FROM users WHERE phone = $1`,
            [req.user.phone]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "کاربر پیدا نشد" });
        }

        res.json({ ok: true, user: result.rows[0] });
    } catch (err) {
        console.error("User get error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

router.post("/update", authMiddleware, async (req, res) => {
    try {
        const { updates } = req.body;
        if (!updates || typeof updates !== "object") {
            return res.status(400).json({ ok: false, error: "اطلاعات نامعتبر" });
        }

        const allowedFields = [
            "avatar", "xp", "level", "coins",
            "games_played", "correct_answers", "wrong_answers", "best_score",
            "league_id", "league_wins", "online_wins",
            "category_stats", "vip_avatars", "honors",
            "subscription_until", "subscription_type",
            "last_daily_heart_claim",
        ];

        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        for (const key of Object.keys(updates)) {
            if (allowedFields.indexOf(key) === -1) continue;
            const val = updates[key];
            if (val === undefined) continue;

            if (["category_stats", "vip_avatars", "honors"].indexOf(key) !== -1) {
                setClauses.push(`${key} = $${paramIndex}::jsonb`);
                values.push(JSON.stringify(val));
            } else {
                setClauses.push(`${key} = $${paramIndex}`);
                values.push(val);
            }
            paramIndex++;
        }

        if (setClauses.length === 0) {
            return res.json({ ok: true, updated: 0 });
        }

        values.push(req.user.phone);
        const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE phone = $${paramIndex}`;
        await query(sql, values);

        res.json({ ok: true, updated: setClauses.length });
    } catch (err) {
        console.error("User update error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

module.exports = router;
