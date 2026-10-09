// routes/auth.js — ثبت‌نام و ورود
const express = require("express");
const bcrypt = require("bcryptjs");
const { query } = require("../db");
const { generateToken } = require("../middleware/auth");

const router = express.Router();

function normalizePhone(phone) {
    if (!phone) return "";
    let p = String(phone).trim().replace(/[\s\-\(\)]/g, "");
    p = p.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    if (p.startsWith("+98")) p = "0" + p.slice(3);
    if (p.startsWith("0098")) p = "0" + p.slice(4);
    if (p.startsWith("98") && p.length === 12) p = "0" + p.slice(2);
    return p;
}

function isValidIranianPhone(phone) {
    return /^09\d{9}$/.test(normalizePhone(phone));
}

function isValidUsername(username) {
    if (!username || typeof username !== "string") return false;
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 15) return false;
    if (!/^[a-zA-Z0-9_\u0600-\u06FF\u200c]+$/.test(trimmed)) return false;
    if (/\s/.test(trimmed)) return false;
    const letters = trimmed.match(/[a-zA-Z\u0600-\u06FF]/g) || [];
    if (letters.length < 2) return false;
    return true;
}

router.post("/register", async (req, res) => {
    try {
        const { phone, username, password } = req.body;

        if (!isValidIranianPhone(phone)) {
            return res.status(400).json({ ok: false, error: "شماره موبایل معتبر نیست" });
        }
        if (!isValidUsername(username)) {
            return res.status(400).json({ ok: false, error: "نام کاربری معتبر نیست (۳-۱۵ کاراکتر)" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ ok: false, error: "رمز حداقل ۶ کاراکتر" });
        }

        const normalizedPhone = normalizePhone(phone);

        const existing = await query(
            "SELECT phone FROM users WHERE phone = $1 OR username = $2",
            [normalizedPhone, username.trim()]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ ok: false, error: "شماره یا نام کاربری قبلاً ثبت شده" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await query(
            `INSERT INTO users (phone, username, password_hash, avatar, xp, level, coins, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING phone, username, avatar, xp, level, coins, created_at`,
            [normalizedPhone, username.trim(), passwordHash, "👨", 0, 1, 50, Date.now()]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.json({
            ok: true,
            token,
            user: {
                phone: user.phone,
                username: user.username,
                avatar: user.avatar,
                xp: user.xp,
                level: user.level,
                coins: user.coins,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ ok: false, error: "شماره و رمز لازمه" });
        }

        const normalizedPhone = normalizePhone(phone);
        const result = await query(
            "SELECT * FROM users WHERE phone = $1",
            [normalizedPhone]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "کاربر پیدا نشد" });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ ok: false, error: "رمز اشتباهه" });
        }

        const token = generateToken(user);

        res.json({
            ok: true,
            token,
            user: {
                phone: user.phone,
                username: user.username,
                avatar: user.avatar,
                xp: user.xp,
                level: user.level,
                coins: user.coins,
                league_id: user.league_id || "division3",
                vip_avatars: user.vip_avatars || [],
                honors: user.honors || [],
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

module.exports = router;
