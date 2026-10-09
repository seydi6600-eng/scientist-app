// routes/pvp.js — بازی آنلاین PvP
const express = require("express");
const { query } = require("../db");
const { authMiddleware } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const MAX_WAIT_SECONDS = 30;
const TOPIC_SELECTION_SECONDS = 10;
const HEART_COST = 1;

// ═══════════════════════════════════════════════
// لیست موضوعات (هماهنگ با کلاینت)
// ═══════════════════════════════════════════════
const TOPICS = [
    { id: "general",      file: "general.json"      },
    { id: "football",     file: "football.json"     },
    { id: "sports-hall",  file: "sports-hall.json"  },
    { id: "geography",    file: "geograghy.json"    },
    { id: "history",      file: "history.json"      },
    { id: "computer",     file: "computer.json"     },
    { id: "games",        file: "games.json"        },
    { id: "cinema-tv",    file: "cinema-tv.json"    },
    { id: "music",        file: "music.json"        },
    { id: "literature",   file: "literature.json"   },
    { id: "islamic",      file: "islamic.json"      },
    { id: "puzzle",       file: "puzzle.json"       }
];

// ═══════════════════════════════════════════════
// Helper: خوندن سوالات از فایل
// ═══════════════════════════════════════════════
function loadQuestions(topicId) {
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return [];
    
    try {
        // مسیر: از ریشه‌ی پروژه
        const filePath = path.join(__dirname, "..", "questions", topic.file);
        if (!fs.existsSync(filePath)) {
            console.warn("⚠️ فایل پیدا نشد:", filePath);
            return [];
        }
        const data = fs.readFileSync(filePath, "utf-8");
        const questions = JSON.parse(data);
        return Array.isArray(questions) ? questions : [];
    } catch (err) {
        console.error("❌ خطا در خواندن:", topicId, err.message);
        return [];
    }
}

// ═══════════════════════════════════════════════
// Helper: انتخاب سوالات تصادفی از موضوع
// ═══════════════════════════════════════════════
function pickRandomQuestions(topicId, count) {
    const all = loadQuestions(topicId);
    if (all.length === 0) return [];
    
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(q => {
        // برهم زدن گزینه‌ها
        const correctIdx = typeof q.correct === "number" ? q.correct : 0;
        const indices = q.answers.map((_, i) => i);
        const shuffledIdx = [...indices].sort(() => Math.random() - 0.5);
        const newAnswers = shuffledIdx.map(i => q.answers[i]);
        const newCorrect = shuffledIdx.indexOf(correctIdx);
        
        return {
            question: q.question,
            answers: newAnswers,
            correct: newCorrect === -1 ? 0 : newCorrect,
            topicId: topicId
        };
    });
}

