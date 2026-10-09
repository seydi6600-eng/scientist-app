// routes/league.js — لیگ آنلاین
const express = require("express");
const { query } = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

const LEAGUES = {
    division3: { groupSize: 10, promote: 3, relegate: 0, entryFee: 100, reward: 500 },
    division2: { groupSize: 10, promote: 3, relegate: 3, entryFee: 200, reward: 800 },
    division1: { groupSize: 10, promote: 3, relegate: 3, entryFee: 300, reward: 1200 },
    premier:   { groupSize: 16, promote: 0, relegate: 4, entryFee: 500, reward: 2500 },
};

const LEAGUE_ORDER = ["division3", "division2", "division1", "premier"];

function getFridayStart(ref) {
    const d = ref ? new Date(ref) : new Date();
    const diff = (d.getDay() - 5 + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getSeasonEnd(seasonStart) {
    return seasonStart + 7 * 86400000;
}

// ─── POST /league/register ───
router.post("/register", authMiddleware, async (req, res) => {
    try {
        const { leagueId, paidAmount, devMode } = req.body;
        if (!LEAGUES[leagueId]) {
            return res.status(400).json({ ok: false, error: "لیگ نامعتبر" });
        }

        const league = LEAGUES[leagueId];
        if (paidAmount !== league.entryFee) {
            return res.status(400).json({ ok: false, error: "مبلغ نامعتبر" });
        }

        const existing = await query(
            "SELECT user_phone FROM league_bootstrap_queue WHERE user_phone = $1",
            [req.user.phone]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ ok: false, error: "قبلاً ثبت‌نام کردی" });
        }

        const userRes = await query(
            "SELECT username, avatar FROM users WHERE phone = $1",
            [req.user.phone]
        );
        if (userRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "کاربر پیدا نشد" });
        }
        const u = userRes.rows[0];

        await query(
            `INSERT INTO league_bootstrap_queue (user_phone, username, avatar, league_id, paid_amount, registered_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user.phone, u.username, u.avatar || "👤", leagueId, paidAmount, Date.now()]
        );

        const countRes = await query("SELECT COUNT(*) as count FROM league_bootstrap_queue");
        const count = parseInt(countRes.rows[0].count);

        const MIN_PLAYERS = devMode ? 2 : 80;

        if (count >= MIN_PLAYERS) {
            const result = await tryBootstrap(MIN_PLAYERS);
            return res.json({ ok: true, status: "bootstrapped", players: result.players });
        }

        res.json({
            ok: true,
            status: "waiting",
            registered: count,
            needed: MIN_PLAYERS,
        });
    } catch (err) {
        console.error("League register error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── POST /league/cancel ───
router.post("/cancel", authMiddleware, async (req, res) => {
    try {
        await query(
            "DELETE FROM league_bootstrap_queue WHERE user_phone = $1",
            [req.user.phone]
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── GET /league/registration-status ───
router.get("/registration-status", authMiddleware, async (req, res) => {
    try {
        const devMode = req.query.dev === "1";
        const MIN_PLAYERS = devMode ? 2 : 80;

        const countRes = await query("SELECT COUNT(*) as count FROM league_bootstrap_queue");
        const inQueueRes = await query(
            "SELECT user_phone FROM league_bootstrap_queue WHERE user_phone = $1",
            [req.user.phone]
        );

        res.json({
            ok: true,
            inQueue: inQueueRes.rows.length > 0,
            registered: parseInt(countRes.rows[0].count),
            needed: MIN_PLAYERS,
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── POST /league/weekly-join ───
router.post("/weekly-join", authMiddleware, async (req, res) => {
    try {
        const { leagueId, paidAmount } = req.body;
        if (!LEAGUES[leagueId]) {
            return res.status(400).json({ ok: false, error: "لیگ نامعتبر" });
        }

        const seasonStart = getFridayStart();
        const seasonEnd = getSeasonEnd(seasonStart);
        const league = LEAGUES[leagueId];

        const userRes = await query(
            "SELECT username, avatar FROM users WHERE phone = $1",
            [req.user.phone]
        );
        const u = userRes.rows[0];

        const alreadyRes = await query(
            `SELECT m.id FROM league_members m
             JOIN league_seasons s ON s.id = m.season_id
             WHERE m.user_phone = $1 AND s.season_start = $2`,
            [req.user.phone, seasonStart]
        );
        if (alreadyRes.rows.length > 0) {
            return res.json({ ok: true, status: "already_joined" });
        }

        const groupsRes = await query(
            `SELECT id FROM league_seasons
             WHERE season_start = $1 AND league_id = $2 AND status = 'active'`,
            [seasonStart, leagueId]
        );

        let targetSeasonId = null;
        for (const g of groupsRes.rows) {
            const membersRes = await query(
                "SELECT COUNT(*) as count FROM league_members WHERE season_id = $1",
                [g.id]
            );
            if (parseInt(membersRes.rows[0].count) < league.groupSize) {
                targetSeasonId = g.id;
                break;
            }
        }

        if (!targetSeasonId) {
            const newSeason = await query(
                `INSERT INTO league_seasons (season_start, season_end, league_id, group_number, status)
                 VALUES ($1, $2, $3, $4, 'active') RETURNING id`,
                [seasonStart, seasonEnd, leagueId, groupsRes.rows.length + 1]
            );
            targetSeasonId = newSeason.rows[0].id;
        }

        await query(
            `INSERT INTO league_members (season_id, user_phone, username, avatar, joined_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [targetSeasonId, req.user.phone, u.username, u.avatar || "👤", Date.now()]
        );

        const membersRes = await query(
            "SELECT COUNT(*) as count FROM league_members WHERE season_id = $1",
            [targetSeasonId]
        );
        const memberCount = parseInt(membersRes.rows[0].count);

        res.json({
            ok: true,
            status: "joined",
            groupReady: memberCount >= league.groupSize,
            waiting: memberCount,
            needed: league.groupSize,
        });
    } catch (err) {
        console.error("Weekly join error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── GET /league/state ───
router.get("/state", authMiddleware, async (req, res) => {
    try {
        const memberRes = await query(
            `SELECT m.*, s.id as season_id, s.season_start, s.season_end, s.league_id, s.group_number, s.status as season_status
             FROM league_members m
             JOIN league_seasons s ON s.id = m.season_id
             WHERE m.user_phone = $1
             ORDER BY m.joined_at DESC LIMIT 1`,
            [req.user.phone]
        );

        if (memberRes.rows.length === 0) {
            return res.json({ ok: true, state: null });
        }

        const member = memberRes.rows[0];
        const seasonId = member.season_id;

        const [allMembers, allMatches] = await Promise.all([
            query("SELECT * FROM league_members WHERE season_id = $1", [seasonId]),
            query("SELECT * FROM league_matches WHERE season_id = $1 ORDER BY start_time ASC", [seasonId]),
        ]);

        res.json({
            ok: true,
            state: {
                seasonId: seasonId,
                seasonStart: member.season_start,
                competitionEnd: member.season_start + 6 * 86400000,
                seasonEnd: member.season_end,
                leagueId: member.league_id,
                group: {
                    id: seasonId,
                    number: member.group_number,
                    leagueId: member.league_id,
                    players: allMembers.rows.map(m => ({
                        id: "user_" + m.user_phone,
                        phone: m.user_phone,
                        username: m.username,
                        avatar: m.avatar,
                    })),
                    matches: allMatches.rows.map(m => ({
                        id: m.id,
                        round: m.round_number,
                        homeId: "user_" + m.home_phone,
                        awayId: "user_" + m.away_phone,
                        homeName: allMembers.rows.find(x => x.user_phone === m.home_phone)?.username || "?",
                        awayName: allMembers.rows.find(x => x.user_phone === m.away_phone)?.username || "?",
                        homeAvatar: allMembers.rows.find(x => x.user_phone === m.home_phone)?.avatar || "👤",
                        awayAvatar: allMembers.rows.find(x => x.user_phone === m.away_phone)?.avatar || "👤",
                        startTime: parseInt(m.start_time),
                        endTime: parseInt(m.end_time),
                        status: m.status,
                        homeScore: m.home_score,
                        awayScore: m.away_score,
                        homeSubmitted: m.home_submitted,
                        awaySubmitted: m.away_submitted,
                        result: m.result,
                    })),
                },
                finalised: member.season_status === "finished",
            },
        });
    } catch (err) {
        console.error("League state error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── POST /league/matches/:id/score ───
router.post("/matches/:id/score", authMiddleware, async (req, res) => {
    try {
        const matchId = req.params.id;
        const { score } = req.body;

        if (typeof score !== "number" || score < 0 || score > 9) {
            return res.status(400).json({ ok: false, error: "امتیاز نامعتبر" });
        }

        const matchRes = await query("SELECT * FROM league_matches WHERE id = $1", [matchId]);
        if (matchRes.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "مسابقه پیدا نشد" });
        }
        const m = matchRes.rows[0];

        if (m.home_phone !== req.user.phone && m.away_phone !== req.user.phone) {
            return res.status(403).json({ ok: false, error: "این مسابقه مال تو نیست" });
        }

        const updates = [];
        const values = [];
        let idx = 1;

        if (m.home_phone === req.user.phone) {
            if (m.home_submitted) return res.status(409).json({ ok: false, error: "قبلاً ثبت کردی" });
            updates.push(`home_score = $${idx++}`, `home_submitted = $${idx++}`);
            values.push(score, true);
        } else {
            if (m.away_submitted) return res.status(409).json({ ok: false, error: "قبلاً ثبت کردی" });
            updates.push(`away_score = $${idx++}`, `away_submitted = $${idx++}`);
            values.push(score, true);
        }

        const finalHome = m.home_submitted || (m.home_phone === req.user.phone);
        const finalAway = m.away_submitted || (m.away_phone === req.user.phone);

        if (finalHome && finalAway) {
            updates.push(`status = $${idx++}`, `result = $${idx++}`);
            values.push("completed", "played");
        }

        values.push(matchId);
        await query(`UPDATE league_matches SET ${updates.join(", ")} WHERE id = $${idx}`, values);

        await updateStandings(m.season_id);

        res.json({ ok: true });
    } catch (err) {
        console.error("Submit score error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── POST /league/finalise ───
router.post("/finalise", authMiddleware, async (req, res) => {
    try {
        const memberRes = await query(
            `SELECT m.*, s.id as season_id, s.league_id, s.season_start, s.status as season_status
             FROM league_members m
             JOIN league_seasons s ON s.id = m.season_id
             WHERE m.user_phone = $1
             ORDER BY m.joined_at DESC LIMIT 1`,
            [req.user.phone]
        );

        if (memberRes.rows.length === 0) return res.json({ ok: true });
        const member = memberRes.rows[0];

        if (member.season_status === "finished") {
            return res.json({ ok: true, already: true });
        }

        const allRes = await query(
            `SELECT * FROM league_members WHERE season_id = $1
             ORDER BY points DESC, correct_answers DESC, wins DESC`,
            [member.season_id]
        );

        const rank = allRes.rows.findIndex(m => m.user_phone === req.user.phone) + 1;
        const total = allRes.rows.length;
        const leagueId = member.league_id;
        const league = LEAGUES[leagueId];

        let nextLeagueId = leagueId;
        const idx = LEAGUE_ORDER.indexOf(leagueId);
        if (league.promote && rank <= league.promote && idx < LEAGUE_ORDER.length - 1) {
            nextLeagueId = LEAGUE_ORDER[idx + 1];
        } else if (league.relegate && rank > total - league.relegate && idx > 0) {
            nextLeagueId = LEAGUE_ORDER[idx - 1];
        }

        await query("UPDATE league_seasons SET status = 'finished' WHERE id = $1", [member.season_id]);

        res.json({
            ok: true,
            rank,
            total,
            reward: rank === 1 ? league.reward : 0,
            nextLeagueId,
        });
    } catch (err) {
        console.error("Finalise error:", err);
        res.status(500).json({ ok: false, error: "خطای سرور" });
    }
});

// ─── Helpers ───
async function tryBootstrap(minPlayers) {
    const queueRes = await query("SELECT * FROM league_bootstrap_queue");
    const queue = queueRes.rows;

    if (queue.length < minPlayers) {
        return { status: "waiting", registered: queue.length };
    }

    const seasonStart = getFridayStart();
    const seasonEnd = getSeasonEnd(seasonStart);

    const byLeague = {};
    queue.forEach(p => {
        if (!byLeague[p.league_id]) byLeague[p.league_id] = [];
        byLeague[p.league_id].push(p);
    });

    for (const leagueId of Object.keys(byLeague)) {
        const league = LEAGUES[leagueId];
        if (!league) continue;

        const players = byLeague[leagueId].sort(() => Math.random() - 0.5);
        const groupCount = Math.floor(players.length / league.groupSize);

        for (let g = 0; g < groupCount; g++) {
            const groupPlayers = players.slice(g * league.groupSize, (g + 1) * league.groupSize);

            const seasonRes = await query(
                `INSERT INTO league_seasons (season_start, season_end, league_id, group_number, status)
                 VALUES ($1, $2, $3, $4, 'active') RETURNING id`,
                [seasonStart, seasonEnd, leagueId, g + 1]
            );
            const seasonId = seasonRes.rows[0].id;

            for (const p of groupPlayers) {
                await query(
                    `INSERT INTO league_members (season_id, user_phone, username, avatar, joined_at)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [seasonId, p.user_phone, p.username, p.avatar || "👤", Date.now()]
                );
            }

            await generateMatches(seasonId, groupPlayers, seasonStart);
        }
    }

    await query("DELETE FROM league_bootstrap_queue");

    return { status: "bootstrapped", players: queue.length };
}

async function generateMatches(seasonId, players, seasonStart) {
    const list = players.map(p => ({ phone: p.user_phone, username: p.username }));
    if (list.length % 2) list.push({ phone: "bye", username: "استراحت", isBye: true });

    const rounds = list.length - 1;
    const half = list.length / 2;
    let rotation = list.slice();

    for (let round = 0; round < rounds; round++) {
        for (let i = 0; i < half; i++) {
            const home = rotation[i];
            const away = rotation[rotation.length - 1 - i];
            if (home.isBye || away.isBye) continue;

            const dayOffset = round % 6;
            const slot = Math.floor(round / 6) * half + i;
            const hour = 10 + ((slot * 2) % 13);

            const start = new Date(seasonStart);
            start.setDate(start.getDate() + dayOffset);
            start.setHours(hour, 0, 0, 0);

            await query(
                `INSERT INTO league_matches
                 (season_id, round_number, home_phone, away_phone, start_time, end_time, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')`,
                [seasonId, round + 1, home.phone, away.phone, start.getTime(), start.getTime() + 60 * 60000]
            );
        }
        rotation = [rotation[0], rotation[rotation.length - 1]].concat(rotation.slice(1, -1));
    }
}

async function updateStandings(seasonId) {
    const membersRes = await query("SELECT * FROM league_members WHERE season_id = $1", [seasonId]);
    const matchesRes = await query("SELECT * FROM league_matches WHERE season_id = $1", [seasonId]);

    const map = {};
    membersRes.rows.forEach(m => {
        map[m.user_phone] = { points: 0, correct: 0, played: 0, wins: 0, draws: 0, losses: 0 };
    });

    for (const m of matchesRes.rows) {
        if (m.status !== "completed" && m.status !== "forfeit") continue;
        const h = map[m.home_phone], a = map[m.away_phone];
        if (!h || !a) continue;

        h.played++; a.played++;
        h.correct += Number(m.home_score || 0);
        a.correct += Number(m.away_score || 0);

        if (m.result === "double_forfeit") {
            h.losses++; a.losses++;
            continue;
        }

        if (m.home_score > m.away_score) {
            h.points += 3; h.wins++; a.losses++;
        } else if (m.away_score > m.home_score) {
            a.points += 3; a.wins++; h.losses++;
        } else {
            h.points++; a.points++;
            h.draws++; a.draws++;
        }
    }

    for (const m of membersRes.rows) {
        const s = map[m.user_phone];
        await query(
            `UPDATE league_members
             SET points = $1, correct_answers = $2, played = $3, wins = $4, draws = $5, losses = $6
             WHERE id = $7`,
            [s.points, s.correct, s.played, s.wins, s.draws, s.losses, m.id]
        );
    }
}

module.exports = router;
