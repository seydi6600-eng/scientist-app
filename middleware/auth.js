// middleware/auth.js — چک JWT
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ ok: false, error: "توکن نامعتبر" });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            phone: decoded.phone,
            username: decoded.username,
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ ok: false, error: "توکن منقضی شده" });
        }
        return res.status(401).json({ ok: false, error: "توکن نامعتبر" });
    }
}

function generateToken(user) {
    return jwt.sign(
        {
            phone: user.phone,
            username: user.username,
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );
}

module.exports = {
    authMiddleware,
    generateToken,
    JWT_SECRET,
};