// ═══════════════════════════════════════════════
// POST /pvp/join — ورود به صف
// ═══════════════════════════════════════════════
router.post("/join", authMiddleware, async (req, res) => {
    try {
        const phone = req.user.phone;
        const username = req.user.username;
        
        // چک کن قبلاً توی صف نیست
        const existing = await query(
            "SELECT * FROM pvp_queue WHERE user_phone = $1",
            [phone]
        );
        if (existing.rows.length > 0) {
            return res.json({ ok: true, status: "waiting" });
        }
        
        // کاربر رو بگیر
        const userRes = await query(
            "SELECT avatar, level FROM users WHERE phone = $1",
            [phone]
        );
        if (userRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "کاربر پیدا نشد" });
        }
        const user = userRes.rows[0];
        
        // چک کن قبلاً توی مسابقه‌ی فعال نیست
        const activeMatch = await query(
            `SELECT id FROM pvp_matches 
             WHERE (player1_phone = $1 OR player2_phone = $1)
             AND status IN ('selecting_topics', 'in_progress')
             LIMIT 1`,
            [phone]
        );
        if (activeMatch.rows.length > 0) {
            return res.json({ 
                ok: true, 
                status: "matched", 
                matchId: activeMatch.rows[0].id 
            });
        }
        
        // اضافه به صف
        await query(
            `INSERT INTO pvp_queue (user_phone, username, avatar, level, joined_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [phone, username, user.avatar || "👤", user.level || 1, Date.now()]
        );
        
        // دنبال حریف بگرد
        const opponent = await query(
            `SELECT * FROM pvp_queue 
             WHERE user_phone != $1 
             ORDER BY joined_at ASC 
             LIMIT 1`,
            [phone]
        );
        
        if (opponent.rows.length === 0) {
            return res.json({ ok: true, status: "waiting" });
        }
        
        const opp = opponent.rows[0];
        
        // مسابقه بساز
        const matchRes = await query(
            `INSERT INTO pvp_matches 
             (player1_phone, player1_username, player1_avatar,
              player2_phone, player2_username, player2_avatar,
              questions, status, started_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'selecting_topics', $8)
             RETURNING id`,
            [
                opp.user_phone, opp.username, opp.avatar,
                phone, username, user.avatar || "👤",
                JSON.stringify([]),
                Date.now()
            ]
        );
        
        const matchId = matchRes.rows[0].id;
        
        // هر دو رو از صف پاک کن
        await query(
            "DELETE FROM pvp_queue WHERE user_phone IN ($1, $2)",
            [phone, opp.user_phone]
        );
        
        return res.json({
            ok: true,
            status: "matched",
            matchId: matchId
        });
        
    } catch (err) {
        console.error("PvP join error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// GET /pvp/status — چک وضعیت صف
// ═══════════════════════════════════════════════
router.get("/status", authMiddleware, async (req, res) => {
    try {
        const phone = req.user.phone;
        
        // توی صف؟
        const queue = await query(
            "SELECT * FROM pvp_queue WHERE user_phone = $1",
            [phone]
        );
        
        if (queue.rows.length > 0) {
            // چک کن چقدر توی صف بوده
            const joinedAt = parseInt(queue.rows[0].joined_at);
            const waited = Math.floor((Date.now() - joinedAt) / 1000);
            
            if (waited > MAX_WAIT_SECONDS) {
                // تایم‌اوت
                await query("DELETE FROM pvp_queue WHERE user_phone = $1", [phone]);
                return res.json({ ok: true, status: "timeout" });
            }
            
            return res.json({ 
                ok: true, 
                status: "waiting",
                waited: waited
            });
        }
        
        // توی مسابقه؟
        const match = await query(
            `SELECT id FROM pvp_matches 
             WHERE (player1_phone = $1 OR player2_phone = $1)
             AND status IN ('selecting_topics', 'in_progress')
             ORDER BY created_at DESC LIMIT 1`,
            [phone]
        );
        
        if (match.rows.length > 0) {
            return res.json({ 
                ok: true, 
                status: "matched", 
                matchId: match.rows[0].id 
            });
        }
        
        return res.json({ ok: true, status: "idle" });
        
    } catch (err) {
        console.error("PvP status error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// POST /pvp/leave — خروج از صف
// ═══════════════════════════════════════════════
router.post("/leave", authMiddleware, async (req, res) => {
    try {
        await query(
            "DELETE FROM pvp_queue WHERE user_phone = $1",
            [req.user.phone]
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// GET /pvp/match/:id — اطلاعات مسابقه
// ═══════════════════════════════════════════════
router.get("/match/:id", authMiddleware, async (req, res) => {
    try {
        const matchId = req.params.id;
        const phone = req.user.phone;
        
        const matchRes = await query(
            "SELECT * FROM pvp_matches WHERE id = $1",
            [matchId]
        );
        
        if (matchRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "مسابقه پیدا نشد" });
        }
        
        const m = matchRes.rows[0];
        const isP1 = m.player1_phone === phone;
        const isP2 = m.player2_phone === phone;
        
        if (!isP1 && !isP2) {
            return res.status(403).json({ ok: false, error: "دسترسی غیرمجاز" });
        }
        
        // موضوعات انتخاب‌شده
        const selections = await query(
            "SELECT * FROM pvp_topic_selections WHERE match_id = $1",
            [matchId]
        );
        
        const mySelection = selections.rows.find(s => s.user_phone === phone);
        const oppSelection = selections.rows.find(s => s.user_phone !== phone);
        
        // چک کن هر دو انتخاب کردن
        const bothSelected = selections.rows.length === 2;
        
        // اگه هر دو انتخاب کردن ولی سوالات ساخته نشده
        if (bothSelected && m.questions && m.questions.length === 0) {
            // ساخت سوالات
            const myTopic = mySelection.topic_id;
            const oppTopic = oppSelection.topic_id;
            
            let questions;
            if (myTopic === oppTopic) {
                // اگه هر دو یه موضوع → ۱۰ سوال از همون
                questions = pickRandomQuestions(myTopic, 10);
            } else {
                // ۵ سوال از هر موضوع
                const set1 = pickRandomQuestions(myTopic, 5);
                const set2 = pickRandomQuestions(oppTopic, 5);
                questions = [...set1, ...set2];
            }
            
            await query(
                `UPDATE pvp_matches 
                 SET questions = $1, status = 'in_progress', started_at = $2
                 WHERE id = $3`,
                [JSON.stringify(questions), Date.now(), matchId]
            );
            
            m.questions = questions;
            m.status = "in_progress";
            m.started_at = Date.now();
        }
        
        // تعیین برنده اگه هر دو تموم کردن
        if (m.player1_finished && m.player2_finished && !m.winner_phone) {
            let winner = null;
            if (m.player1_score > m.player2_score) winner = m.player1_phone;
            else if (m.player2_score > m.player1_score) winner = m.player2_phone;
            // مساوی: winner = null
            
            await query(
                `UPDATE pvp_matches 
                 SET status = 'finished', finished_at = $1, winner_phone = $2
                 WHERE id = $3`,
                [Date.now(), winner, matchId]
            );
            
            m.status = "finished";
            m.finished_at = Date.now();
            m.winner_phone = winner;
        }
        
        return res.json({
            ok: true,
            match: {
                id: m.id,
                status: m.status,
                questions: m.questions || [],
                startedAt: parseInt(m.started_at),
                finishedAt: m.finished_at ? parseInt(m.finished_at) : null,
                winnerPhone: m.winner_phone,
                myTopic: mySelection ? mySelection.topic_id : null,
                oppTopic: oppSelection ? oppSelection.topic_id : null,
                hasMySelection: !!mySelection,
                hasOppSelection: !!oppSelection,
                player1: {
                    isMe: isP1,
                    username: m.player1_username,
                    avatar: m.player1_avatar,
                    score: m.player1_score,
                    answered: m.player1_answered,
                    finished: m.player1_finished,
                    topic: m.player1_topic
                },
                player2: {
                    isMe: isP2,
                    username: m.player2_username,
                    avatar: m.player2_avatar,
                    score: m.player2_score,
                    answered: m.player2_answered,
                    finished: m.player2_finished,
                    topic: m.player2_topic
                }
            }
        });
        
    } catch (err) {
        console.error("PvP match error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// POST /pvp/select-topic — انتخاب موضوع
// ═══════════════════════════════════════════════
router.post("/select-topic", authMiddleware, async (req, res) => {
    try {
        const { matchId, topicId } = req.body;
        const phone = req.user.phone;
        
        if (!matchId || !topicId) {
            return res.status(400).json({ ok: false, error: "اطلاعات ناقص" });
        }
        
        // چک کن موضوع معتبره
        if (!TOPICS.find(t => t.id === topicId)) {
            return res.status(400).json({ ok: false, error: "موضوع نامعتبر" });
        }
        
        // چک کن کاربر توی این مسابقه هست
        const matchRes = await query(
            "SELECT * FROM pvp_matches WHERE id = $1",
            [matchId]
        );
        
        if (matchRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "مسابقه پیدا نشد" });
        }
        
        const m = matchRes.rows[0];
        if (m.player1_phone !== phone && m.player2_phone !== phone) {
            return res.status(403).json({ ok: false, error: "دسترسی غیرمجاز" });
        }
        
        // ذخیره انتخاب
        await query(
            `INSERT INTO pvp_topic_selections (match_id, user_phone, topic_id, selected_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (match_id, user_phone) 
             DO UPDATE SET topic_id = $3, selected_at = $4`,
            [matchId, phone, topicId, Date.now()]
        );
        
        // ذخیره توی pvp_matches
        const topicField = m.player1_phone === phone ? "player1_topic" : "player2_topic";
        await query(
            `UPDATE pvp_matches SET ${topicField} = $1 WHERE id = $2`,
            [topicId, matchId]
        );
        
        res.json({ ok: true });
        
    } catch (err) {
        console.error("PvP select error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// POST /pvp/answer — ثبت پاسخ
// ═══════════════════════════════════════════════
router.post("/answer", authMiddleware, async (req, res) => {
    try {
        const { matchId, isCorrect } = req.body;
        const phone = req.user.phone;
        
        const matchRes = await query(
            "SELECT * FROM pvp_matches WHERE id = $1",
            [matchId]
        );
        
        if (matchRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "مسابقه پیدا نشد" });
        }
        
        const m = matchRes.rows[0];
        const isP1 = m.player1_phone === phone;
        
        if (isP1) {
            await query(
                `UPDATE pvp_matches 
                 SET player1_score = player1_score + $1,
                     player1_answered = player1_answered + 1
                 WHERE id = $2`,
                [isCorrect ? 1 : 0, matchId]
            );
        } else if (m.player2_phone === phone) {
            await query(
                `UPDATE pvp_matches 
                 SET player2_score = player2_score + $1,
                     player2_answered = player2_answered + 1
                 WHERE id = $2`,
                [isCorrect ? 1 : 0, matchId]
            );
        } else {
            return res.status(403).json({ ok: false, error: "دسترسی غیرمجاز" });
        }
        
        res.json({ ok: true });
        
    } catch (err) {
        console.error("PvP answer error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// POST /pvp/finish — پایان بازی و ثبت نتیجه
// ═══════════════════════════════════════════════
router.post("/finish", authMiddleware, async (req, res) => {
    try {
        const { matchId, finalScore } = req.body;
        const phone = req.user.phone;
        
        const matchRes = await query(
            "SELECT * FROM pvp_matches WHERE id = $1",
            [matchId]
        );
        
        if (matchRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "مسابقه پیدا نشد" });
        }
        
        const m = matchRes.rows[0];
        const isP1 = m.player1_phone === phone;
        const isP2 = m.player2_phone === phone;
        
        if (!isP1 && !isP2) {
            return res.status(403).json({ ok: false, error: "دسترسی غیرمجاز" });
        }
        
        // ثبت پایان
        if (isP1) {
            await query(
                `UPDATE pvp_matches 
                 SET player1_finished = true, player1_score = $1
                 WHERE id = $2`,
                [finalScore, matchId]
            );
        } else {
            await query(
                `UPDATE pvp_matches 
                 SET player2_finished = true, player2_score = $1
                 WHERE id = $2`,
                [finalScore, matchId]
            );
        }
        
        // چک کن هر دو تموم کردن
        const updated = await query(
            "SELECT * FROM pvp_matches WHERE id = $1",
            [matchId]
        );
        
        const u = updated.rows[0];
        
        if (u.player1_finished && u.player2_finished) {
            // محاسبه برنده
            let winner = null;
            if (u.player1_score > u.player2_score) winner = u.player1_phone;
            else if (u.player2_score > u.player1_score) winner = u.player2_phone;
            
            await query(
                `UPDATE pvp_matches 
                 SET status = 'finished', finished_at = $1, winner_phone = $2
                 WHERE id = $3`,
                [Date.now(), winner, matchId]
            );
            
            // پاداش‌ها
            const isMeWinner = winner === phone;
            const isTie = winner === null;
            
            // آپدیت آمار بازیکن‌ها
            for (const player of [u.player1_phone, u.player2_phone]) {
                await query(
                    `UPDATE users 
                     SET online_games = online_games + 1,
                         online_wins = online_wins + $1,
                         online_best_score = GREATEST(online_best_score, $2)
                     WHERE phone = $3`,
                    [
                        player === winner ? 1 : 0,
                        player === u.player1_phone ? u.player1_score : u.player2_score,
                        player
                    ]
                );
            }
            
            return res.json({
                ok: true,
                waiting: false,
                result: {
                    winner: winner,
                    isMeWinner: isMeWinner,
                    isTie: isTie,
                    myScore: isP1 ? u.player1_score : u.player2_score,
                    oppScore: isP1 ? u.player2_score : u.player1_score
                }
            });
        }
        
        // هنوز منتظر حریف
        return res.json({ ok: true, waiting: true });
        
    } catch (err) {
        console.error("PvP finish error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ═══════════════════════════════════════════════
// GET /pvp/topics — لیست موضوعات
// ═══════════════════════════════════════════════
router.get("/topics", authMiddleware, (req, res) => {
    res.json({ ok: true, topics: TOPICS });
});

module.exports = router;
