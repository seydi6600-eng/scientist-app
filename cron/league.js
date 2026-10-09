// cron/league.js — کارهای زمان‌بندی شده
const cron = require("node-cron");
const { query } = require("../db");

function startCronJobs() {
    // هر روز ساعت 00:00 → حل مسابقات منقضی
    cron.schedule("0 0 * * *", async () => {
        console.log("⏰ Cron: Resolving expired matches...");
        try {
            await resolveExpiredMatches();
        } catch (err) {
            console.error("❌ Cron error:", err.message);
        }
    });

    // پنجشنبه ساعت 00:00 → بستن فصل‌ها
    cron.schedule("0 0 * * 4", async () => {
        console.log("⏰ Cron: Finalising seasons...");
        try {
            await finaliseAllSeasons();
        } catch (err) {
            console.error("❌ Cron error:", err.message);
        }
    });

    console.log("✅ Cron jobs started");
}

async function resolveExpiredMatches() {
    const now = Date.now();
    const expired = await query(
        "SELECT * FROM league_matches WHERE status = 'scheduled' AND end_time < $1",
        [now]
    );

    if (expired.rows.length === 0) return { resolved: 0 };

    const touchedSeasons = new Set();

    for (const m of expired.rows) {
        const update = {};
        if (m.home_submitted && !m.away_submitted) {
            update.away_score = 0;
            update.status = "forfeit";
            update.result = "home_forfeit_win";
        } else if (!m.home_submitted && m.away_submitted) {
            update.home_score = 0;
            update.status = "forfeit";
            update.result = "away_forfeit_win";
        } else if (!m.home_submitted && !m.away_submitted) {
            update.home_score = 0;
            update.away_score = 0;
            update.status = "forfeit";
            update.result = "double_forfeit";
        } else {
            update.status = "completed";
            update.result = "played";
        }

        await query(
            `UPDATE league_matches SET
             home_score = COALESCE($1, home_score),
             away_score = COALESCE($2, away_score),
             status = $3, result = $4
             WHERE id = $5`,
            [update.home_score, update.away_score, update.status, update.result, m.id]
        );

        touchedSeasons.add(m.season_id);
    }

    console.log(`✅ Resolved ${expired.rows.length} matches`);

    for (const sid of touchedSeasons) {
        await updateStandings(sid);
    }

    return { resolved: expired.rows.length };
}

async function finaliseAllSeasons() {
    const now = Date.now();
    const active = await query(
        "SELECT * FROM league_seasons WHERE status = 'active' AND season_end < $1",
        [now]
    );

    if (active.rows.length === 0) return { finalised: 0 };

    for (const season of active.rows) {
        await query("UPDATE league_seasons SET status = 'finished' WHERE id = $1", [season.id]);
        console.log(`✅ Finalised season ${season.id}`);
    }

    return { finalised: active.rows.length };
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

module.exports = { startCronJobs };
