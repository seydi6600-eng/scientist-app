
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../db");

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            error: "توکن ندارد"
        });
    }

    try {
        req.user = jwt.verify(
            authHeader.slice(7),
            process.env.JWT_SECRET || "secret"
        );

        if (!req.user.phone) {
            return res.status(401).json({
                ok: false,
                error: "اطلاعات کاربر معتبر نیست"
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            ok: false,
            error: "توکن نامعتبر"
        });
    }
};

// دریافت وضعیت لیگ و جدول رتبه‌بندی
router.get("/state", auth, async (req, res) => {
    try {
        const userRes = await query(
            `SELECT league_id, league_joined, weekly_league_points
             FROM users WHERE phone = $1`,
            [req.user.phone]
        );

        if (!userRes.rows.length) {
            return res.status(404).json({
                ok: false,
                error: "کاربر یافت نشد"
            });
        }

        const user = userRes.rows[0];

        if (!user.league_joined) {
            return res.json({
                ok: true,
                state: {
                    joined: false,
                    leagueId: 3,
                    players: []
                }
            });
        }

        const playersRes = await query(
            `SELECT username, avatar, weekly_league_points
             FROM users
             WHERE league_id = $1 AND league_joined = true
             ORDER BY weekly_league_points DESC, username ASC
             LIMIT 50`,
            [user.league_id]
        );

        const rankRes = await query(
            `SELECT COUNT(*)::int + 1 AS rank
             FROM users
             WHERE league_id = $1
               AND league_joined = true
               AND weekly_league_points > $2`,
            [user.league_id, user.weekly_league_points || 0]
        );

        return res.json({
            ok: true,
            state: {
                joined: true,
                leagueId: user.league_id,
                weeklyPoints: user.weekly_league_points || 0,
                rank: rankRes.rows[0].rank,
                players: playersRes.rows
            }
        });
    } catch (err) {
        console.error("League state error:", err.message);
        return res.status(500).json({
            ok: false,
            error: "خطا در دریافت وضعیت لیگ"
        });
    }
});

// ثبت‌نام در دسته سه
router.post("/join", auth, async (req, res) => {
    try {
        const result = await query(
            `UPDATE users
             SET league_id = 3,
                 league_joined = true,
                 weekly_league_points = 0
             WHERE phone = $1 AND COALESCE(league_joined, false) = false
             RETURNING phone`,
            [req.user.phone]
        );

        if (!result.rows.length) {
            return res.status(409).json({
                ok: false,
                error: "کاربر عضو لیگ است یا پیدا نشد"
            });
        }

        return res.json({
            ok: true,
            leagueId: 3,
            message: "ثبت‌نام در دسته سه انجام شد"
        });
    } catch (err) {
        console.error("League join error:", err.message);
        return res.status(500).json({
            ok: false,
            error: "خطا در ثبت‌نام لیگ"
        });
    }
});

module.exports = router;
