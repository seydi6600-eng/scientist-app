const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pool } = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const SESSION_MS = 30 * 60 * 1000;
const QUESTION_COUNT = 10;

function validFileName(name) {
    return (
        typeof name === "string" &&
        /^[a-zA-Z0-9_-]+\.json$/.test(name)
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

function loadQuestions(fileName) {
    if (!validFileName(fileName)) {
        throw new Error("Invalid question file");
    }

    const questionsDir = path.resolve(__dirname, "../questions");
    const filePath = path.resolve(questionsDir, fileName);

    if (!filePath.startsWith(questionsDir + path.sep)) {
        throw new Error("Invalid question path");
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
        throw new Error("Invalid question data");
    }

    const valid = data.filter(q =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.answers) &&
        q.answers.length >= 2 &&
        q.answers.every(a => typeof a === "string") &&
        Number.isInteger(q.correct) &&
        q.correct >= 0 &&
        q.correct < q.answers.length
    );

    if (valid.length === 0) {
        throw new Error("No valid questions");
    }

    return valid;
}

function prepareQuestion(q) {
    const order = shuffle(q.answers.map((_, i) => i));

    return {
        question: q.question,
        answers: order.map(i => q.answers[i]),
        correct: order.indexOf(q.correct),
        difficulty: q.difficulty || "medium"
    };
}

function publicQuestion(q) {
    return {
        question: q.question,
        answers: q.answers,
        difficulty: q.difficulty
    };
}

async function ensureTables(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS quiz_sessions (
            session_id UUID PRIMARY KEY,
            phone TEXT NOT NULL,
            questions JSONB NOT NULL,
            current_index INTEGER NOT NULL DEFAULT 0,
            score INTEGER NOT NULL DEFAULT 0,
            expires_at TIMESTAMPTZ NOT NULL,
            finished_at TIMESTAMPTZ,
            awarded_points INTEGER NOT NULL DEFAULT 0
        )
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS quiz_answers (
            session_id UUID NOT NULL REFERENCES quiz_sessions(session_id)
                ON DELETE CASCADE,
            question_index INTEGER NOT NULL,
            answer_index INTEGER NOT NULL,
            is_correct BOOLEAN NOT NULL,
            PRIMARY KEY (session_id, question_index)
        )
    `);
}

// شروع بازی
router.post("/start", auth, async (req, res) => {
    const client = await pool.connect();

    try {
        const { fileName, difficulty } = req.body || {};

        const questions = loadQuestions(fileName);

        const chosen = shuffle(
            questions.filter(q =>
                !difficulty || q.difficulty === difficulty
            )
        ).slice(0, QUESTION_COUNT);

        if (chosen.length === 0) {
            return res.status(400).json({
                ok: false,
                error: "برای این سطح سؤالی پیدا نشد"
            });
        }

        const prepared = chosen.map(prepareQuestion);
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + SESSION_MS);

        await ensureTables(client);

        await client.query(
            `INSERT INTO quiz_sessions
                (session_id, phone, questions, current_index, score, expires_at)
             VALUES ($1, $2, $3::jsonb, 0, 0, $4)`,
            [
                sessionId,
                req.user.phone,
                JSON.stringify(prepared),
                expiresAt
            ]
        );

        return res.json({
            ok: true,
            sessionId,
            questions: prepared.map(publicQuestion)
        });
    } catch (err) {
        console.error("Quiz start error:", err.message);
        return res.status(400).json({
            ok: false,
            error: "شروع بازی ناموفق بود"
        });
    } finally {
        client.release();
    }
});

// ثبت پاسخ
router.post("/answer", auth, async (req, res) => {
    const client = await pool.connect();

    try {
        const { sessionId, questionIndex, answerIndex } = req.body || {};

        if (
            typeof sessionId !== "string" ||
            !Number.isSafeInteger(questionIndex) ||
            questionIndex < 0 ||
            !Number.isSafeInteger(answerIndex) ||
            answerIndex < -1
        ) {
            return res.status(400).json({
                ok: false,
                error: "اطلاعات پاسخ نامعتبر است"
            });
        }

        await ensureTables(client);
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT *
             FROM quiz_sessions
             WHERE session_id = $1 AND phone = $2
             FOR UPDATE`,
            [sessionId, req.user.phone]
        );

        const session = result.rows[0];

        if (!session) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                ok: false,
                error: "نشست بازی پیدا نشد"
            });
        }

        if (
            session.finished_at ||
            new Date(session.expires_at).getTime() < Date.now()
        ) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                ok: false,
                error: "نشست بازی پایان یافته یا منقضی شده است"
            });
        }

        const existing = await client.query(
            `SELECT is_correct
             FROM quiz_answers
             WHERE session_id = $1 AND question_index = $2`,
            [sessionId, questionIndex]
        );

        if (existing.rows.length > 0) {
            await client.query("COMMIT");
            return res.json({
                ok: true,
                correct: existing.rows[0].is_correct,
                duplicate: true,
                next: session.current_index,
                total: session.questions.length,
                score: session.score,
                complete: session.current_index === session.questions.length
            });
        }

        if (questionIndex !== session.current_index) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                ok: false,
                error: "ترتیب پاسخ‌ها نامعتبر است"
            });
        }

        const q = session.questions[questionIndex];

        if (!q || (answerIndex !== -1 && answerIndex >= q.answers.length)) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                ok: false,
                error: "شماره گزینه نامعتبر است"
            });
        }

        const isCorrect = answerIndex >= 0 && answerIndex === q.correct;
        const newScore = session.score + (isCorrect ? 1 : 0);
        const next = session.current_index + 1;

        await client.query(
            `INSERT INTO quiz_answers
                (session_id, question_index, answer_index, is_correct)
             VALUES ($1, $2, $3, $4)`,
            [sessionId, questionIndex, answerIndex, isCorrect]
        );

        await client.query(
            `UPDATE quiz_sessions
             SET current_index = $2, score = $3
             WHERE session_id = $1`,
            [sessionId, next, newScore]
        );

        await client.query("COMMIT");

        return res.json({
            ok: true,
            correct: isCorrect,
            next,
            total: session.questions.length,
            score: newScore,
            complete: next === session.questions.length
        });
    } catch (err) {
        try {
            await client.query("ROLLBACK");
        } catch (_) {}

        console.error("Quiz answer error:", err.message);
        return res.status(500).json({
            ok: false,
            error: "ثبت پاسخ ناموفق بود"
        });
    } finally {
        client.release();
    }
});

