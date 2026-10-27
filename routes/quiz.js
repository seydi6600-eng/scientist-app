
const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { query } = require("../db");

const router = express.Router();

const auth = (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({ ok: false, error: "توکن ندارد" });
    }

    try {
        req.user = jwt.verify(
            header.slice(7),
            process.env.JWT_SECRET || "secret"
        );
        if (!req.user.phone) throw new Error("Invalid user");
        next();
    } catch {
        return res.status(401).json({ ok: false, error: "توکن نامعتبر" });
    }
};

const sessions = new Map();
const SESSION_MS = 60 * 60 * 1000;
const MAX_QUESTIONS = 20;

function loadQuestions(fileName) {
    if (
        typeof fileName !== "string" ||
        !/^[a-zA-Z0-9_-]+\.json$/.test(fileName)
    ) {
        throw new Error("Invalid question file");
    }

    const filePath = path.join(__dirname, "..", "questions", fileName);
    const root = path.resolve(__dirname, "..", "questions") + path.sep;

    if (!path.resolve(filePath).startsWith(root)) {
        throw new Error("Invalid question path");
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(data)) throw new Error("Invalid question data");

    return data.filter(q =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.answers) &&
        q.answers.length >= 2 &&
        Number.isInteger(q.correct) &&
        q.correct >= 0 &&
        q.correct < q.answers.length
    );
}

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function publicQuestion(q) {
    const order = shuffle(q.answers.map((_, i) => i));

    return {
        question: q.question,
        answers: order.map(i => q.answers[i]),
        correct: undefined,
        difficulty: q.difficulty || "medium",
        answerMap: order.map(i => i === q.correct)
    };
}

function cleanQuestion(q) {
    const { answerMap, ...visible } = q;
    return visible;
}

// شروع نشست بازی
router.post("/start", auth, async (req, res) => {
    try {
        const { fileName, difficulty = "medium" } = req.body || {};

        const user = await query(
            `SELECT phone, league_joined FROM users WHERE phone = $1`,
            [req.user.phone]
        );

        if (!user.rows.length) {
            return res.status(404).json({ ok: false, error: "کاربر یافت نشد" });
        }

        const all = loadQuestions(fileName);
        const allowedDifficulty = ["easy", "medium", "hard"].includes(difficulty)
            ? difficulty
            : "medium";

        const matching = all.filter(
            q => (q.difficulty || "medium") === allowedDifficulty
        );

        const pool = matching.length >= 5 ? matching : all;
        if (!pool.length) {
            return res.status(400).json({ ok: false, error: "سؤالی پیدا نشد" });
        }

        const questions = shuffle(pool).slice(
            0,
            Math.min(MAX_QUESTIONS, pool.length)
        );

        const id = crypto.randomUUID();

        sessions.set(id, {
            phone: req.user.phone,
            questions: questions.map(q => ({
                question: q.question,
                answers: q.answers,
                correct: q.correct,
                difficulty: q.difficulty || "medium"
            })),
            current: 0,
            score: 0,
            finished: false,
            expiresAt: Date.now() + SESSION_MS
        });

        return res.json({
            ok: true,
            sessionId: id,
            questions: questions.map(q => {
                const shuffled = publicQuestion(q);
                const { answerMap, ...visible } = shuffled;
                return { ...visible, answerMap: undefined };
            })
        });
    } catch (err) {
        console.error("Quiz start error:", err.message);
        return res.status(400).json({
            ok: false,
            error: "شروع بازی ناموفق بود"
        });
    }
});

// ثبت پاسخ هر سؤال
router.post("/answer", auth, async (req, res) => {
    try {
        const { sessionId, answerIndex } = req.body || {};
        const session = sessions.get(sessionId);

        if (
            !session ||
            session.phone !== req.user.phone ||
            session.finished ||
            session.expiresAt < Date.now()
        ) {
            return res.status(400).json({
                ok: false,
                error: "نشست بازی نامعتبر یا منقضی شده است"
            });
        }

        if (
            !Number.isSafeInteger(answerIndex) ||
            answerIndex < 0
        ) {
            return res.status(400).json({ ok: false, error: "پاسخ نامعتبر است" });
        }

        const q = session.questions[session.current];
        if (!q || answerIndex >= q.answers.length) {
            return res.status(400).json({ ok: false, error: "شماره گزینه نامعتبر است" });
        }

        const isCorrect = answerIndex === q.correct;
        if (isCorrect) session.score++;

        session.current++;

        return res.json({
            ok: true,
            correct: isCorrect,
            next: session.current,
            total: session.questions.length,
            score: session.score,
            complete: session.current === session.questions.length
        });
    } catch (err) {
        console.error("Quiz answer error:", err.message);
        return res.status(500).json({ ok: false, error: "ثبت پاسخ ناموفق بود" });
    }
});

// پایان نشست و ثبت امتیاز هفتگی
router.post("/finish", auth, async (req, res) => {
    const session = sessions.get(req.body?.sessionId);

    if (
        !session ||
        session.phone !== req.user.phone ||
        session.finished ||
        session.expiresAt < Date.now()
    ) {
        return res.status(400).json({
            ok: false,
            error: "نشست بازی نامعتبر یا قبلاً ثبت شده است"
        });
    }

    if (session.current !== session.questions.length) {
        return res.status(400).json({
            ok: false,
            error: "هنوز به همه سؤال‌ها پاسخ داده نشده است"
        });
    }

    session.finished = true;

    try {
        const result = await query(
            `UPDATE users
             SET weekly_league_points =
                 COALESCE(weekly_league_points, 0) + $1
             WHERE phone = $2
               AND COALESCE(league_joined, false) = true
             RETURNING weekly_league_points`,
            [session.score, session.phone]
        );

        sessions.delete(req.body.sessionId);

        return res.json({
            ok: true,
            score: session.score,
            weeklyPoints: result.rows[0]?.weekly_league_points ?? null
        });
    } catch (err) {
        session.finished = false;
        console.error("Quiz finish error:", err.message);
        return res.status(500).json({
            ok: false,
            error: "ثبت نتیجه ناموفق بود"
        });
    }
});

module.exports = router;

