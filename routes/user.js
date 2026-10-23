// routes/user.js — مدیریت کاربران
const express = require("express");
const { query } = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// ─── گرفتن اطلاعات کاربر ───
router.get("/get", authMiddleware, async (req, res) => {
    try {
        const phone = req.user.phone;
        const result = await query(
            `SELECT phone, username, avatar, xp, level, coins,
                    games_played, correct_answers, wrong_answers, best_score,
                    league_id, league_wins, online_wins, online_games, online_best_score,
                    category_stats, vip_avatars, honors, items, transactions,
                    subscription_until, subscription_type, last_daily_heart_claim,
                    league_joined, weekly_league_points
             FROM users WHERE phone = $1`,
            [phone]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "کاربر پیدا نشد" });
        }

        const u = result.rows[0];
        res.json({
            ok: true,
            user: {
                phone: u.phone,
                username: u.username,
                avatar: u.avatar,
                xp: u.xp,
                level: u.level,
                coins: u.coins,
                gamesPlayed: u.games_played,
                correctAnswers: u.correct_answers,
                wrongAnswers: u.wrong_answers,
                bestScore: u.best_score,
                leagueId: u.league_id,
                leagueWins: u.league_wins,
                onlineWins: u.online_wins,
                onlineGames: u.online_games,
                onlineBestScore: u.online_best_score,
                categoryStats: u.category_stats || {},
                vipAvatars: u.vip_avatars || [],
                honors: u.honors || [],
                items: u.items || {},
                transactions: u.transactions || [],
                subscriptionUntil: u.subscription_until || 0,
                subscriptionType: u.subscription_type || null,
                lastDailyHeartClaim: u.last_daily_heart_claim || 0,
                leagueJoined: u.league_joined || false,
                weeklyLeaguePoints: u.weekly_league_points || 0
            }
        });
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── آپدیت اطلاعات کاربر ───
router.post("/update", authMiddleware, async (req, res) => {
    try {
        const phone = req.user.phone;
        const updates = req.body.updates || {};

        const allowedFields = [
            "avatar", "xp", "level", "coins",
            "games_played", "correct_answers", "wrong_answers", "best_score",
            "league_id", "league_wins", "online_wins", "online_games", "online_best_score",
            "category_stats", "vip_avatars", "honors", "items", "transactions",
            "subscription_until", "subscription_type", "last_daily_heart_claim",
            "username", "league_joined", "weekly_league_points"
        ];

        const sets = [];
        const values = [];
        let idx = 1;

        // فیلدهایی که توی دیتابیس از نوع JSONB هستن و باید به رشته تبدیل بشن
        const jsonbFields = ["category_stats", "vip_avatars", "honors", "items", "transactions"];

        for (const key of Object.keys(updates)) {
            if (!allowedFields.includes(key)) continue;
            
            sets.push(`${key} = $${idx}`);
            
            if (jsonbFields.includes(key)) {
                // تبدیل به رشته برای جلوگیری از خطای دیتابیس
                values.push(JSON.stringify(updates[key])); 
            } else {
                values.push(updates[key]);
            }
            idx++;
        }

        if (sets.length === 0) {
            return res.json({ ok: true, message: "چیزی برای آپدیت نبود" });
        }

        values.push(phone);
        await query(
            `UPDATE users SET ${sets.join(", ")} WHERE phone = $${idx}`,
            values
        );

        res.json({ ok: true });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ ok: false, error: err.message }); // نمایش خطای واقعی برای دیباگ
    }
});

module.exports = router;
