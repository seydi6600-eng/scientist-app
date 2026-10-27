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

    
cron.schedule("0 0 * * 4", async () => {
    console.log("⏰ Cron: Finalising seasons and weekly leagues...");

    try {
        await finaliseAllSeasons();
    } catch (err) {
        console.error("❌ Season finalisation error:", err.message);
    }

    try {
        await processWeeklyGlobalLeagues();
    } catch (err) {
        console.error("❌ Weekly league error:", err.message);
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

async function processWeeklyGlobalLeagues() {
    const client = await require("../db").pool.connect();

    const leagueOrder = [
        "division3",
        "division2",
        "division1",
        "division4"
    ];

    const prizes = {
        division3: 500,
        division2: 800,
        division1: 1200,
        division4: 2500
    };

    try {
        await client.query("BEGIN");

        // جلوگیری از اجرای هم‌زمان دو پایان هفته
        await client.query(
            "SELECT pg_advisory_xact_lock(73190524)"
        );

        await client.query(`
            CREATE TABLE IF NOT EXISTS weekly_league_rollovers (
                week_key TEXT PRIMARY KEY,
                processed_at BIGINT NOT NULL
            )
        `);

        // این اجرا فقط یک بار در هر تاریخ می‌تواند انجام شود.
        const weekKey = new Date().toISOString().slice(0, 10);

        const claim = await client.query(
            `INSERT INTO weekly_league_rollovers (week_key, processed_at)
             VALUES ($1, $2)
             ON CONFLICT (week_key) DO NOTHING
             RETURNING week_key`,
            [weekKey, Date.now()]
        );

        if (claim.rowCount === 0) {
            await client.query("ROLLBACK");
            console.log("ℹ️ Weekly league already processed:", weekKey);
            return;
        }

        const result = await client.query(`
            SELECT phone, username, league_id,
                   COALESCE(weekly_league_points, 0) AS points
            FROM users
            WHERE COALESCE(league_joined, false) = true
              AND league_id = ANY($1::text[])
            ORDER BY league_id, weekly_league_points DESC NULLS LAST,
                     username ASC, phone ASC
            FOR UPDATE
        `, [leagueOrder]);

        const groups = Object.fromEntries(
            leagueOrder.map(id => [id, []])
        );

        for (const user of result.rows) {
            groups[user.league_id].push(user);
        }

        // تصمیم‌ها بر اساس رتبه‌های قبل از تغییر لیگ‌ها گرفته می‌شوند.
        const changes = [];
        const winners = [];

        for (let index = 0; index < leagueOrder.length; index++) {
            const leagueId = leagueOrder[index];
            const players = groups[leagueId];
            const count = players.length;

            if (count === 0) continue;

            // جایزه نفر اول
            winners.push({
                phone: players[0].phone,
                prize: prizes[leagueId]
            });

            let promoteCount = Math.round(count / 3);
            let relegateCount = Math.round(count / 3);

            if (leagueId === "division3") relegateCount = 0;
            if (leagueId === "division4") promoteCount = 0;

            // تعدادها نباید روی هم بیفتند.
            promoteCount = Math.min(promoteCount, count);
            relegateCount = Math.min(
                relegateCount,
                count - promoteCount
            );

            const higherLeague = leagueOrder[index + 1];
            const lowerLeague = leagueOrder[index - 1];

            for (let i = 0; i < count; i++) {
                let newLeague = leagueId;

                if (i < promoteCount && higherLeague) {
                    newLeague = higherLeague;
                } else if (
                    i >= count - relegateCount &&
                    lowerLeague
                ) {
                    newLeague = lowerLeague;
                }

                changes.push({
                    phone: players[i].phone,
                    leagueId: newLeague
                });
            }
        }

        // پرداخت جایزه و تغییر دسته در همان تراکنش انجام می‌شوند.
        for (const winner of winners) {
            await client.query(
                `UPDATE users
                 SET coins = COALESCE(coins, 0) + $1
                 WHERE phone = $2`,
                [winner.prize, winner.phone]
            );
        }

        for (const change of changes) {
            await client.query(
                `UPDATE users
                 SET league_id = $1,
                     weekly_league_points = 0
                 WHERE phone = $2`,
                [change.leagueId, change.phone]
            );
        }

        await client.query("COMMIT");

        console.log(
            `✅ Weekly leagues processed: ${weekKey}; ` +
            `${changes.length} users; ${winners.length} prizes`
        );
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Weekly league rollover failed:", err.message);
        throw err;
    } finally {
        client.release();
    }
}


module.exports = { startCronJobs };