// راهنما
router.post("/hint", auth, async (req, res) => {
    const client = await pool.connect();
    let inTransaction = false;

    try {
        const { sessionId, questionIndex } = req.body || {};

        if (
            typeof sessionId !== "string" ||
            !Number.isSafeInteger(questionIndex) ||
            questionIndex < 0
        ) {
            return res.status(400).json({
                ok: false,
                error: "اطلاعات راهنما نامعتبر است"
            });
        }

        await ensureTables(client);
        await client.query("BEGIN");
        inTransaction = true;

        const result = await client.query(
            `SELECT *
             FROM quiz_sessions
             WHERE session_id = $1 AND phone = $2
             FOR UPDATE`,
            [sessionId, req.user.phone]
        );

        const session = result.rows[0];

        if (
            !session ||
            session.finished_at ||
            new Date(session.expires_at).getTime() < Date.now() ||
            questionIndex !== session.current_index
        ) {
            await client.query("ROLLBACK");
            inTransaction = false;
            return res.status(400).json({
                ok: false,
                error: "این راهنما در دسترس نیست"
            });
        }

        const answered = await client.query(
            `SELECT 1 FROM quiz_answers
             WHERE session_id = $1 AND question_index = $2`,
            [sessionId, questionIndex]
        );

        if (answered.rows.length > 0) {
            await client.query("ROLLBACK");
            inTransaction = false;
            return res.status(400).json({
                ok: false,
                error: "این سؤال قبلاً پاسخ داده شده است"
            });
        }

        const q = session.questions[questionIndex];

        if (
            !q ||
            !Array.isArray(q.answers) ||
            !Number.isSafeInteger(q.correct) ||
            q.correct < 0 ||
            q.correct >= q.answers.length ||
            q.answers.length < 3
        ) {
            await client.query("ROLLBACK");
            inTransaction = false;
            return res.status(400).json({
                ok: false,
                error: "سؤال برای استفاده از راهنما معتبر نیست"
            });
        }

        const userResult = await client.query(
            `SELECT items FROM users WHERE phone = $1 FOR UPDATE`,
            [req.user.phone]
        );

        if (!userResult.rows[0]) {
            await client.query("ROLLBACK");
            inTransaction = false;
            return res.status(404).json({
                ok: false,
                error: "کاربر پیدا نشد"
            });
        }

        const items = userResult.rows[0].items || {};
        const count = Number(items.removeTwo) || 0;

        if (count < 1) {
            await client.query("ROLLBACK");
            inTransaction = false;
            return res.status(400).json({
                ok: false,
                error: "آیتم حذف دو گزینه را نداری"
            });
        }

        const wrongIndices = q.answers
            .map((_, index) => index)
            .filter(index => index !== q.correct);

        const wrongOptions = shuffle(wrongIndices).slice(0, 2);

        const updatedItems = {
            ...items,
            removeTwo: count - 1
        };

        await client.query(
            `UPDATE users SET items = $1::jsonb WHERE phone = $2`,
            [JSON.stringify(updatedItems), req.user.phone]
        );

        await client.query("COMMIT");
        inTransaction = false;

        return res.json({
            ok: true,
            questionIndex,
            wrongIndices: wrongOptions,
            remaining: count - 1
        });
    } catch (err) {
        if (inTransaction) {
            try {
                await client.query("ROLLBACK");
            } catch (_) {}
        }

        console.error("Quiz hint error:", err.message);

        return res.status(500).json({
            ok: false,
            error: "استفاده از راهنما ناموفق بود"
        });
    } finally {
        client.release();
    }
});

// پایان بازی
router.post("/finish", auth, async (req, res) => {
    const client = await pool.connect();

    try {
        const { sessionId } = req.body || {};

        if (typeof sessionId !== "string") {
            return res.status(400).json({
                ok: false,
                error: "شناسه بازی نامعتبر است"
            });
        }

        await ensureTables(client);
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT *
             FROM quiz_sessions
             WHERE session_id = $1 AND phone = $2
             FOR UPDATE`,
            [sessionId, req.user.phone]
        );

        const session = result.rows[0];

        if (!session) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                ok: false,
                error: "نشست بازی پیدا نشد"
            });
        }

        if (session.finished_at) {
            await client.query("COMMIT");
            return res.json({
                ok: true,
                alreadyFinished: true,
                score: session.score,
                awardedPoints: session.awarded_points
            });
        }

        if (new Date(session.expires_at).getTime() < Date.now()) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                ok: false,
                error: "زمان بازی به پایان رسیده است"
            });
        }

        if (session.current_index !== session.questions.length) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                ok: false,
                error: "هنوز به همه سؤال‌ها پاسخ نداده‌اید"
            });
        }

        const userResult = await client.query(
            `SELECT league_joined
             FROM users
             WHERE phone = $1
             FOR UPDATE`,
            [req.user.phone]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                ok: false,
                error: "کاربر پیدا نشد"
            });
        }

        const joined = userResult.rows[0].league_joined === true;
        const awardedPoints = joined ? session.score : 0;

        if (awardedPoints > 0) {
            await client.query(
                `UPDATE users
                 SET weekly_league_points =
                     COALESCE(weekly_league_points, 0) + $2
                 WHERE phone = $1 AND league_joined = true`,
                [req.user.phone, awardedPoints]
            );
        }

        await client.query(
            `UPDATE quiz_sessions
             SET finished_at = NOW(), awarded_points = $2
             WHERE session_id = $1`,
            [sessionId, awardedPoints]
        );

        await client.query("COMMIT");

        return res.json({
            ok: true,
            score: session.score,
            awardedPoints,
            joinedLeague: joined
        });
    } catch (err) {
        try {
            await client.query("ROLLBACK");
        } catch (_) {}

        console.error("Quiz finish error:", err.message);
        return res.status(500).json({
            ok: false,
            error: "پایان بازی ناموفق بود"
        });
    } finally {
        client.release();
    }
});

module.exports = router;
