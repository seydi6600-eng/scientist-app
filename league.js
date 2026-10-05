// @ts-nocheck
/* =========================================================
   سیستم لیگ هفتگی آنلاین — نسخه نهایی v2.0
   ---------------------------------------------------------
   📜 قوانین لیگ:
   ─────────────────────────────────────────────────────────
   ۱. لیگ از ۴ دسته تشکیل شده:
      • 🥉 لیگ دسته ۳ (سطح ورودی)
      • 🥈 لیگ دسته ۲
      • 🥇 لیگ دسته ۱
      • 👑 لیگ برتر (بالاترین سطح)

   ۲. هر دسته گروه‌های ۱۰ نفره داره (لیگ برتر: ۱۶ نفره).

   ۳. صعود: ۳ نفر اول هر گروه از دسته ۳، ۲ و ۱ به دسته بالاتر.

   ۴. سقوط: ۳ نفر آخر دسته ۱ و ۲؛ ۴ نفر آخر لیگ برتر.

   ۵. دسته ۳ سقوط نداره (پایین‌ترین دسته).

   ۶. روزهای مسابقه: جمعه تا چهارشنبه (۶ روز).

   ۷. پنجشنبه: اعلام نتایج، اهدای جام، پاداش، و شروع لیگ جدید.

   ۸. امتیازدهی:
      • برد: ۳ امتیاز
      • مساوی: ۱ امتیاز
      • باخت یا عدم حضور: ۰ امتیاز

   ۹. در امتیاز مساوی، «تعداد پاسخ صحیح بیشتر» تعیین‌کننده‌ست.

   ۱۰. قالب مسابقه: همه با همه (Round-Robin) با برنامه‌ی زمانی.

   ۱۱. هر مسابقه ۹ سوال از ۳ موضوع مختلف (هر موضوع ۳ سوال).

   ۱۲. زمان هر سوال: ۱۵ ثانیه. زمان انتخاب موضوع: ۱۰ ثانیه.

   ۱۳. ❤️ در لیگ قلب مصرف نمی‌شه.

   ۱۴. ورودی هفتگی هر دسته:
      • دسته ۳: ۱۰۰ سکه
      • دسته ۲: ۲۰۰ سکه
      • دسته ۱: ۳۰۰ سکه
      • لیگ برتر: ۵۰۰ سکه

   ۱۵. 🏆 جایزه قهرمان هر دسته:
      • دسته ۳: ۵۰۰ سکه
      • دسته ۲: ۸۰۰ سکه
      • دسته ۱: ۱۲۰۰ سکه
      • لیگ برتر: ۲۵۰۰ سکه

   ۱۶. 🔒 شرط راه‌اندازی لیگ (فقط بار اول):
      حداقل ۸۰ نفر ثبت‌نام کنن تا ۸ گروه ۱۰ نفره تشکیل بشه.

   ۱۷. بعد از راه‌اندازی، هفته‌های بعد بدون این شرط اجرا می‌شن.

   ۱۸. 🔐 حریم خصوصی: اسم بازیکنان تا شروع مسابقات نمایش
      داده نمی‌شه. فقط تعداد ثبت‌نامی‌ها قابل مشاهده‌ست.

   ۱۹. 📅 هفته‌ی لیگ: جمعه ۰۰:۰۰ تا پنجشنبه ۰۰:۰۰.

   ۲۰. حداقل سطح ورود به لیگ: ۱۰
   ─────────────────────────────────────────────────────────
   ========================================================= */

const LEAGUE_API_MODE = "local"; // local | online
const LEAGUE_API_BASE = "/api/league";
const LEAGUE_MIN_LEVEL = 10;
const QUESTION_SECONDS = 15;
const TOPIC_SECONDS = 10;
const MATCH_WINDOW_MINUTES = 60;
const FRIDAY = 5;
const THURSDAY = 4;

/* ⚙️ تنظیمات لیگ */
const LEAGUE_SETTINGS = {
    MIN_PLAYERS_TO_START: 80,   // حداقل کل بازیکنان برای شروع (هفته‌ی اول)
    MIN_GROUPS_TO_START: 8,     // حداقل تعداد گروه (۸ گروه × ۱۰ نفر)
    REGISTRATION_DAYS: 7,
    AUTO_START: true
};

const LEAGUES = {
    division3: {
        id: "division3", name: "لیگ دسته ۳", emoji: "🥉", color: "#cd7f32",
        groupSize: 10, promote: 3, relegate: 0, entryFee: 100,
        rewards: { 1: 500 }
    },
    division2: {
        id: "division2", name: "لیگ دسته ۲", emoji: "🥈", color: "#94a3b8",
        groupSize: 10, promote: 3, relegate: 3, entryFee: 200,
        rewards: { 1: 800 }
    },
    division1: {
        id: "division1", name: "لیگ دسته ۱", emoji: "🥇", color: "#fbbf24",
        groupSize: 10, promote: 3, relegate: 3, entryFee: 300,
        rewards: { 1: 1200 }
    },
    premier: {
        id: "premier", name: "لیگ برتر", emoji: "👑", color: "#a855f7",
        groupSize: 16, promote: 0, relegate: 4, entryFee: 500,
        rewards: { 1: 2500 }
    }
};

const LEAGUE_ORDER = ["division3", "division2", "division1", "premier"];
const LEAGUE_BOOTSTRAP_KEY = "league_bootstrapped_v1";

let leagueTimer = null;
let validTopicsCache = null;
let leaguePollInterval = null;

/* =========================================================
   توابع کمکی عمومی
   ========================================================= */

function clearLeagueTimer() {
    if (leagueTimer) clearInterval(leagueTimer);
    leagueTimer = null;
}

function clearLeaguePoll() {
    if (leaguePollInterval) clearInterval(leaguePollInterval);
    leaguePollInterval = null;
}

function fa(value) {
    return typeof toPersianNumber === "function" ? toPersianNumber(value) : String(value);
}

function safeAvatar(avatar, size) {
    if (typeof getAvatarHTML === "function") return getAvatarHTML(avatar, size);
    return '<span style="font-size:' + size + 'px">' + (avatar || "👤") + '</span>';
}

function getFridayStart(reference) {
    const d = reference ? new Date(reference) : new Date();
    const diff = (d.getDay() - FRIDAY + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getNextFridayStart() {
    const now = new Date();
    const diff = (FRIDAY - now.getDay() + 7) % 7;
    const d = new Date(now);
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getCompetitionEnd(seasonStart) {
    const d = new Date(seasonStart);
    d.setDate(d.getDate() + 6);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getSeasonEnd(seasonStart) {
    return seasonStart + 7 * 86400000;
}

function getLeaguePhase(now) {
    const d = now ? new Date(now) : new Date();
    return d.getDay() === THURSDAY ? "results" : "competition";
}

function formatDateTime(ts) {
    const d = new Date(ts);
    const days = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
    return days[d.getDay()] + " " +
        fa(String(d.getHours()).padStart(2, "0")) + ":" +
        fa(String(d.getMinutes()).padStart(2, "0"));
}

function formatRemaining(ms) {
    if (ms <= 0) return "تمام شده";
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (days) return fa(days) + " روز و " + fa(hours) + " ساعت";
    if (hours) return fa(hours) + " ساعت و " + fa(minutes) + " دقیقه";
    return fa(minutes) + " دقیقه";
}

/* 🔐 چک راه‌اندازی لیگ */
function isLeagueBootstrapped() {
    return Storage.load(LEAGUE_BOOTSTRAP_KEY, false) === true;
}

function markLeagueBootstrapped() {
    Storage.save(LEAGUE_BOOTSTRAP_KEY, true);
}

/* =========================================================
   مرتب‌سازی جدول
   ========================================================= */

function emptyStanding(player) {
    return {
        id: player.id,
        username: player.username,
        avatar: player.avatar || "👤",
        points: 0,
        correctAnswers: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0
    };
}

function sortStandings(players) {
    return [...players].sort(function (a, b) {
        return (b.points - a.points) ||
               (b.correctAnswers - a.correctAnswers) ||
               (b.wins - a.wins) ||
               String(a.username).localeCompare(String(b.username), "fa");
    });
}

/* ✅ محاسبه‌ی جدول — نسخه‌ی صحیح (double_forfeit = ۰ امتیاز) */
function calculateStandings(group) {
    const map = {};
    group.players.forEach(p => map[p.id] = emptyStanding(p));

    group.matches.forEach(function (m) {
        if (m.status !== "completed" && m.status !== "forfeit") return;
        const h = map[m.homeId], a = map[m.awayId];
        if (!h || !a) return;

        h.played++; a.played++;
        h.correctAnswers += Number(m.homeScore || 0);
        a.correctAnswers += Number(m.awayScore || 0);

        // هر دو غایب: هر دو ۰ امتیاز
        if (m.result === "double_forfeit") {
            h.losses++; a.losses++;
            return;
        }

        if (m.homeScore > m.awayScore) {
            h.points += 3; h.wins++; a.losses++;
        } else if (m.awayScore > m.homeScore) {
            a.points += 3; a.wins++; h.losses++;
        } else {
            h.points++; a.points++;
            h.draws++; a.draws++;
        }
    });
    return sortStandings(Object.values(map));
}

/* =========================================================
   تولید برنامه Round-Robin
   ========================================================= */

function generateRoundRobin(players, seasonStart) {
    const list = players.map(p => ({ ...p }));
    if (list.length % 2) list.push({ id: "bye", username: "استراحت", isBye: true });

    const rounds = list.length - 1;
    const half = list.length / 2;
    const matches = [];
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

            matches.push({
                id: "m_" + round + "_" + i + "_" + home.id + "_" + away.id,
                round: round + 1,
                homeId: home.id,
                awayId: away.id,
                homeName: home.username,
                awayName: away.username,
                homeAvatar: home.avatar || "👤",
                awayAvatar: away.avatar || "👤",
                startTime: start.getTime(),
                endTime: start.getTime() + MATCH_WINDOW_MINUTES * 60000,
                status: "scheduled",
                homeScore: null,
                awayScore: null,
                homeSubmitted: false,
                awaySubmitted: false,
                result: null
            });
        }
        rotation = [rotation[0], rotation[rotation.length - 1]].concat(rotation.slice(1, -1));
    }
    return matches.sort((a, b) => a.startTime - b.startTime);
}

/* =========================================================
   حل مسابقات منقضی (forfeit)
   ========================================================= */

function resolveExpiredMatches(group, now) {
    let changed = false;
    group.matches.forEach(function (m) {
        if (m.status === "completed" || m.status === "forfeit") return;
        if (now < m.endTime) return;

        if (m.homeSubmitted && !m.awaySubmitted) {
            m.awayScore = 0;
            m.status = "forfeit";
            m.result = "home_forfeit_win";
        } else if (!m.homeSubmitted && m.awaySubmitted) {
            m.homeScore = 0;
            m.status = "forfeit";
            m.result = "away_forfeit_win";
        } else if (!m.homeSubmitted && !m.awaySubmitted) {
            m.homeScore = 0;
            m.awayScore = 0;
            m.status = "forfeit";
            m.result = "double_forfeit";
        } else {
            m.status = "completed";
            m.result = "played";
        }
        changed = true;
    });
    return changed;
}

/* =========================================================
   Local League API — بدون دیمو
   ========================================================= */

const LocalLeagueAPI = {
    async getState(username) {
        return Storage.load("leagueOnlineState_" + username, null);
    },
    async saveState(username, state) {
        Storage.save("leagueOnlineState_" + username, state);
        return state;
    },

    /* 🔐 کلید لیست ثبت‌نام هفته‌ی اول */
    _bootstrapQueueKey() {
        return "league_bootstrap_queue_" + getFridayStart();
    },
    _getBootstrapQueue() {
        return Storage.load(this._bootstrapQueueKey(), []);
    },
    _saveBootstrapQueue(queue) {
        Storage.save(this._bootstrapQueueKey(), queue);
    },

    /* ثبت‌نام هفته‌ی اول */
    async register(user, leagueId, paidAmount) {
        const queue = this._getBootstrapQueue();

        // چک تکراری
        if (queue.some(p => p.username.toLowerCase() === user.username.toLowerCase())) {
            return { status: "already_registered" };
        }

        // اضافه به صف
        queue.push({
            id: "user_" + user.username,
            username: user.username,
            avatar: user.avatar || "👤",
            leagueId: leagueId,
            registeredAt: Date.now(),
            paidAmount: paidAmount
        });
        this._saveBootstrapQueue(queue);

        // چک شروع خودکار
        if (queue.length >= LEAGUE_SETTINGS.MIN_PLAYERS_TO_START) {
            return await this._bootstrapLeague(queue);
        }

        return {
            status: "waiting",
            registered: queue.length,
            needed: LEAGUE_SETTINGS.MIN_PLAYERS_TO_START
        };
    },

    /* انصراف از ثبت‌نام */
    async cancelRegistration(username) {
        const queue = this._getBootstrapQueue();
        const filtered = queue.filter(
            p => p.username.toLowerCase() !== username.toLowerCase()
        );
        this._saveBootstrapQueue(filtered);
        return { ok: true };
    },

    /* چک وضعیت ثبت‌نام */
    async getRegistrationStatus(username, leagueId) {
        const queue = this._getBootstrapQueue();
        const registered = queue.filter(p => p.leagueId === leagueId).length;
        const inQueue = queue.some(
            p => p.username.toLowerCase() === username.toLowerCase()
        );
        return {
            inQueue,
            registered,
            needed: LEAGUE_SETTINGS.MIN_PLAYERS_TO_START
        };
    },

    /* 🎉 راه‌اندازی لیگ با ۸۰+ نفر */
    async _bootstrapLeague(queue) {
        const seasonStart = getFridayStart();

        // گروه‌بندی بر اساس leagueId
        const byLeague = {};
        queue.forEach(p => {
            if (!byLeague[p.leagueId]) byLeague[p.leagueId] = [];
            byLeague[p.leagueId].push(p);
        });

        const groups = [];
        const leftover = [];

        Object.keys(byLeague).forEach(leagueId => {
            const players = byLeague[leagueId].sort(() => Math.random() - 0.5);
            const groupSize = LEAGUES[leagueId].groupSize;
            const groupCount = Math.floor(players.length / groupSize);

            for (let i = 0; i < groupCount; i++) {
                const groupPlayers = players.slice(i * groupSize, (i + 1) * groupSize);
                groups.push({
                    id: "g_" + leagueId + "_" + seasonStart + "_" + (i + 1),
                    number: i + 1,
                    leagueId: leagueId,
                    players: groupPlayers.map(p => ({
                        id: p.id,
                        username: p.username,
                        avatar: p.avatar
                    })),
                    matches: generateRoundRobin(groupPlayers, seasonStart)
                });
            }

            // باقی‌مانده‌ها
            const remaining = players.slice(groupCount * groupSize);
            remaining.forEach(p => leftover.push(p));
        });

        // ذخیره‌ی گروه‌ها
        groups.forEach(group => {
            Storage.save("leagueGroup_" + group.id, group);
        });

        // state برای هر بازیکن
        groups.forEach(group => {
            group.players.forEach(p => {
                const state = {
                    seasonId: String(seasonStart),
                    seasonStart: seasonStart,
                    competitionEnd: getCompetitionEnd(seasonStart),
                    seasonEnd: getSeasonEnd(seasonStart),
                    leagueId: group.leagueId,
                    group: JSON.parse(JSON.stringify(group)),
                    finalised: false,
                    createdAt: Date.now()
                };
                this.saveState(p.username, state);
            });
        });

        // مارک راه‌اندازی
        markLeagueBootstrapped();

        // صف رو ریست کن
        this._saveBootstrapQueue(leftover);

        return {
            status: "bootstrapped",
            groupsCreated: groups.length,
            playersInLeague: groups.reduce((s, g) => s + g.players.length, 0)
        };
    },

    /* چک وضعیت صف (برای هفته‌های بعد از راه‌اندازی) */
    async getQueueStatus(username, leagueId) {
        const queue = this._getBootstrapQueue();
        const idx = queue.findIndex(
            p => p.username.toLowerCase() === username.toLowerCase()
        );
        const league = LEAGUES[leagueId];
        return {
            inQueue: idx !== -1,
            position: idx + 1,
            waiting: queue.length,
            needed: Math.max(0, league.groupSize - queue.length)
        };
    },

    /* ثبت نتیجه‌ی مسابقه */
    async submitScore(username, matchId, score) {
        const state = await this.getState(username);
        if (!state) throw new Error("اطلاعات لیگ پیدا نشد");

        const m = state.group.matches.find(x => x.id === matchId);
        if (!m) throw new Error("مسابقه پیدا نشد");

        const userId = "user_" + username;

        if (m.homeId === userId) {
            if (m.homeSubmitted) throw new Error("قبلاً نتیجه رو ثبت کردی");
            m.homeScore = score;
            m.homeSubmitted = true;
        } else if (m.awayId === userId) {
            if (m.awaySubmitted) throw new Error("قبلاً نتیجه رو ثبت کردی");
            m.awayScore = score;
            m.awaySubmitted = true;
        } else {
            throw new Error("این مسابقه متعلق به شما نیست");
        }

        if (m.homeSubmitted && m.awaySubmitted) {
            m.status = "completed";
            m.result = "played";
        }

        await this.saveState(username, state);
        await this._broadcastMatchResult(state.group.id, matchId, {
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeSubmitted: m.homeSubmitted,
            awaySubmitted: m.awaySubmitted,
            status: m.status,
            result: m.result
        });
        return state;
    },

    async _broadcastMatchResult(groupId, matchId, result) {
        const group = Storage.load("leagueGroup_" + groupId, null);
        if (!group) return;

        const m = group.matches.find(x => x.id === matchId);
        if (!m) return;

        Object.assign(m, result);
        Storage.save("leagueGroup_" + groupId, group);

        for (const p of group.players) {
            const st = await this.getState(p.username);
            if (st && st.group.id === groupId) {
                const mm = st.group.matches.find(x => x.id === matchId);
                if (mm) {
                    Object.assign(mm, result);
                    await this.saveState(p.username, st);
                }
            }
        }
    },

    async syncState(username) {
        const state = await this.getState(username);
        if (!state) return null;

        const group = Storage.load("leagueGroup_" + state.group.id, null);
        if (!group) return state;

        state.group.matches = group.matches;
        state.group.players = group.players;
        await this.saveState(username, state);
        return state;
    },

    async finalise(username) {
        const state = await this.getState(username);
        if (!state) return null;
        state.finalised = true;
        await this.saveState(username, state);
        return state;
    },

    /* هفته‌های بعد — ورود خودکار بدون شرط ۸۰ نفر */
    async weeklyJoin(user, leagueId, paidAmount) {
        // توی local، هر کاربر فقط خودش رو داره
        // پس یک گروه تک‌نفره می‌سازیم که با sync بعداً با بقیه merge می‌شه
        // برای تست، همون کاربر فعلی رو می‌ذاریم
        const seasonStart = getFridayStart();

        const players = [{
            id: "user_" + user.username,
            username: user.username,
            avatar: user.avatar || "👤"
        }];

        // 🔑 دنبال گروه موجود بگرد که جا داره
        // در local، همه‌ی گروه‌های ذخیره‌شده رو چک کن
        const allGroups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("leagueGroup_")) {
                try {
                    const g = JSON.parse(localStorage.getItem(key));
                    if (g && g.leagueId === leagueId && !g.finished) {
                        allGroups.push(g);
                    }
                } catch (_) {}
            }
        }

        // پیدا کردن گروه باز
        let targetGroup = allGroups.find(g =>
            g.players.length < LEAGUES[leagueId].groupSize &&
            !g.players.some(p => p.username === user.username)
        );

        if (targetGroup) {
            // چک نام تکراری
            const existingNames = targetGroup.players.map(p => p.username.toLowerCase());
            if (existingNames.includes(user.username.toLowerCase())) {
                throw new Error("نام کاربری تکراری در این گروه");
            }

            targetGroup.players.push({
                id: "user_" + user.username,
                username: user.username,
                avatar: user.avatar || "👤"
            });

            // اگه پر شد، مسابقات بساز
            if (targetGroup.players.length === LEAGUES[leagueId].groupSize) {
                targetGroup.matches = generateRoundRobin(targetGroup.players, seasonStart);
            }

            Storage.save("leagueGroup_" + targetGroup.id, targetGroup);
        } else {
            // گروه جدید
            targetGroup = {
                id: "g_" + leagueId + "_" + seasonStart + "_" + Date.now(),
                number: allGroups.length + 1,
                leagueId: leagueId,
                players: players,
                matches: [],
                finished: false
            };
            Storage.save("leagueGroup_" + targetGroup.id, targetGroup);
        }

        // state برای کاربر
        const state = {
            seasonId: String(seasonStart),
            seasonStart: seasonStart,
            competitionEnd: getCompetitionEnd(seasonStart),
            seasonEnd: getSeasonEnd(seasonStart),
            leagueId: leagueId,
            group: JSON.parse(JSON.stringify(targetGroup)),
            finalised: false,
            createdAt: Date.now()
        };
        await this.saveState(user.username, state);

        return {
            status: "joined",
            groupReady: targetGroup.players.length === LEAGUES[leagueId].groupSize,
            waiting: targetGroup.players.length,
            needed: LEAGUES[leagueId].groupSize
        };
    }
};

/* =========================================================
   Online League API
   ========================================================= */

const OnlineLeagueAPI = {
    _token: null,
    setToken(token) { this._token = token; },

    async request(path, options = {}) {
        const headers = { "Content-Type": "application/json" };
        if (this._token) headers["Authorization"] = "Bearer " + this._token;

        const response = await fetch(LEAGUE_API_BASE + path, {
            credentials: "include",
            headers,
            ...options
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "خطای سرور لیگ");
        }
        return response.json();
    },

    getState() { return this.request("/state"); },

    /* هفته‌ی اول — ثبت‌نام */
    register(user, leagueId, paidAmount) {
        return this.request("/register", {
            method: "POST",
            body: JSON.stringify({ leagueId, paidAmount })
        });
    },

    cancelRegistration(leagueId) {
        return this.request("/cancel", {
            method: "POST",
            body: JSON.stringify({ leagueId })
        });
    },

    getRegistrationStatus(leagueId) {
        return this.request("/registration-status?leagueId=" +
            encodeURIComponent(leagueId));
    },

    /* هفته‌های بعد — ورود خودکار */
    weeklyJoin(user, leagueId, paidAmount) {
        return this.request("/weekly-join", {
            method: "POST",
            body: JSON.stringify({ leagueId, paidAmount })
        });
    },

    getQueueStatus(leagueId) {
        return this.request("/queue/status?leagueId=" + encodeURIComponent(leagueId));
    },

    leaveQueue(leagueId) {
        return this.request("/queue/leave", {
            method: "POST",
            body: JSON.stringify({ leagueId })
        });
    },

    submitScore(username, matchId, score) {
        return this.request("/matches/" + encodeURIComponent(matchId) + "/score", {
            method: "POST",
            body: JSON.stringify({ score })
        });
    },

    finalise() {
        return this.request("/finalise", { method: "POST" });
    }
};

const LeagueAPI = LEAGUE_API_MODE === "online" ? OnlineLeagueAPI : LocalLeagueAPI;

/* =========================================================
   تایمر لیگ
   ========================================================= */

function createTimer(totalSeconds, onEnd) {
    clearLeagueTimer();
    const wrap = document.createElement("div");
    wrap.style.cssText =
        "width:70px;height:70px;border-radius:50%;display:grid;" +
        "place-items:center;background:#fff;border:7px solid #10b981;" +
        "font-weight:900;font-size:20px;color:#0f172a;";

    let remaining = totalSeconds;
    wrap.textContent = fa(remaining);

    leagueTimer = setInterval(function () {
        remaining--;
        wrap.textContent = fa(Math.max(0, remaining));
        wrap.style.borderColor = remaining <= 4 ? "#ef4444" :
                                 remaining <= 8 ? "#f59e0b" : "#10b981";
        if (remaining <= 0) { clearLeagueTimer(); onEnd(); }
    }, 1000);

    return {
        element: wrap,
        add(seconds) {
            remaining += seconds;
            wrap.textContent = fa(remaining);
        }
    };
}

/* =========================================================
   پیام لیگ
   ========================================================= */

function showLeagueMessage(title, text, buttonText, action) {
    categoriesDiv.innerHTML = "";
    const box = document.createElement("div");
    box.style.cssText =
        "max-width:500px;margin:auto;padding:28px;" +
        "background:linear-gradient(135deg,#1e40af,#06b6d4);" +
        "border:4px solid #fbbf24;border-radius:26px;color:white;" +
        "text-align:center;box-shadow:0 10px 30px #0004;";
    box.innerHTML =
        '<div style="font-size:28px;font-weight:900">' + title + '</div>' +
        '<div style="margin:16px 0;line-height:2;font-weight:700">' + text + '</div>';

    const btn = document.createElement("button");
    btn.className = "category next";
    btn.textContent = buttonText;
    btn.onclick = action;
    box.appendChild(btn);

    categoriesDiv.appendChild(box);
}

/* =========================================================
   نمایش قوانین لیگ — قابل استفاده در چند جا
   ========================================================= */

function buildLeagueRulesCard() {
    const card = document.createElement("div");
    card.style.cssText =
        "padding:18px;border-radius:18px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#f1f5f9,#e2e8f0);" +
        "border:3px solid #94a3b8;font-size:12px;font-weight:700;" +
        "color:#334155;line-height:2;";

    card.innerHTML =
        '<div style="font-size:15px;font-weight:900;color:#1e40af;' +
        'margin-bottom:10px;text-align:center;">📜 قوانین لیگ</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #3b82f6;">' +
        '<b style="color:#1e40af;">🎯 امتیازدهی:</b><br>' +
        '• برد: ۳ امتیاز<br>' +
        '• مساوی: ۱ امتیاز<br>' +
        '• باخت یا غیبت: ۰ امتیاز<br>' +
        '• در امتیاز مساوی: پاسخ صحیح بیشتر ملاک است' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #10b981;">' +
        '<b style="color:#047857;">📊 دسته‌ها:</b><br>' +
        '• 🥉 لیگ دسته ۳ (ورودی)<br>' +
        '• 🥈 لیگ دسته ۲<br>' +
        '• 🥇 لیگ دسته ۱<br>' +
        '• 👑 لیگ برتر' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #f59e0b;">' +
        '<b style="color:#b45309;">⬆️ صعود و ⬇️ سقوط:</b><br>' +
        '• صعود: ۳ نفر اول دسته ۳، ۲ و ۱<br>' +
        '• سقوط: ۳ نفر آخر دسته ۱ و ۲<br>' +
        '• سقوط لیگ برتر: ۴ نفر آخر<br>' +
        '• دسته ۳ سقوط نداره' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #a855f7;">' +
        '<b style="color:#7c3aed;">📅 زمان‌بندی:</b><br>' +
        '• مسابقات: جمعه تا چهارشنبه<br>' +
        '• پنجشنبه: نتایج و شروع لیگ جدید<br>' +
        '• قالب: همه با همه (Round-Robin)' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #ec4899;">' +
        '<b style="color:#be185d;">🎮 هر مسابقه:</b><br>' +
        '• ۹ سوال از ۳ موضوع (هر کدوم ۳ سوال)<br>' +
        '• زمان هر سوال: ۱۵ ثانیه<br>' +
        '• ❤️ در لیگ قلب مصرف نمی‌شه' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'border-right:4px solid #dc2626;">' +
        '<b style="color:#991b1b;">💰 ورودی هفتگی:</b><br>' +
        '• دسته ۳: ۱۰۰ سکه<br>' +
        '• دسته ۲: ۲۰۰ سکه<br>' +
        '• دسته ۱: ۳۰۰ سکه<br>' +
        '• لیگ برتر: ۵۰۰ سکه<br>' +
        '<b style="color:#991b1b;">🏆 جایزه قهرمان:</b><br>' +
        '• دسته ۳: ۵۰۰ سکه<br>' +
        '• دسته ۲: ۸۰۰ سکه<br>' +
        '• دسته ۱: ۱۲۰۰ سکه<br>' +
        '• لیگ برتر: ۲۵۰۰ سکه' +
        '</div>';

    return card;
}

/* =========================================================
   صفحه‌ی اصلی لیگ
   ========================================================= */

async function showLeagueScreen() {
    clearLeagueTimer();
    clearLeaguePoll();
    categoriesDiv.innerHTML = "";
    categoriesDiv.classList.remove("no-scroll");

    if (typeof User !== "undefined") {
        User.showBottomBar();
        User.updateTopBar();
    }
    if (typeof setActiveTab === "function") setActiveTab("league");

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    if ((user.level || 1) < LEAGUE_MIN_LEVEL) {
        showLeagueMessage(
            "🔒 لیگ هنوز باز نشده",
            "برای ورود به لیگ باید به سطح " + fa(LEAGUE_MIN_LEVEL) + " برسی.<br>" +
            "سطح فعلی: " + fa(user.level || 1),
            "بریم بازی کنیم",
            showHomeScreen
        );
        return;
    }

    let state;
    try {
        state = await LeagueAPI.getState(user.username);
    } catch (e) {
        showLeagueMessage("خطای اتصال", e.message, "🔄 تلاش دوباره", showLeagueScreen);
        return;
    }

    const leagueId = user.leagueId || "division3";
    const league = LEAGUES[leagueId];
    const bootstrapped = isLeagueBootstrapped();

    /* ─── حالت ۱: کاربر توی گروه ─── */
    if (state && state.group) {
        if (LEAGUE_API_MODE === "local" && LeagueAPI.syncState) {
            try { state = await LeagueAPI.syncState(user.username) || state; } catch (_) {}
        }
        if (LEAGUE_API_MODE === "local" && resolveExpiredMatches(state.group, Date.now())) {
            await LeagueAPI.saveState(user.username, state);
        }
        if (getLeaguePhase() === "results" || Date.now() >= state.competitionEnd) {
            await finaliseLeagueSeason(user, state);
            return;
        }
        renderLeagueDashboard(user, state);
        return;
    }

    /* ─── حالت ۲: پنجشنبه ─── */
    if (getLeaguePhase() === "results") {
        showLeagueMessage(
            "📊 روز اعلام نتایج",
            "امروز پنجشنبه است.<br>لیگ جدید از جمعه شروع می‌شه.",
            "بازگشت",
            showHomeScreen
        );
        return;
    }

    /* ─── حالت ۳: لیگ راه‌اندازی نشده (هفته‌ی اول) ─── */
    if (!bootstrapped) {
        const status = LEAGUE_API_MODE === "local"
            ? await LeagueAPI.getRegistrationStatus(user.username, leagueId)
            : await LeagueAPI.getRegistrationStatus(leagueId);

        if (status.inQueue) {
            showRegisteredWaiting(user, {
                registered: status.registered,
                needed: status.needed,
                startsAt: getNextFridayStart()
            });
            return;
        }

        if ((user.coins || 0) < league.entryFee) {
            showLeagueMessage(
                "💰 سکه کافی نداری",
                "برای ورود به " + league.name + " به " +
                fa(league.entryFee) + " سکه نیاز داری.<br>" +
                "موجودی: " + fa(user.coins || 0) + " سکه",
                "بازگشت",
                showHomeScreen
            );
            return;
        }

        showRegistrationForm(user, {
            registered: status.registered,
            needed: status.needed,
            startsAt: getNextFridayStart()
        });
        return;
    }

    /* ─── حالت ۴: راه‌اندازی شده — هفته‌های بعد ─── */
    if ((user.coins || 0) < league.entryFee) {
        showLeagueMessage(
            "💰 سکه کافی نداری",
            "ورودی هفتگی " + league.name + ": " +
            fa(league.entryFee) + " سکه<br>" +
            "موجودی: " + fa(user.coins || 0) + " سکه",
            "بازگشت",
            showHomeScreen
        );
        return;
    }

    showWeeklyEntry(user, league);
}

/* =========================================================
   صفحه‌ی ثبت‌نام (هفته‌ی اول)
   ========================================================= */

function showRegistrationForm(user, data) {
    const league = LEAGUES[user.leagueId || "division3"];
    const MIN_PLAYERS = LEAGUE_SETTINGS.MIN_PLAYERS_TO_START;
    const GROUP_SIZE = league.groupSize;

    const registered = data.registered || 0;
    const progress = Math.min(100, Math.round((registered / MIN_PLAYERS) * 100));
    const remaining = Math.max(0, MIN_PLAYERS - registered);
    const currentGroups = Math.floor(registered / GROUP_SIZE);
    const neededGroups = LEAGUE_SETTINGS.MIN_GROUPS_TO_START;
    const canAfford = (user.coins || 0) >= league.entryFee;

    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);" +
        "color:white;box-shadow:0 10px 30px rgba(139,92,246,0.4);" +
        "margin-bottom:20px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">🏆</div>' +
        '<div style="font-size:24px;font-weight:900;margin-bottom:8px;">' +
        'لیگ هفتگی</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">' +
        'با بازیکنان واقعی رقابت کن</div>';
    box.appendChild(header);

    // پیام «به‌زودی»
    const comingSoon = document.createElement("div");
    comingSoon.style.cssText =
        "padding:16px;border-radius:16px;text-align:center;" +
        "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
        "border:3px solid #fbbf24;margin-bottom:16px;" +
        "color:#78350f;font-weight:900;font-size:14px;line-height:1.8;";
    comingSoon.innerHTML =
        '🔒 <b>لیگ به‌زودی فعال می‌شه!</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'منتظریم ' + fa(MIN_PLAYERS) + ' نفر ثبت‌نام کنن</span>';
    box.appendChild(comingSoon);

    // نوار پیشرفت
    const progressBox = document.createElement("div");
    progressBox.style.cssText =
        "padding:20px;border-radius:20px;background:white;" +
        "border:3px solid #6366f1;margin-bottom:16px;" +
        "box-shadow:0 5px 0 #4338ca;";
    progressBox.innerHTML =
        '<div style="display:flex;justify-content:space-between;' +
        'align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:15px;font-weight:900;color:#1e293b;">' +
        '👥 ' + fa(registered) + ' از ' + fa(MIN_PLAYERS) + ' نفر' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#6366f1;">' +
        fa(progress) + '٪</div></div>' +
        '<div style="height:16px;background:#e2e8f0;border-radius:12px;' +
        'overflow:hidden;border:2px solid #cbd5e1;">' +
        '<div style="height:100%;width:' + progress + '%;' +
        'background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);' +
        'border-radius:12px;transition:width 0.6s ease;"></div></div>' +
        (remaining > 0
            ? '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:800;color:#64748b;">' +
              '⏳ ' + fa(remaining) + ' نفر دیگه مونده</div>'
            : '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:900;color:#10b981;">' +
              '✅ تعداد کافیه! به‌زودی شروع می‌شه</div>');
    box.appendChild(progressBox);

    // اطلاعات گروه
    const groupInfo = document.createElement("div");
    groupInfo.style.cssText =
        "padding:14px;border-radius:14px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:3px solid #3b82f6;text-align:center;" +
        "font-size:13px;font-weight:800;color:#1e40af;line-height:1.9;";
    groupInfo.innerHTML =
        '🎯 <b>هدف: ' + fa(neededGroups) + ' گروه ' +
        fa(GROUP_SIZE) + ' نفره</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'الان ' + fa(currentGroups) + ' گروه تشکیل شده ' +
        '(نیاز به ' + fa(Math.max(0, neededGroups - currentGroups)) +
        ' گروه دیگه)</span>';
    box.appendChild(groupInfo);

    // اطلاعات لیگ
    const info = document.createElement("div");
    info.style.cssText =
        "padding:16px;border-radius:16px;background:#f8fafc;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;" +
        "font-size:13px;font-weight:700;color:#334155;line-height:2;";
    info.innerHTML =
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>💰 ورودی:</span>' +
        '<b>' + fa(league.entryFee) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🏆 جایزه نفر اول:</span>' +
        '<b>' + fa(league.rewards[1]) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>👥 گروه:</span>' +
        '<b>' + fa(GROUP_SIZE) + ' نفره</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🪙 موجودی شما:</span>' +
        '<b style="color:' + (canAfford ? '#10b981' : '#dc2626') + ';">' +
        fa(user.coins || 0) + ' سکه</b></div>';
    box.appendChild(info);

    // حریم خصوصی
    const privacy = document.createElement("div");
    privacy.style.cssText =
        "padding:12px;border-radius:12px;background:#f1f5f9;" +
        "border:2px dashed #94a3b8;margin-bottom:16px;" +
        "text-align:center;font-size:12px;font-weight:800;color:#475569;line-height:1.8;";
    privacy.innerHTML =
        '🔒 <b>حریم خصوصی</b><br>' +
        '<span style="font-size:11px;font-weight:700;">' +
        'اسم بازیکنان دیگه نمایش داده نمی‌شه</span>';
    box.appendChild(privacy);

    // دکمه ثبت‌نام
    const registerBtn = document.createElement("button");
    registerBtn.style.cssText =
        "width:100%;padding:18px;border-radius:18px;" +
        "background:linear-gradient(180deg," +
        (canAfford ? "#22c55e,#16a34a" : "#94a3b8,#64748b") + ");" +
        "color:white;border:3px solid " + (canAfford ? "#4ade80" : "#cbd5e1") + ";" +
        "font-size:16px;font-weight:900;font-family:inherit;" +
        "cursor:" + (canAfford ? "pointer" : "not-allowed") + ";" +
        "box-shadow:0 6px 0 " + (canAfford ? "#14532d" : "#334155") + ";" +
        "text-shadow:0 2px 4px rgba(0,0,0,0.3);";
    registerBtn.textContent = canAfford
        ? "✋ ثبت‌نام می‌کنم"
        : "💰 سکه کافی نداری";
    registerBtn.disabled = !canAfford;
    registerBtn.onclick = () => registerForLeague(user, league);
    box.appendChild(registerBtn);

    // دکمه بازگشت
    const backBtn = document.createElement("button");
    backBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;margin-top:10px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    backBtn.textContent = "🔙 بازگشت";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);

    // قوانین
    box.appendChild(buildLeagueRulesCard());

    categoriesDiv.appendChild(box);
}

/* =========================================================
   صفحه‌ی انتظار (هفته‌ی اول، بعد از ثبت‌نام)
   ========================================================= */

function showRegisteredWaiting(user, data) {
    const league = LEAGUES[user.leagueId || "division3"];
    const MIN_PLAYERS = LEAGUE_SETTINGS.MIN_PLAYERS_TO_START;
    const GROUP_SIZE = league.groupSize;

    const registered = data.registered || 0;
    const progress = Math.min(100, Math.round((registered / MIN_PLAYERS) * 100));
    const remaining = Math.max(0, MIN_PLAYERS - registered);
    const currentGroups = Math.floor(registered / GROUP_SIZE);
    const neededGroups = LEAGUE_SETTINGS.MIN_GROUPS_TO_START;

    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    // کارت موفقیت
    const successCard = document.createElement("div");
    successCard.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg,#10b981,#059669);" +
        "color:white;box-shadow:0 10px 30px rgba(16,185,129,0.4);" +
        "margin-bottom:20px;";
    successCard.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">✅</div>' +
        '<div style="font-size:22px;font-weight:900;margin-bottom:8px;">' +
        'ثبت‌نام شدی!</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">' +
        'وقتی لیگ شروع شه، بهت خبر می‌دیم</div>';
    box.appendChild(successCard);

    // کارت خود کاربر
    const selfCard = document.createElement("div");
    selfCard.style.cssText =
        "display:flex;align-items:center;gap:12px;padding:14px;" +
        "border-radius:16px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#d1fae5,#a7f3d0);" +
        "border:3px solid #10b981;box-shadow:0 4px 0 #047857;";
    selfCard.innerHTML =
        '<div style="font-size:28px;">' + safeAvatar(user.avatar, 26) + '</div>' +
        '<div style="flex:1;">' +
        '<div style="font-size:14px;font-weight:900;color:#047857;">' +
        user.username + ' (شما)</div>' +
        '<div style="font-size:11px;font-weight:700;color:#059669;margin-top:2px;">' +
        '✅ توی لیست ثبت‌نامی</div></div>';
    box.appendChild(selfCard);

    // نوار پیشرفت
    const progressBox = document.createElement("div");
    progressBox.style.cssText =
        "padding:20px;border-radius:20px;background:white;" +
        "border:3px solid #10b981;margin-bottom:16px;" +
        "box-shadow:0 5px 0 #047857;";
    progressBox.innerHTML =
        '<div style="display:flex;justify-content:space-between;' +
        'align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:15px;font-weight:900;color:#1e293b;">' +
        '👥 ' + fa(registered) + ' از ' + fa(MIN_PLAYERS) + ' نفر' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#10b981;">' +
        fa(progress) + '٪</div></div>' +
        '<div style="height:16px;background:#e2e8f0;border-radius:12px;' +
        'overflow:hidden;border:2px solid #cbd5e1;">' +
        '<div style="height:100%;width:' + progress + '%;' +
        'background:linear-gradient(90deg,#10b981,#22c55e,#4ade80);' +
        'border-radius:12px;transition:width 0.6s ease;"></div></div>' +
        (remaining > 0
            ? '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:800;color:#64748b;">' +
              '⏳ ' + fa(remaining) + ' نفر دیگه مونده</div>'
            : '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:900;color:#10b981;">' +
              '🎉 تعداد کافیه! به‌زودی شروع می‌شه</div>');
    box.appendChild(progressBox);

    // اطلاعات گروه
    const groupInfo = document.createElement("div");
    groupInfo.style.cssText =
        "padding:14px;border-radius:14px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:3px solid #3b82f6;text-align:center;" +
        "font-size:13px;font-weight:800;color:#1e40af;line-height:1.9;";
    groupInfo.innerHTML =
        '🎯 <b>هدف: ' + fa(neededGroups) + ' گروه ' +
        fa(GROUP_SIZE) + ' نفره</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'الان ' + fa(currentGroups) + ' گروه تشکیل شده ' +
        '(نیاز به ' + fa(Math.max(0, neededGroups - currentGroups)) +
        ' گروه دیگه)</span>';
    box.appendChild(groupInfo);

    // اطلاعات شروع
    const startInfo = document.createElement("div");
    startInfo.style.cssText =
        "padding:16px;border-radius:16px;" +
        "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
        "border:3px solid #fbbf24;margin-bottom:16px;" +
        "text-align:center;font-size:13px;font-weight:800;color:#78350f;line-height:2;";
    startInfo.innerHTML =
        '📅 شروع: <b>' + formatDateTime(data.startsAt) + '</b><br>' +
        '⏰ ' + formatRemaining(data.startsAt - Date.now()) + ' مونده';
    box.appendChild(startInfo);

    // حریم خصوصی
    const privacy = document.createElement("div");
    privacy.style.cssText =
        "padding:14px;border-radius:14px;background:#f1f5f9;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;text-align:center;" +
        "font-size:12px;font-weight:700;color:#64748b;line-height:1.9;";
    privacy.innerHTML =
        '🔒 <b>حریم خصوصی</b><br>' +
        'اسم بازیکنان دیگه نمایش داده نمی‌شه<br>' +
        '<span style="color:#3b82f6;">وقتی لیگ شروع شه، حریفانت رو می‌بینی</span>';
    box.appendChild(privacy);

    // دکمه‌ها
    const refreshBtn = document.createElement("button");
    refreshBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;" +
        "background:linear-gradient(180deg,#3b82f6,#1d4ed8);" +
        "color:white;border:3px solid #60a5fa;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #1e3a8a;";
    refreshBtn.textContent = "🔄 بروزرسانی";
    refreshBtn.onclick = showLeagueScreen;
    box.appendChild(refreshBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;margin-top:10px;" +
        "background:linear-gradient(180deg,#ef4444,#b91c1c);" +
        "color:white;border:3px solid #f87171;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #7f1d1d;";
    cancelBtn.textContent = "❌ انصراف و بازگشت سکه";
    cancelBtn.onclick = function () {
        showConfirmModal({
            emoji: "❌",
            title: "انصراف از لیگ",
            message: "مطمئنی؟ " + fa(league.entryFee) + " سکه برمی‌گرده",
            color: "#ef4444", shadow: "#7f1d1d",
            confirmText: "بله انصراف",
            cancelText: "بمون",
            onConfirm: () => cancelLeagueRegistration(user)
        });
    };
    box.appendChild(cancelBtn);

    // قوانین
    box.appendChild(buildLeagueRulesCard());

    categoriesDiv.appendChild(box);

    // پولینگ خودکار
    leaguePollInterval = setInterval(async function () {
        try {
            const status = LEAGUE_API_MODE === "local"
                ? await LeagueAPI.getRegistrationStatus(user.username, league.id)
                : await LeagueAPI.getRegistrationStatus(league.id);

            if (status.registered !== data.registered) {
                clearLeaguePoll();
                showLeagueScreen();
            }
        } catch (_) {}
    }, 10000);
}

/* =========================================================
   ورود هفتگی (هفته‌های بعد)
   ========================================================= */

function showWeeklyEntry(user, league) {
    categoriesDiv.innerHTML = "";
    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg," + league.color + ",#1e40af);" +
        "color:white;box-shadow:0 10px 30px rgba(0,0,0,0.3);" +
        "margin-bottom:20px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">' + league.emoji + '</div>' +
        '<div style="font-size:24px;font-weight:900;margin-bottom:8px;">' +
        league.name + '</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">' +
        'ورودی هفتگی این لیگ</div>';
    box.appendChild(header);

    // اطلاعات
    const info = document.createElement("div");
    info.style.cssText =
        "padding:16px;border-radius:16px;background:#f8fafc;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;" +
        "font-size:13px;font-weight:700;color:#334155;line-height:2;";
    info.innerHTML =
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>💰 ورودی این هفته:</span>' +
        '<b>' + fa(league.entryFee) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🏆 جایزه نفر اول:</span>' +
        '<b>' + fa(league.rewards[1]) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🪙 موجودی شما:</span>' +
        '<b style="color:#10b981;">' + fa(user.coins || 0) + ' سکه</b></div>';
    box.appendChild(info);

    // توضیح
    const explain = document.createElement("div");
    explain.style.cssText =
        "padding:14px;border-radius:14px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:3px solid #3b82f6;text-align:center;" +
        "font-size:13px;font-weight:800;color:#1e40af;line-height:1.9;";
    explain.innerHTML =
        '🎯 <b>وقتی پرداخت کنی:</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'خودکار توی گروهت قرار می‌گیری<br>' +
        'با ۹ بازیکن دیگه مسابقه می‌دی<br>' +
        'آخر هفته: صعود یا سقوط</span>';
    box.appendChild(explain);

    // دکمه پرداخت
    const payBtn = document.createElement("button");
    payBtn.style.cssText =
        "width:100%;padding:18px;border-radius:18px;" +
        "background:linear-gradient(180deg,#22c55e,#16a34a);" +
        "color:white;border:3px solid #4ade80;" +
        "font-size:16px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 6px 0 #14532d;" +
        "text-shadow:0 2px 4px rgba(0,0,0,0.3);";
    payBtn.textContent = "💳 پرداخت و ورود به لیگ";
    payBtn.onclick = () => joinWeeklyLeague(user, league);
    box.appendChild(payBtn);

    // دکمه بازگشت
    const backBtn = document.createElement("button");
    backBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;margin-top:10px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    backBtn.textContent = "🔙 بازگشت";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);

    // قوانین
    box.appendChild(buildLeagueRulesCard());

    categoriesDiv.appendChild(box);
}

/* =========================================================
   ثبت‌نام در لیگ (هفته‌ی اول)
   ========================================================= */

async function registerForLeague(user, league) {
    try {
        // ۱. کسر سکه
        await User.addCoins(-league.entryFee);

        // ۲. ثبت‌نام
        let result;
        if (LEAGUE_API_MODE === "local") {
            result = await LeagueAPI.register(user, league.id, league.entryFee);
        } else {
            result = await LeagueAPI.register(user, league.id, league.entryFee);
        }

        if (result.status === "bootstrapped") {
            // 🎉 لیگ راه‌اندازی شد!
            await Users.updateCurrent({
                leaguePaidWeek: getFridayStart(),
                leaguePaidAmount: league.entryFee
            });

            showInfoModal({
                emoji: "🎉",
                title: "لیگ شروع شد!",
                message:
                    "گروه‌ها تشکیل شدن!<br>" +
                    fa(result.groupsCreated) + " گروه ساخته شد.<br>" +
                    "الان برو مسابقاتت رو ببین",
                color: "#22c55e", shadow: "#14532d",
                buttonText: "🚀 بریم!",
                onClose: showLeagueScreen
            });
        } else {
            // هنوز منتظر
            await Users.updateCurrent({
                leaguePaidWeek: getFridayStart(),
                leaguePaidAmount: league.entryFee
            });

            showInfoModal({
                emoji: "✅",
                title: "ثبت‌نام موفق!",
                message:
                    "وقتی " + fa(LEAGUE_SETTINGS.MIN_PLAYERS_TO_START) +
                    " نفر ثبت‌نام کنن، لیگ شروع می‌شه",
                color: "#10b981", shadow: "#047857",
                onClose: showLeagueScreen
            });
        }
    } catch (e) {
        // برگشت سکه
        await User.addCoins(league.entryFee);
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: e.message || "ثبت‌نام ناموفق",
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* =========================================================
   انصراف از ثبت‌نام
   ========================================================= */

async function cancelLeagueRegistration(user) {
    try {
        const league = LEAGUES[user.leagueId || "division3"];

        if (LEAGUE_API_MODE === "local") {
            await LeagueAPI.cancelRegistration(user.username);
        } else {
            await LeagueAPI.cancelRegistration(league.id);
        }

        // برگشت سکه
        await User.addCoins(league.entryFee);
        await Users.updateCurrent({
            leaguePaidWeek: null,
            leaguePaidAmount: 0
        });

        showInfoModal({
            emoji: "✅",
            title: "انصراف موفق",
            message: fa(league.entryFee) + " سکه برگشت",
            color: "#10b981", shadow: "#047857",
            onClose: showHomeScreen
        });
    } catch (e) {
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: e.message,
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* =========================================================
   ورود هفتگی (پرداخت و join)
   ========================================================= */

async function joinWeeklyLeague(user, league) {
    try {
        // ۱. کسر سکه
        await User.addCoins(-league.entryFee);

        // ۲. join
        let result;
        if (LEAGUE_API_MODE === "local") {
            result = await LeagueAPI.weeklyJoin(user, league.id, league.entryFee);
        } else {
            result = await LeagueAPI.weeklyJoin(user, league.id, league.entryFee);
        }

        await Users.updateCurrent({
            leaguePaidWeek: getFridayStart(),
            leaguePaidAmount: league.entryFee
        });

        showInfoModal({
            emoji: "🎉",
            title: "ورود موفق!",
            message: result.groupReady
                ? "گروهت آماده‌ست! برو رقابت کن"
                : "توی گروهت قرار گرفتی. منتظر شروع مسابقات باش",
            color: "#10b981", shadow: "#047857",
            onClose: showLeagueScreen
        });
    } catch (e) {
        // برگشت سکه
        await User.addCoins(league.entryFee);
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: e.message || "پرداخت ناموفق",
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* =========================================================
   داشبورد لیگ
   ========================================================= */

function renderLeagueDashboard(user, state) {
    const league = LEAGUES[state.leagueId];
    const standings = calculateStandings(state.group);
    const userId = "user_" + user.username;
    const now = Date.now();

    categoriesDiv.innerHTML = "";

    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:22px;border-radius:22px;color:white;text-align:center;" +
        "background:linear-gradient(135deg," + league.color + ",#1e40af);" +
        "margin-bottom:14px;";
    header.innerHTML =
        '<div style="font-size:25px;font-weight:900">' +
        league.emoji + ' ' + league.name + '</div>' +
        '<div style="margin-top:8px;font-weight:700">گروه ' +
        fa(state.group.number) + ' — ' + fa(state.group.players.length) + ' نفر</div>' +
        '<div style="margin-top:7px">پایان مسابقات: ' +
        formatRemaining(state.competitionEnd - now) + '</div>';
    categoriesDiv.appendChild(header);

    // قوانین خلاصه
    const rules = document.createElement("div");
    rules.style.cssText =
        "padding:12px;border-radius:14px;background:#e2e8f0;" +
        "color:#334155;text-align:center;font-weight:800;" +
        "margin-bottom:14px;line-height:1.8;font-size:12px;";
    rules.innerHTML =
        "برد ۳، مساوی ۱، باخت یا غیبت ۰ امتیاز<br>" +
        "در امتیاز برابر: پاسخ صحیح بیشتر";
    categoriesDiv.appendChild(rules);

    // جدول
    const title = document.createElement("h3");
    title.textContent = "📊 جدول گروه";
    categoriesDiv.appendChild(title);

    const table = document.createElement("div");
    table.className = "league-table";
    standings.forEach(function (p, index) {
        const rank = index + 1;
        const row = document.createElement("div");
        row.className = "league-row" + (p.id === userId ? " is-user" : "");
        let movement = "";
        if (league.promote && rank <= league.promote) movement = "⬆️";
        if (league.relegate && rank > standings.length - league.relegate) movement = "⬇️";

        row.innerHTML =
            '<div class="league-rank">' +
            (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : fa(rank)) +
            '</div>' +
            '<div class="league-avatar">' + safeAvatar(p.avatar, 30) + '</div>' +
            '<div class="league-name-text">' + p.username +
            (p.id === userId ? " (شما)" : "") + '</div>' +
            '<div style="font-size:11px;color:#64748b">صحیح: ' +
            fa(p.correctAnswers) + '</div>' +
            '<div class="league-points">' + fa(p.points) + '</div>' +
            '<div>' + movement + '</div>';
        table.appendChild(row);
    });
    categoriesDiv.appendChild(table);

    // مسابقات
    const matchTitle = document.createElement("h3");
    matchTitle.textContent = "🎮 برنامه مسابقات شما";
    matchTitle.style.marginTop = "20px";
    categoriesDiv.appendChild(matchTitle);

    const userMatches = state.group.matches.filter(
        m => m.homeId === userId || m.awayId === userId
    );

    if (userMatches.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText =
            "text-align:center;padding:20px;color:#64748b;font-weight:700";
        empty.textContent = "هنوز مسابقه‌ای برای شما برنامه‌ریزی نشده";
        categoriesDiv.appendChild(empty);
    }

    userMatches.forEach(function (m) {
        const isHome = m.homeId === userId;
        const opponentName = isHome ? m.awayName : m.homeName;
        const opponentAvatar = isHome ? m.awayAvatar : m.homeAvatar;
        const mySubmitted = isHome ? m.homeSubmitted : m.awaySubmitted;
        const oppSubmitted = isHome ? m.awaySubmitted : m.homeSubmitted;
        const myScore = isHome ? m.homeScore : m.awayScore;
        const active = now >= m.startTime && now < m.endTime && !mySubmitted;

        const card = document.createElement("div");
        card.style.cssText =
            "padding:14px;border:2px solid #cbd5e1;border-radius:16px;" +
            "margin-bottom:10px;background:#fff";

        let status;
        if (m.status === "completed" || m.status === "forfeit") {
            status = "✅ تمام شده";
        } else if (active) {
            status = "🟢 فعال";
        } else if (now < m.startTime) {
            status = "⏳ در انتظار";
        } else if (mySubmitted && !oppSubmitted) {
            status = "⏳ منتظر حریف";
        } else {
            status = "❌ از دست رفته";
        }

        card.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px">' +
            '<div style="font-size:32px">' + opponentAvatar + '</div>' +
            '<div style="flex:1"><b>' + opponentName + '</b>' +
            '<div style="font-size:12px;margin-top:4px">' +
            formatDateTime(m.startTime) + '</div></div>' +
            '<b>' + status + '</b></div>';

        if (active) {
            const btn = document.createElement("button");
            btn.className = "match-btn match-btn-play";
            btn.textContent = "🎮 شروع مسابقه";
            btn.onclick = () => startLeagueMatch(state, m);
            card.appendChild(btn);
        } else if (m.status === "completed" || m.status === "forfeit") {
            const score = document.createElement("div");
            score.style.cssText =
                "text-align:center;margin-top:8px;font-weight:900;font-size:18px";
            score.textContent = fa(m.homeScore) + " - " + fa(m.awayScore);
            card.appendChild(score);
        } else if (mySubmitted && !oppSubmitted) {
            const info = document.createElement("div");
            info.style.cssText =
                "text-align:center;margin-top:8px;font-size:12px;" +
                "color:#64748b;font-weight:700";
            info.textContent = "نتیجه تو: " + fa(myScore) + " — منتظر حریف";
            card.appendChild(info);
        }

        categoriesDiv.appendChild(card);
    });
}

/* =========================================================
   بارگذاری موضوعات و سوالات
   ========================================================= */

async function getValidLeagueTopics() {
    if (validTopicsCache) return validTopicsCache;

    const results = await Promise.all(CATEGORIES.map(async function (cat) {
        try {
            const response = await fetch("questions/" + cat.file);
            const data = await response.json();
            return { cat, questions: Array.isArray(data) ? data : [] };
        } catch (_) {
            return { cat, questions: [] };
        }
    }));
    validTopicsCache = results.filter(x => x.questions.length >= 3);
    return validTopicsCache;
}

function difficultyWeights(leagueId) {
    return {
        division3: { easy: .60, medium: .35, hard: .05 },
        division2: { easy: .30, medium: .50, hard: .20 },
        division1: { easy: .10, medium: .40, hard: .50 },
        premier: { easy: 0, medium: .20, hard: .80 }
    }[leagueId];
}

function pickQuestions(pool, count, weights) {
    const buckets = { easy: [], medium: [], hard: [] };
    pool.forEach(q => (buckets[q.difficulty] || buckets.medium).push(q));
    Object.values(buckets).forEach(a => a.sort(() => Math.random() - .5));

    const out = [];
    while (out.length < count) {
        const r = Math.random();
        const target = r < weights.easy ? "easy" :
                       r < weights.easy + weights.medium ? "medium" : "hard";
        const order = target === "easy" ? ["easy", "medium", "hard"] :
                      target === "hard" ? ["hard", "medium", "easy"] :
                      ["medium", "easy", "hard"];
        const key = order.find(k => buckets[k].length);
        if (!key) break;
        out.push(buckets[key].shift());
    }
    return out;
}

/* =========================================================
   شروع مسابقه
   ========================================================= */

async function startLeagueMatch(state, match) {
    categoriesDiv.innerHTML =
        '<div style="text-align:center;padding:60px;font-weight:900">' +
        'در حال بارگذاری سوالات...</div>';

    const topics = await getValidLeagueTopics();
    if (topics.length < 3) {
        alert("حداقل سه موضوع دارای سوال لازم است");
        showLeagueScreen();
        return;
    }
    topics.sort(() => Math.random() - .5);
    const selected = topics.slice(0, 3);
    const weights = difficultyWeights(state.leagueId);

    const questions = [];
    selected.forEach(t => pickQuestions(t.questions, 3, weights)
        .forEach(q => questions.push({ ...q, topicName: t.cat.title })));

    runLeagueQuiz(state, match, questions.slice(0, 9));
}

/* =========================================================
   اجرای کوییز لیگ
   ========================================================= */

function runLeagueQuiz(state, match, questions) {
    let index = 0, score = 0;

    function next() {
        clearLeagueTimer();
        categoriesDiv.innerHTML = "";

        if (index >= questions.length) {
            submitLeagueResult(state, match, score);
            return;
        }

        const q = questions[index];
        let answered = false;
        const buttons = []; // ✅ قبل از createTimer

        const top = document.createElement("div");
        top.style.cssText = "display:flex;align-items:center;gap:12px;margin-bottom:16px";

        const timer = createTimer(QUESTION_SECONDS, function () {
            if (answered) return;
            answered = true;
            buttons.forEach(b => b.disabled = true);
            if (buttons[q.correct]) buttons[q.correct].classList.add("correct");
            setTimeout(() => { index++; next(); }, 1000);
        });
        top.appendChild(timer.element);

        const info = document.createElement("div");
        info.innerHTML =
            '<b>' + q.topicName + '</b>' +
            '<div style="margin-top:5px;color:#64748b">سوال ' +
            fa(index + 1) + ' از ' + fa(questions.length) + '</div>';
        top.appendChild(info);
        categoriesDiv.appendChild(top);

        const box = document.createElement("div");
        box.className = "question-box";
        box.textContent = String(q.question).replace(/^[۰-۹0-9]+\s*[.\-:]\s*/, "");
        categoriesDiv.appendChild(box);

        q.answers.forEach(function (answer, answerIndex) {
            const btn = document.createElement("button");
            btn.className = "category";
            btn.textContent = answer;
            btn.onclick = function () {
                if (answered) return;
                answered = true;
                clearLeagueTimer();
                buttons.forEach(b => b.disabled = true);
                if (answerIndex === q.correct) {
                    score++;
                    btn.classList.add("correct");
                } else {
                    btn.classList.add("wrong");
                    if (buttons[q.correct]) buttons[q.correct].classList.add("correct");
                }
                setTimeout(() => { index++; next(); }, 850);
            };
            buttons.push(btn);
            categoriesDiv.appendChild(btn);
        });
    }
    next();
}

/* =========================================================
   ارسال نتیجه
   ========================================================= */

async function submitLeagueResult(state, match, score) {
    categoriesDiv.innerHTML =
        '<div style="text-align:center;padding:60px;font-weight:900">' +
        'در حال ثبت نتیجه...</div>';

    // ✅ username از قبل
    const user = Users.loadCurrent();
    if (!user) {
        showLeagueMessage("خطا", "کاربر یافت نشد", "بازگشت", showHomeScreen);
        return;
    }

    try {
        await LeagueAPI.submitScore(user.username, match.id, score);
        showLeagueMessage(
            "✅ نتیجه ثبت شد",
            "تعداد پاسخ صحیح شما: " + fa(score),
            "بازگشت به لیگ",
            showLeagueScreen
        );
    } catch (e) {
        showLeagueMessage(
            "ثبت نتیجه ناموفق بود",
            e.message || "خطای نامشخص",
            "🔄 تلاش دوباره",
            () => submitLeagueResult(state, match, score)
        );
    }
}

/* =========================================================
   پایان فصل و اعلام نتایج
   ========================================================= */

async function finaliseLeagueSeason(user, state) {
    const standings = calculateStandings(state.group);
    const userId = "user_" + user.username;
    const rank = standings.findIndex(p => p.id === userId) + 1;
    const league = LEAGUES[state.leagueId];

    let nextLeagueId = state.leagueId;
    const idx = LEAGUE_ORDER.indexOf(state.leagueId);
    let change = "ماندن در " + league.name;

    if (league.promote && rank <= league.promote && idx < LEAGUE_ORDER.length - 1) {
        nextLeagueId = LEAGUE_ORDER[idx + 1];
        change = "⬆️ صعود به " + LEAGUES[nextLeagueId].name;
    } else if (league.relegate && rank > standings.length - league.relegate && idx > 0) {
        nextLeagueId = LEAGUE_ORDER[idx - 1];
        change = "⬇️ سقوط به " + LEAGUES[nextLeagueId].name;
    }

    const reward = rank === 1 ? Number(league.rewards[1] || 0) : 0;
    const honors = Array.isArray(user.honors) ? [...user.honors] : [];
    const honorId = "honor_" + state.seasonId + "_" + state.leagueId;

    // ✅ جلوگیری از پاداش تکراری
    const alreadyRewarded = honors.some(h => h.id === honorId);

    if (rank === 1 && !alreadyRewarded) {
        honors.push({
            id: honorId,
            type: "league_champion",
            title: "قهرمان " + league.name,
            leagueId: state.leagueId,
            seasonId: state.seasonId,
            achievedAt: Date.now(),
            trophy: "🏆"
        });
        if (reward) await User.addCoins(reward);
    }

    await Users.updateCurrent({
        leagueId: nextLeagueId,
        honors: honors,
        leaguePaidWeek: null,
        leaguePaidAmount: 0
    });

    if (!state.finalised) {
        await LeagueAPI.finalise(user.username);
    }

    showSeasonResult(
        rank, standings.length, league, change, reward,
        rank === 1 && !alreadyRewarded
    );
}

/* =========================================================
   نمایش نتیجه‌ی فصل
   ========================================================= */

function showSeasonResult(rank, total, league, change, reward, champion) {
    categoriesDiv.innerHTML = "";
    const card = document.createElement("div");
    card.style.cssText =
        "max-width:500px;margin:auto;padding:28px;border-radius:28px;" +
        "text-align:center;color:white;background:" +
        (champion
            ? "linear-gradient(135deg,#92400e,#fbbf24,#f59e0b)"
            : "linear-gradient(135deg,#1e3a8a,#3b82f6)") +
        ";border:4px solid #fde68a;box-shadow:0 12px 40px #0005";

    card.innerHTML =
        '<div style="font-size:90px">' +
        (champion ? "🏆" : league.emoji) + '</div>' +
        '<div style="font-size:28px;font-weight:900">' +
        (champion ? "قهرمان لیگ شدی!" : "پایان لیگ") + '</div>' +
        '<div style="margin-top:14px;font-size:18px;font-weight:800">رتبه ' +
        fa(rank) + ' از ' + fa(total) + '</div>' +
        '<div style="margin-top:10px">' + change + '</div>' +
        (reward
            ? '<div style="margin-top:16px;padding:12px;background:#fff3;' +
              'border-radius:14px;font-weight:900">جایزه: 🪙 ' +
              fa(reward) + '</div>'
            : "") +
        (champion
            ? '<div style="margin-top:10px;font-weight:800">' +
              'جام در صفحه افتخارات ثبت شد</div>'
            : "");

    const btn = document.createElement("button");
    btn.className = "category next";
    btn.textContent = "بازگشت به خانه";
    btn.onclick = showHomeScreen;
    card.appendChild(btn);

    categoriesDiv.appendChild(card);
}

/* =========================================================
   افتخارات لیگ (برای پروفایل)
   ========================================================= */

function getLeagueHonors() {
    const user = Users.loadCurrent();
    return user && Array.isArray(user.honors)
        ? user.honors.filter(h => h.type === "league_champion")
        : [];
}// @ts-nocheck
/* =========================================================
   سیستم لیگ هفتگی آنلاین — نسخه نهایی v2.0
   ---------------------------------------------------------
   📜 قوانین لیگ:
   ─────────────────────────────────────────────────────────
   ۱. لیگ از ۴ دسته تشکیل شده:
      • 🥉 لیگ دسته ۳ (سطح ورودی)
      • 🥈 لیگ دسته ۲
      • 🥇 لیگ دسته ۱
      • 👑 لیگ برتر (بالاترین سطح)

   ۲. هر دسته گروه‌های ۱۰ نفره داره (لیگ برتر: ۱۶ نفره).

   ۳. صعود: ۳ نفر اول هر گروه از دسته ۳، ۲ و ۱ به دسته بالاتر.

   ۴. سقوط: ۳ نفر آخر دسته ۱ و ۲؛ ۴ نفر آخر لیگ برتر.

   ۵. دسته ۳ سقوط نداره (پایین‌ترین دسته).

   ۶. روزهای مسابقه: جمعه تا چهارشنبه (۶ روز).

   ۷. پنجشنبه: اعلام نتایج، اهدای جام، پاداش، و شروع لیگ جدید.

   ۸. امتیازدهی:
      • برد: ۳ امتیاز
      • مساوی: ۱ امتیاز
      • باخت یا عدم حضور: ۰ امتیاز

   ۹. در امتیاز مساوی، «تعداد پاسخ صحیح بیشتر» تعیین‌کننده‌ست.

   ۱۰. قالب مسابقه: همه با همه (Round-Robin) با برنامه‌ی زمانی.

   ۱۱. هر مسابقه ۹ سوال از ۳ موضوع مختلف (هر موضوع ۳ سوال).

   ۱۲. زمان هر سوال: ۱۵ ثانیه. زمان انتخاب موضوع: ۱۰ ثانیه.

   ۱۳. ❤️ در لیگ قلب مصرف نمی‌شه.

   ۱۴. ورودی هفتگی هر دسته:
      • دسته ۳: ۱۰۰ سکه
      • دسته ۲: ۲۰۰ سکه
      • دسته ۱: ۳۰۰ سکه
      • لیگ برتر: ۵۰۰ سکه

   ۱۵. 🏆 جایزه قهرمان هر دسته:
      • دسته ۳: ۵۰۰ سکه
      • دسته ۲: ۸۰۰ سکه
      • دسته ۱: ۱۲۰۰ سکه
      • لیگ برتر: ۲۵۰۰ سکه

   ۱۶. 🔒 شرط راه‌اندازی لیگ (فقط بار اول):
      حداقل ۸۰ نفر ثبت‌نام کنن تا ۸ گروه ۱۰ نفره تشکیل بشه.

   ۱۷. بعد از راه‌اندازی، هفته‌های بعد بدون این شرط اجرا می‌شن.

   ۱۸. 🔐 حریم خصوصی: اسم بازیکنان تا شروع مسابقات نمایش
      داده نمی‌شه. فقط تعداد ثبت‌نامی‌ها قابل مشاهده‌ست.

   ۱۹. 📅 هفته‌ی لیگ: جمعه ۰۰:۰۰ تا پنجشنبه ۰۰:۰۰.

   ۲۰. حداقل سطح ورود به لیگ: ۱۰
   ─────────────────────────────────────────────────────────
   ========================================================= */

const LEAGUE_API_MODE = "local"; // local | online
const LEAGUE_API_BASE = "/api/league";
const LEAGUE_MIN_LEVEL = 10;
const QUESTION_SECONDS = 15;
const TOPIC_SECONDS = 10;
const MATCH_WINDOW_MINUTES = 60;
const FRIDAY = 5;
const THURSDAY = 4;

/* ⚙️ تنظیمات لیگ */
const LEAGUE_SETTINGS = {
    MIN_PLAYERS_TO_START: 80,   // حداقل کل بازیکنان برای شروع (هفته‌ی اول)
    MIN_GROUPS_TO_START: 8,     // حداقل تعداد گروه (۸ گروه × ۱۰ نفر)
    REGISTRATION_DAYS: 7,
    AUTO_START: true
};

const LEAGUES = {
    division3: {
        id: "division3", name: "لیگ دسته ۳", emoji: "🥉", color: "#cd7f32",
        groupSize: 10, promote: 3, relegate: 0, entryFee: 100,
        rewards: { 1: 500 }
    },
    division2: {
        id: "division2", name: "لیگ دسته ۲", emoji: "🥈", color: "#94a3b8",
        groupSize: 10, promote: 3, relegate: 3, entryFee: 200,
        rewards: { 1: 800 }
    },
    division1: {
        id: "division1", name: "لیگ دسته ۱", emoji: "🥇", color: "#fbbf24",
        groupSize: 10, promote: 3, relegate: 3, entryFee: 300,
        rewards: { 1: 1200 }
    },
    premier: {
        id: "premier", name: "لیگ برتر", emoji: "👑", color: "#a855f7",
        groupSize: 16, promote: 0, relegate: 4, entryFee: 500,
        rewards: { 1: 2500 }
    }
};

const LEAGUE_ORDER = ["division3", "division2", "division1", "premier"];
const LEAGUE_BOOTSTRAP_KEY = "league_bootstrapped_v1";

let leagueTimer = null;
let validTopicsCache = null;
let leaguePollInterval = null;

/* =========================================================
   توابع کمکی عمومی
   ========================================================= */

function clearLeagueTimer() {
    if (leagueTimer) clearInterval(leagueTimer);
    leagueTimer = null;
}

function clearLeaguePoll() {
    if (leaguePollInterval) clearInterval(leaguePollInterval);
    leaguePollInterval = null;
}

function fa(value) {
    return typeof toPersianNumber === "function" ? toPersianNumber(value) : String(value);
}

function safeAvatar(avatar, size) {
    if (typeof getAvatarHTML === "function") return getAvatarHTML(avatar, size);
    return '<span style="font-size:' + size + 'px">' + (avatar || "👤") + '</span>';
}

function getFridayStart(reference) {
    const d = reference ? new Date(reference) : new Date();
    const diff = (d.getDay() - FRIDAY + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getNextFridayStart() {
    const now = new Date();
    const diff = (FRIDAY - now.getDay() + 7) % 7;
    const d = new Date(now);
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getCompetitionEnd(seasonStart) {
    const d = new Date(seasonStart);
    d.setDate(d.getDate() + 6);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getSeasonEnd(seasonStart) {
    return seasonStart + 7 * 86400000;
}

function getLeaguePhase(now) {
    const d = now ? new Date(now) : new Date();
    return d.getDay() === THURSDAY ? "results" : "competition";
}

function formatDateTime(ts) {
    const d = new Date(ts);
    const days = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
    return days[d.getDay()] + " " +
        fa(String(d.getHours()).padStart(2, "0")) + ":" +
        fa(String(d.getMinutes()).padStart(2, "0"));
}

function formatRemaining(ms) {
    if (ms <= 0) return "تمام شده";
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (days) return fa(days) + " روز و " + fa(hours) + " ساعت";
    if (hours) return fa(hours) + " ساعت و " + fa(minutes) + " دقیقه";
    return fa(minutes) + " دقیقه";
}

/* 🔐 چک راه‌اندازی لیگ */
function isLeagueBootstrapped() {
    return Storage.load(LEAGUE_BOOTSTRAP_KEY, false) === true;
}

function markLeagueBootstrapped() {
    Storage.save(LEAGUE_BOOTSTRAP_KEY, true);
}

/* =========================================================
   مرتب‌سازی جدول
   ========================================================= */

function emptyStanding(player) {
    return {
        id: player.id,
        username: player.username,
        avatar: player.avatar || "👤",
        points: 0,
        correctAnswers: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0
    };
}

function sortStandings(players) {
    return [...players].sort(function (a, b) {
        return (b.points - a.points) ||
               (b.correctAnswers - a.correctAnswers) ||
               (b.wins - a.wins) ||
               String(a.username).localeCompare(String(b.username), "fa");
    });
}

/* ✅ محاسبه‌ی جدول — نسخه‌ی صحیح (double_forfeit = ۰ امتیاز) */
function calculateStandings(group) {
    const map = {};
    group.players.forEach(p => map[p.id] = emptyStanding(p));

    group.matches.forEach(function (m) {
        if (m.status !== "completed" && m.status !== "forfeit") return;
        const h = map[m.homeId], a = map[m.awayId];
        if (!h || !a) return;

        h.played++; a.played++;
        h.correctAnswers += Number(m.homeScore || 0);
        a.correctAnswers += Number(m.awayScore || 0);

        // هر دو غایب: هر دو ۰ امتیاز
        if (m.result === "double_forfeit") {
            h.losses++; a.losses++;
            return;
        }

        if (m.homeScore > m.awayScore) {
            h.points += 3; h.wins++; a.losses++;
        } else if (m.awayScore > m.homeScore) {
            a.points += 3; a.wins++; h.losses++;
        } else {
            h.points++; a.points++;
            h.draws++; a.draws++;
        }
    });
    return sortStandings(Object.values(map));
}

/* =========================================================
   تولید برنامه Round-Robin
   ========================================================= */

function generateRoundRobin(players, seasonStart) {
    const list = players.map(p => ({ ...p }));
    if (list.length % 2) list.push({ id: "bye", username: "استراحت", isBye: true });

    const rounds = list.length - 1;
    const half = list.length / 2;
    const matches = [];
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

            matches.push({
                id: "m_" + round + "_" + i + "_" + home.id + "_" + away.id,
                round: round + 1,
                homeId: home.id,
                awayId: away.id,
                homeName: home.username,
                awayName: away.username,
                homeAvatar: home.avatar || "👤",
                awayAvatar: away.avatar || "👤",
                startTime: start.getTime(),
                endTime: start.getTime() + MATCH_WINDOW_MINUTES * 60000,
                status: "scheduled",
                homeScore: null,
                awayScore: null,
                homeSubmitted: false,
                awaySubmitted: false,
                result: null
            });
        }
        rotation = [rotation[0], rotation[rotation.length - 1]].concat(rotation.slice(1, -1));
    }
    return matches.sort((a, b) => a.startTime - b.startTime);
}

/* =========================================================
   حل مسابقات منقضی (forfeit)
   ========================================================= */

function resolveExpiredMatches(group, now) {
    let changed = false;
    group.matches.forEach(function (m) {
        if (m.status === "completed" || m.status === "forfeit") return;
        if (now < m.endTime) return;

        if (m.homeSubmitted && !m.awaySubmitted) {
            m.awayScore = 0;
            m.status = "forfeit";
            m.result = "home_forfeit_win";
        } else if (!m.homeSubmitted && m.awaySubmitted) {
            m.homeScore = 0;
            m.status = "forfeit";
            m.result = "away_forfeit_win";
        } else if (!m.homeSubmitted && !m.awaySubmitted) {
            m.homeScore = 0;
            m.awayScore = 0;
            m.status = "forfeit";
            m.result = "double_forfeit";
        } else {
            m.status = "completed";
            m.result = "played";
        }
        changed = true;
    });
    return changed;
}

/* =========================================================
   Local League API — بدون دیمو
   ========================================================= */

const LocalLeagueAPI = {
    async getState(username) {
        return Storage.load("leagueOnlineState_" + username, null);
    },
    async saveState(username, state) {
        Storage.save("leagueOnlineState_" + username, state);
        return state;
    },

    /* 🔐 کلید لیست ثبت‌نام هفته‌ی اول */
    _bootstrapQueueKey() {
        return "league_bootstrap_queue_" + getFridayStart();
    },
    _getBootstrapQueue() {
        return Storage.load(this._bootstrapQueueKey(), []);
    },
    _saveBootstrapQueue(queue) {
        Storage.save(this._bootstrapQueueKey(), queue);
    },

    /* ثبت‌نام هفته‌ی اول */
    async register(user, leagueId, paidAmount) {
        const queue = this._getBootstrapQueue();

        // چک تکراری
        if (queue.some(p => p.username.toLowerCase() === user.username.toLowerCase())) {
            return { status: "already_registered" };
        }

        // اضافه به صف
        queue.push({
            id: "user_" + user.username,
            username: user.username,
            avatar: user.avatar || "👤",
            leagueId: leagueId,
            registeredAt: Date.now(),
            paidAmount: paidAmount
        });
        this._saveBootstrapQueue(queue);

        // چک شروع خودکار
        if (queue.length >= LEAGUE_SETTINGS.MIN_PLAYERS_TO_START) {
            return await this._bootstrapLeague(queue);
        }

        return {
            status: "waiting",
            registered: queue.length,
            needed: LEAGUE_SETTINGS.MIN_PLAYERS_TO_START
        };
    },

    /* انصراف از ثبت‌نام */
    async cancelRegistration(username) {
        const queue = this._getBootstrapQueue();
        const filtered = queue.filter(
            p => p.username.toLowerCase() !== username.toLowerCase()
        );
        this._saveBootstrapQueue(filtered);
        return { ok: true };
    },

    /* چک وضعیت ثبت‌نام */
    async getRegistrationStatus(username, leagueId) {
        const queue = this._getBootstrapQueue();
        const registered = queue.filter(p => p.leagueId === leagueId).length;
        const inQueue = queue.some(
            p => p.username.toLowerCase() === username.toLowerCase()
        );
        return {
            inQueue,
            registered,
            needed: LEAGUE_SETTINGS.MIN_PLAYERS_TO_START
        };
    },

    /* 🎉 راه‌اندازی لیگ با ۸۰+ نفر */
    async _bootstrapLeague(queue) {
        const seasonStart = getFridayStart();

        // گروه‌بندی بر اساس leagueId
        const byLeague = {};
        queue.forEach(p => {
            if (!byLeague[p.leagueId]) byLeague[p.leagueId] = [];
            byLeague[p.leagueId].push(p);
        });

        const groups = [];
        const leftover = [];

        Object.keys(byLeague).forEach(leagueId => {
            const players = byLeague[leagueId].sort(() => Math.random() - 0.5);
            const groupSize = LEAGUES[leagueId].groupSize;
            const groupCount = Math.floor(players.length / groupSize);

            for (let i = 0; i < groupCount; i++) {
                const groupPlayers = players.slice(i * groupSize, (i + 1) * groupSize);
                groups.push({
                    id: "g_" + leagueId + "_" + seasonStart + "_" + (i + 1),
                    number: i + 1,
                    leagueId: leagueId,
                    players: groupPlayers.map(p => ({
                        id: p.id,
                        username: p.username,
                        avatar: p.avatar
                    })),
                    matches: generateRoundRobin(groupPlayers, seasonStart)
                });
            }

            // باقی‌مانده‌ها
            const remaining = players.slice(groupCount * groupSize);
            remaining.forEach(p => leftover.push(p));
        });

        // ذخیره‌ی گروه‌ها
        groups.forEach(group => {
            Storage.save("leagueGroup_" + group.id, group);
        });

        // state برای هر بازیکن
        groups.forEach(group => {
            group.players.forEach(p => {
                const state = {
                    seasonId: String(seasonStart),
                    seasonStart: seasonStart,
                    competitionEnd: getCompetitionEnd(seasonStart),
                    seasonEnd: getSeasonEnd(seasonStart),
                    leagueId: group.leagueId,
                    group: JSON.parse(JSON.stringify(group)),
                    finalised: false,
                    createdAt: Date.now()
                };
                this.saveState(p.username, state);
            });
        });

        // مارک راه‌اندازی
        markLeagueBootstrapped();

        // صف رو ریست کن
        this._saveBootstrapQueue(leftover);

        return {
            status: "bootstrapped",
            groupsCreated: groups.length,
            playersInLeague: groups.reduce((s, g) => s + g.players.length, 0)
        };
    },

    /* چک وضعیت صف (برای هفته‌های بعد از راه‌اندازی) */
    async getQueueStatus(username, leagueId) {
        const queue = this._getBootstrapQueue();
        const idx = queue.findIndex(
            p => p.username.toLowerCase() === username.toLowerCase()
        );
        const league = LEAGUES[leagueId];
        return {
            inQueue: idx !== -1,
            position: idx + 1,
            waiting: queue.length,
            needed: Math.max(0, league.groupSize - queue.length)
        };
    },

    /* ثبت نتیجه‌ی مسابقه */
    async submitScore(username, matchId, score) {
        const state = await this.getState(username);
        if (!state) throw new Error("اطلاعات لیگ پیدا نشد");

        const m = state.group.matches.find(x => x.id === matchId);
        if (!m) throw new Error("مسابقه پیدا نشد");

        const userId = "user_" + username;

        if (m.homeId === userId) {
            if (m.homeSubmitted) throw new Error("قبلاً نتیجه رو ثبت کردی");
            m.homeScore = score;
            m.homeSubmitted = true;
        } else if (m.awayId === userId) {
            if (m.awaySubmitted) throw new Error("قبلاً نتیجه رو ثبت کردی");
            m.awayScore = score;
            m.awaySubmitted = true;
        } else {
            throw new Error("این مسابقه متعلق به شما نیست");
        }

        if (m.homeSubmitted && m.awaySubmitted) {
            m.status = "completed";
            m.result = "played";
        }

        await this.saveState(username, state);
        await this._broadcastMatchResult(state.group.id, matchId, {
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeSubmitted: m.homeSubmitted,
            awaySubmitted: m.awaySubmitted,
            status: m.status,
            result: m.result
        });
        return state;
    },

    async _broadcastMatchResult(groupId, matchId, result) {
        const group = Storage.load("leagueGroup_" + groupId, null);
        if (!group) return;

        const m = group.matches.find(x => x.id === matchId);
        if (!m) return;

        Object.assign(m, result);
        Storage.save("leagueGroup_" + groupId, group);

        for (const p of group.players) {
            const st = await this.getState(p.username);
            if (st && st.group.id === groupId) {
                const mm = st.group.matches.find(x => x.id === matchId);
                if (mm) {
                    Object.assign(mm, result);
                    await this.saveState(p.username, st);
                }
            }
        }
    },

    async syncState(username) {
        const state = await this.getState(username);
        if (!state) return null;

        const group = Storage.load("leagueGroup_" + state.group.id, null);
        if (!group) return state;

        state.group.matches = group.matches;
        state.group.players = group.players;
        await this.saveState(username, state);
        return state;
    },

    async finalise(username) {
        const state = await this.getState(username);
        if (!state) return null;
        state.finalised = true;
        await this.saveState(username, state);
        return state;
    },

    /* هفته‌های بعد — ورود خودکار بدون شرط ۸۰ نفر */
    async weeklyJoin(user, leagueId, paidAmount) {
        // توی local، هر کاربر فقط خودش رو داره
        // پس یک گروه تک‌نفره می‌سازیم که با sync بعداً با بقیه merge می‌شه
        // برای تست، همون کاربر فعلی رو می‌ذاریم
        const seasonStart = getFridayStart();

        const players = [{
            id: "user_" + user.username,
            username: user.username,
            avatar: user.avatar || "👤"
        }];

        // 🔑 دنبال گروه موجود بگرد که جا داره
        // در local، همه‌ی گروه‌های ذخیره‌شده رو چک کن
        const allGroups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("leagueGroup_")) {
                try {
                    const g = JSON.parse(localStorage.getItem(key));
                    if (g && g.leagueId === leagueId && !g.finished) {
                        allGroups.push(g);
                    }
                } catch (_) {}
            }
        }

        // پیدا کردن گروه باز
        let targetGroup = allGroups.find(g =>
            g.players.length < LEAGUES[leagueId].groupSize &&
            !g.players.some(p => p.username === user.username)
        );

        if (targetGroup) {
            // چک نام تکراری
            const existingNames = targetGroup.players.map(p => p.username.toLowerCase());
            if (existingNames.includes(user.username.toLowerCase())) {
                throw new Error("نام کاربری تکراری در این گروه");
            }

            targetGroup.players.push({
                id: "user_" + user.username,
                username: user.username,
                avatar: user.avatar || "👤"
            });

            // اگه پر شد، مسابقات بساز
            if (targetGroup.players.length === LEAGUES[leagueId].groupSize) {
                targetGroup.matches = generateRoundRobin(targetGroup.players, seasonStart);
            }

            Storage.save("leagueGroup_" + targetGroup.id, targetGroup);
        } else {
            // گروه جدید
            targetGroup = {
                id: "g_" + leagueId + "_" + seasonStart + "_" + Date.now(),
                number: allGroups.length + 1,
                leagueId: leagueId,
                players: players,
                matches: [],
                finished: false
            };
            Storage.save("leagueGroup_" + targetGroup.id, targetGroup);
        }

        // state برای کاربر
        const state = {
            seasonId: String(seasonStart),
            seasonStart: seasonStart,
            competitionEnd: getCompetitionEnd(seasonStart),
            seasonEnd: getSeasonEnd(seasonStart),
            leagueId: leagueId,
            group: JSON.parse(JSON.stringify(targetGroup)),
            finalised: false,
            createdAt: Date.now()
        };
        await this.saveState(user.username, state);

        return {
            status: "joined",
            groupReady: targetGroup.players.length === LEAGUES[leagueId].groupSize,
            waiting: targetGroup.players.length,
            needed: LEAGUES[leagueId].groupSize
        };
    }
};

/* =========================================================
   Online League API
   ========================================================= */

const OnlineLeagueAPI = {
    _token: null,
    setToken(token) { this._token = token; },

    async request(path, options = {}) {
        const headers = { "Content-Type": "application/json" };
        if (this._token) headers["Authorization"] = "Bearer " + this._token;

        const response = await fetch(LEAGUE_API_BASE + path, {
            credentials: "include",
            headers,
            ...options
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "خطای سرور لیگ");
        }
        return response.json();
    },

    getState() { return this.request("/state"); },

    /* هفته‌ی اول — ثبت‌نام */
    register(user, leagueId, paidAmount) {
        return this.request("/register", {
            method: "POST",
            body: JSON.stringify({ leagueId, paidAmount })
        });
    },

    cancelRegistration(leagueId) {
        return this.request("/cancel", {
            method: "POST",
            body: JSON.stringify({ leagueId })
        });
    },

    getRegistrationStatus(leagueId) {
        return this.request("/registration-status?leagueId=" +
            encodeURIComponent(leagueId));
    },

    /* هفته‌های بعد — ورود خودکار */
    weeklyJoin(user, leagueId, paidAmount) {
        return this.request("/weekly-join", {
            method: "POST",
            body: JSON.stringify({ leagueId, paidAmount })
        });
    },

    getQueueStatus(leagueId) {
        return this.request("/queue/status?leagueId=" + encodeURIComponent(leagueId));
    },

    leaveQueue(leagueId) {
        return this.request("/queue/leave", {
            method: "POST",
            body: JSON.stringify({ leagueId })
        });
    },

    submitScore(username, matchId, score) {
        return this.request("/matches/" + encodeURIComponent(matchId) + "/score", {
            method: "POST",
            body: JSON.stringify({ score })
        });
    },

    finalise() {
        return this.request("/finalise", { method: "POST" });
    }
};

const LeagueAPI = LEAGUE_API_MODE === "online" ? OnlineLeagueAPI : LocalLeagueAPI;

/* =========================================================
   تایمر لیگ
   ========================================================= */

function createTimer(totalSeconds, onEnd) {
    clearLeagueTimer();
    const wrap = document.createElement("div");
    wrap.style.cssText =
        "width:70px;height:70px;border-radius:50%;display:grid;" +
        "place-items:center;background:#fff;border:7px solid #10b981;" +
        "font-weight:900;font-size:20px;color:#0f172a;";

    let remaining = totalSeconds;
    wrap.textContent = fa(remaining);

    leagueTimer = setInterval(function () {
        remaining--;
        wrap.textContent = fa(Math.max(0, remaining));
        wrap.style.borderColor = remaining <= 4 ? "#ef4444" :
                                 remaining <= 8 ? "#f59e0b" : "#10b981";
        if (remaining <= 0) { clearLeagueTimer(); onEnd(); }
    }, 1000);

    return {
        element: wrap,
        add(seconds) {
            remaining += seconds;
            wrap.textContent = fa(remaining);
        }
    };
}

/* =========================================================
   پیام لیگ
   ========================================================= */

function showLeagueMessage(title, text, buttonText, action) {
    categoriesDiv.innerHTML = "";
    const box = document.createElement("div");
    box.style.cssText =
        "max-width:500px;margin:auto;padding:28px;" +
        "background:linear-gradient(135deg,#1e40af,#06b6d4);" +
        "border:4px solid #fbbf24;border-radius:26px;color:white;" +
        "text-align:center;box-shadow:0 10px 30px #0004;";
    box.innerHTML =
        '<div style="font-size:28px;font-weight:900">' + title + '</div>' +
        '<div style="margin:16px 0;line-height:2;font-weight:700">' + text + '</div>';

    const btn = document.createElement("button");
    btn.className = "category next";
    btn.textContent = buttonText;
    btn.onclick = action;
    box.appendChild(btn);

    categoriesDiv.appendChild(box);
}

/* =========================================================
   نمایش قوانین لیگ — قابل استفاده در چند جا
   ========================================================= */

function buildLeagueRulesCard() {
    const card = document.createElement("div");
    card.style.cssText =
        "padding:18px;border-radius:18px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#f1f5f9,#e2e8f0);" +
        "border:3px solid #94a3b8;font-size:12px;font-weight:700;" +
        "color:#334155;line-height:2;";

    card.innerHTML =
        '<div style="font-size:15px;font-weight:900;color:#1e40af;' +
        'margin-bottom:10px;text-align:center;">📜 قوانین لیگ</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #3b82f6;">' +
        '<b style="color:#1e40af;">🎯 امتیازدهی:</b><br>' +
        '• برد: ۳ امتیاز<br>' +
        '• مساوی: ۱ امتیاز<br>' +
        '• باخت یا غیبت: ۰ امتیاز<br>' +
        '• در امتیاز مساوی: پاسخ صحیح بیشتر ملاک است' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #10b981;">' +
        '<b style="color:#047857;">📊 دسته‌ها:</b><br>' +
        '• 🥉 لیگ دسته ۳ (ورودی)<br>' +
        '• 🥈 لیگ دسته ۲<br>' +
        '• 🥇 لیگ دسته ۱<br>' +
        '• 👑 لیگ برتر' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #f59e0b;">' +
        '<b style="color:#b45309;">⬆️ صعود و ⬇️ سقوط:</b><br>' +
        '• صعود: ۳ نفر اول دسته ۳، ۲ و ۱<br>' +
        '• سقوط: ۳ نفر آخر دسته ۱ و ۲<br>' +
        '• سقوط لیگ برتر: ۴ نفر آخر<br>' +
        '• دسته ۳ سقوط نداره' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #a855f7;">' +
        '<b style="color:#7c3aed;">📅 زمان‌بندی:</b><br>' +
        '• مسابقات: جمعه تا چهارشنبه<br>' +
        '• پنجشنبه: نتایج و شروع لیگ جدید<br>' +
        '• قالب: همه با همه (Round-Robin)' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #ec4899;">' +
        '<b style="color:#be185d;">🎮 هر مسابقه:</b><br>' +
        '• ۹ سوال از ۳ موضوع (هر کدوم ۳ سوال)<br>' +
        '• زمان هر سوال: ۱۵ ثانیه<br>' +
        '• ❤️ در لیگ قلب مصرف نمی‌شه' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:12px;' +
        'border-right:4px solid #dc2626;">' +
        '<b style="color:#991b1b;">💰 ورودی هفتگی:</b><br>' +
        '• دسته ۳: ۱۰۰ سکه<br>' +
        '• دسته ۲: ۲۰۰ سکه<br>' +
        '• دسته ۱: ۳۰۰ سکه<br>' +
        '• لیگ برتر: ۵۰۰ سکه<br>' +
        '<b style="color:#991b1b;">🏆 جایزه قهرمان:</b><br>' +
        '• دسته ۳: ۵۰۰ سکه<br>' +
        '• دسته ۲: ۸۰۰ سکه<br>' +
        '• دسته ۱: ۱۲۰۰ سکه<br>' +
        '• لیگ برتر: ۲۵۰۰ سکه' +
        '</div>';

    return card;
}

/* =========================================================
   صفحه‌ی اصلی لیگ
   ========================================================= */

async function showLeagueScreen() {
    clearLeagueTimer();
    clearLeaguePoll();
    categoriesDiv.innerHTML = "";
    categoriesDiv.classList.remove("no-scroll");

    if (typeof User !== "undefined") {
        User.showBottomBar();
        User.updateTopBar();
    }
    if (typeof setActiveTab === "function") setActiveTab("league");

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    if ((user.level || 1) < LEAGUE_MIN_LEVEL) {
        showLeagueMessage(
            "🔒 لیگ هنوز باز نشده",
            "برای ورود به لیگ باید به سطح " + fa(LEAGUE_MIN_LEVEL) + " برسی.<br>" +
            "سطح فعلی: " + fa(user.level || 1),
            "بریم بازی کنیم",
            showHomeScreen
        );
        return;
    }

    let state;
    try {
        state = await LeagueAPI.getState(user.username);
    } catch (e) {
        showLeagueMessage("خطای اتصال", e.message, "🔄 تلاش دوباره", showLeagueScreen);
        return;
    }

    const leagueId = user.leagueId || "division3";
    const league = LEAGUES[leagueId];
    const bootstrapped = isLeagueBootstrapped();

    /* ─── حالت ۱: کاربر توی گروه ─── */
    if (state && state.group) {
        if (LEAGUE_API_MODE === "local" && LeagueAPI.syncState) {
            try { state = await LeagueAPI.syncState(user.username) || state; } catch (_) {}
        }
        if (LEAGUE_API_MODE === "local" && resolveExpiredMatches(state.group, Date.now())) {
            await LeagueAPI.saveState(user.username, state);
        }
        if (getLeaguePhase() === "results" || Date.now() >= state.competitionEnd) {
            await finaliseLeagueSeason(user, state);
            return;
        }
        renderLeagueDashboard(user, state);
        return;
    }

    /* ─── حالت ۲: پنجشنبه ─── */
    if (getLeaguePhase() === "results") {
        showLeagueMessage(
            "📊 روز اعلام نتایج",
            "امروز پنجشنبه است.<br>لیگ جدید از جمعه شروع می‌شه.",
            "بازگشت",
            showHomeScreen
        );
        return;
    }

    /* ─── حالت ۳: لیگ راه‌اندازی نشده (هفته‌ی اول) ─── */
    if (!bootstrapped) {
        const status = LEAGUE_API_MODE === "local"
            ? await LeagueAPI.getRegistrationStatus(user.username, leagueId)
            : await LeagueAPI.getRegistrationStatus(leagueId);

        if (status.inQueue) {
            showRegisteredWaiting(user, {
                registered: status.registered,
                needed: status.needed,
                startsAt: getNextFridayStart()
            });
            return;
        }

        if ((user.coins || 0) < league.entryFee) {
            showLeagueMessage(
                "💰 سکه کافی نداری",
                "برای ورود به " + league.name + " به " +
                fa(league.entryFee) + " سکه نیاز داری.<br>" +
                "موجودی: " + fa(user.coins || 0) + " سکه",
                "بازگشت",
                showHomeScreen
            );
            return;
        }

        showRegistrationForm(user, {
            registered: status.registered,
            needed: status.needed,
            startsAt: getNextFridayStart()
        });
        return;
    }

    /* ─── حالت ۴: راه‌اندازی شده — هفته‌های بعد ─── */
    if ((user.coins || 0) < league.entryFee) {
        showLeagueMessage(
            "💰 سکه کافی نداری",
            "ورودی هفتگی " + league.name + ": " +
            fa(league.entryFee) + " سکه<br>" +
            "موجودی: " + fa(user.coins || 0) + " سکه",
            "بازگشت",
            showHomeScreen
        );
        return;
    }

    showWeeklyEntry(user, league);
}

/* =========================================================
   صفحه‌ی ثبت‌نام (هفته‌ی اول)
   ========================================================= */

function showRegistrationForm(user, data) {
    const league = LEAGUES[user.leagueId || "division3"];
    const MIN_PLAYERS = LEAGUE_SETTINGS.MIN_PLAYERS_TO_START;
    const GROUP_SIZE = league.groupSize;

    const registered = data.registered || 0;
    const progress = Math.min(100, Math.round((registered / MIN_PLAYERS) * 100));
    const remaining = Math.max(0, MIN_PLAYERS - registered);
    const currentGroups = Math.floor(registered / GROUP_SIZE);
    const neededGroups = LEAGUE_SETTINGS.MIN_GROUPS_TO_START;
    const canAfford = (user.coins || 0) >= league.entryFee;

    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);" +
        "color:white;box-shadow:0 10px 30px rgba(139,92,246,0.4);" +
        "margin-bottom:20px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">🏆</div>' +
        '<div style="font-size:24px;font-weight:900;margin-bottom:8px;">' +
        'لیگ هفتگی</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">' +
        'با بازیکنان واقعی رقابت کن</div>';
    box.appendChild(header);

    // پیام «به‌زودی»
    const comingSoon = document.createElement("div");
    comingSoon.style.cssText =
        "padding:16px;border-radius:16px;text-align:center;" +
        "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
        "border:3px solid #fbbf24;margin-bottom:16px;" +
        "color:#78350f;font-weight:900;font-size:14px;line-height:1.8;";
    comingSoon.innerHTML =
        '🔒 <b>لیگ به‌زودی فعال می‌شه!</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'منتظریم ' + fa(MIN_PLAYERS) + ' نفر ثبت‌نام کنن</span>';
    box.appendChild(comingSoon);

    // نوار پیشرفت
    const progressBox = document.createElement("div");
    progressBox.style.cssText =
        "padding:20px;border-radius:20px;background:white;" +
        "border:3px solid #6366f1;margin-bottom:16px;" +
        "box-shadow:0 5px 0 #4338ca;";
    progressBox.innerHTML =
        '<div style="display:flex;justify-content:space-between;' +
        'align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:15px;font-weight:900;color:#1e293b;">' +
        '👥 ' + fa(registered) + ' از ' + fa(MIN_PLAYERS) + ' نفر' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#6366f1;">' +
        fa(progress) + '٪</div></div>' +
        '<div style="height:16px;background:#e2e8f0;border-radius:12px;' +
        'overflow:hidden;border:2px solid #cbd5e1;">' +
        '<div style="height:100%;width:' + progress + '%;' +
        'background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);' +
        'border-radius:12px;transition:width 0.6s ease;"></div></div>' +
        (remaining > 0
            ? '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:800;color:#64748b;">' +
              '⏳ ' + fa(remaining) + ' نفر دیگه مونده</div>'
            : '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:900;color:#10b981;">' +
              '✅ تعداد کافیه! به‌زودی شروع می‌شه</div>');
    box.appendChild(progressBox);

    // اطلاعات گروه
    const groupInfo = document.createElement("div");
    groupInfo.style.cssText =
        "padding:14px;border-radius:14px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:3px solid #3b82f6;text-align:center;" +
        "font-size:13px;font-weight:800;color:#1e40af;line-height:1.9;";
    groupInfo.innerHTML =
        '🎯 <b>هدف: ' + fa(neededGroups) + ' گروه ' +
        fa(GROUP_SIZE) + ' نفره</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'الان ' + fa(currentGroups) + ' گروه تشکیل شده ' +
        '(نیاز به ' + fa(Math.max(0, neededGroups - currentGroups)) +
        ' گروه دیگه)</span>';
    box.appendChild(groupInfo);

    // اطلاعات لیگ
    const info = document.createElement("div");
    info.style.cssText =
        "padding:16px;border-radius:16px;background:#f8fafc;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;" +
        "font-size:13px;font-weight:700;color:#334155;line-height:2;";
    info.innerHTML =
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>💰 ورودی:</span>' +
        '<b>' + fa(league.entryFee) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🏆 جایزه نفر اول:</span>' +
        '<b>' + fa(league.rewards[1]) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>👥 گروه:</span>' +
        '<b>' + fa(GROUP_SIZE) + ' نفره</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🪙 موجودی شما:</span>' +
        '<b style="color:' + (canAfford ? '#10b981' : '#dc2626') + ';">' +
        fa(user.coins || 0) + ' سکه</b></div>';
    box.appendChild(info);

    // حریم خصوصی
    const privacy = document.createElement("div");
    privacy.style.cssText =
        "padding:12px;border-radius:12px;background:#f1f5f9;" +
        "border:2px dashed #94a3b8;margin-bottom:16px;" +
        "text-align:center;font-size:12px;font-weight:800;color:#475569;line-height:1.8;";
    privacy.innerHTML =
        '🔒 <b>حریم خصوصی</b><br>' +
        '<span style="font-size:11px;font-weight:700;">' +
        'اسم بازیکنان دیگه نمایش داده نمی‌شه</span>';
    box.appendChild(privacy);

    // دکمه ثبت‌نام
    const registerBtn = document.createElement("button");
    registerBtn.style.cssText =
        "width:100%;padding:18px;border-radius:18px;" +
        "background:linear-gradient(180deg," +
        (canAfford ? "#22c55e,#16a34a" : "#94a3b8,#64748b") + ");" +
        "color:white;border:3px solid " + (canAfford ? "#4ade80" : "#cbd5e1") + ";" +
        "font-size:16px;font-weight:900;font-family:inherit;" +
        "cursor:" + (canAfford ? "pointer" : "not-allowed") + ";" +
        "box-shadow:0 6px 0 " + (canAfford ? "#14532d" : "#334155") + ";" +
        "text-shadow:0 2px 4px rgba(0,0,0,0.3);";
    registerBtn.textContent = canAfford
        ? "✋ ثبت‌نام می‌کنم"
        : "💰 سکه کافی نداری";
    registerBtn.disabled = !canAfford;
    registerBtn.onclick = () => registerForLeague(user, league);
    box.appendChild(registerBtn);

    // دکمه بازگشت
    const backBtn = document.createElement("button");
    backBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;margin-top:10px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    backBtn.textContent = "🔙 بازگشت";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);

    // قوانین
    box.appendChild(buildLeagueRulesCard());

    categoriesDiv.appendChild(box);
}

/* =========================================================
   صفحه‌ی انتظار (هفته‌ی اول، بعد از ثبت‌نام)
   ========================================================= */

function showRegisteredWaiting(user, data) {
    const league = LEAGUES[user.leagueId || "division3"];
    const MIN_PLAYERS = LEAGUE_SETTINGS.MIN_PLAYERS_TO_START;
    const GROUP_SIZE = league.groupSize;

    const registered = data.registered || 0;
    const progress = Math.min(100, Math.round((registered / MIN_PLAYERS) * 100));
    const remaining = Math.max(0, MIN_PLAYERS - registered);
    const currentGroups = Math.floor(registered / GROUP_SIZE);
    const neededGroups = LEAGUE_SETTINGS.MIN_GROUPS_TO_START;

    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    // کارت موفقیت
    const successCard = document.createElement("div");
    successCard.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg,#10b981,#059669);" +
        "color:white;box-shadow:0 10px 30px rgba(16,185,129,0.4);" +
        "margin-bottom:20px;";
    successCard.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">✅</div>' +
        '<div style="font-size:22px;font-weight:900;margin-bottom:8px;">' +
        'ثبت‌نام شدی!</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">' +
        'وقتی لیگ شروع شه، بهت خبر می‌دیم</div>';
    box.appendChild(successCard);

    // کارت خود کاربر
    const selfCard = document.createElement("div");
    selfCard.style.cssText =
        "display:flex;align-items:center;gap:12px;padding:14px;" +
        "border-radius:16px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#d1fae5,#a7f3d0);" +
        "border:3px solid #10b981;box-shadow:0 4px 0 #047857;";
    selfCard.innerHTML =
        '<div style="font-size:28px;">' + safeAvatar(user.avatar, 26) + '</div>' +
        '<div style="flex:1;">' +
        '<div style="font-size:14px;font-weight:900;color:#047857;">' +
        user.username + ' (شما)</div>' +
        '<div style="font-size:11px;font-weight:700;color:#059669;margin-top:2px;">' +
        '✅ توی لیست ثبت‌نامی</div></div>';
    box.appendChild(selfCard);

    // نوار پیشرفت
    const progressBox = document.createElement("div");
    progressBox.style.cssText =
        "padding:20px;border-radius:20px;background:white;" +
        "border:3px solid #10b981;margin-bottom:16px;" +
        "box-shadow:0 5px 0 #047857;";
    progressBox.innerHTML =
        '<div style="display:flex;justify-content:space-between;' +
        'align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:15px;font-weight:900;color:#1e293b;">' +
        '👥 ' + fa(registered) + ' از ' + fa(MIN_PLAYERS) + ' نفر' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#10b981;">' +
        fa(progress) + '٪</div></div>' +
        '<div style="height:16px;background:#e2e8f0;border-radius:12px;' +
        'overflow:hidden;border:2px solid #cbd5e1;">' +
        '<div style="height:100%;width:' + progress + '%;' +
        'background:linear-gradient(90deg,#10b981,#22c55e,#4ade80);' +
        'border-radius:12px;transition:width 0.6s ease;"></div></div>' +
        (remaining > 0
            ? '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:800;color:#64748b;">' +
              '⏳ ' + fa(remaining) + ' نفر دیگه مونده</div>'
            : '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:900;color:#10b981;">' +
              '🎉 تعداد کافیه! به‌زودی شروع می‌شه</div>');
    box.appendChild(progressBox);

    // اطلاعات گروه
    const groupInfo = document.createElement("div");
    groupInfo.style.cssText =
        "padding:14px;border-radius:14px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:3px solid #3b82f6;text-align:center;" +
        "font-size:13px;font-weight:800;color:#1e40af;line-height:1.9;";
    groupInfo.innerHTML =
        '🎯 <b>هدف: ' + fa(neededGroups) + ' گروه ' +
        fa(GROUP_SIZE) + ' نفره</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'الان ' + fa(currentGroups) + ' گروه تشکیل شده ' +
        '(نیاز به ' + fa(Math.max(0, neededGroups - currentGroups)) +
        ' گروه دیگه)</span>';
    box.appendChild(groupInfo);

    // اطلاعات شروع
    const startInfo = document.createElement("div");
    startInfo.style.cssText =
        "padding:16px;border-radius:16px;" +
        "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
        "border:3px solid #fbbf24;margin-bottom:16px;" +
        "text-align:center;font-size:13px;font-weight:800;color:#78350f;line-height:2;";
    startInfo.innerHTML =
        '📅 شروع: <b>' + formatDateTime(data.startsAt) + '</b><br>' +
        '⏰ ' + formatRemaining(data.startsAt - Date.now()) + ' مونده';
    box.appendChild(startInfo);

    // حریم خصوصی
    const privacy = document.createElement("div");
    privacy.style.cssText =
        "padding:14px;border-radius:14px;background:#f1f5f9;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;text-align:center;" +
        "font-size:12px;font-weight:700;color:#64748b;line-height:1.9;";
    privacy.innerHTML =
        '🔒 <b>حریم خصوصی</b><br>' +
        'اسم بازیکنان دیگه نمایش داده نمی‌شه<br>' +
        '<span style="color:#3b82f6;">وقتی لیگ شروع شه، حریفانت رو می‌بینی</span>';
    box.appendChild(privacy);

    // دکمه‌ها
    const refreshBtn = document.createElement("button");
    refreshBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;" +
        "background:linear-gradient(180deg,#3b82f6,#1d4ed8);" +
        "color:white;border:3px solid #60a5fa;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #1e3a8a;";
    refreshBtn.textContent = "🔄 بروزرسانی";
    refreshBtn.onclick = showLeagueScreen;
    box.appendChild(refreshBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;margin-top:10px;" +
        "background:linear-gradient(180deg,#ef4444,#b91c1c);" +
        "color:white;border:3px solid #f87171;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #7f1d1d;";
    cancelBtn.textContent = "❌ انصراف و بازگشت سکه";
    cancelBtn.onclick = function () {
        showConfirmModal({
            emoji: "❌",
            title: "انصراف از لیگ",
            message: "مطمئنی؟ " + fa(league.entryFee) + " سکه برمی‌گرده",
            color: "#ef4444", shadow: "#7f1d1d",
            confirmText: "بله انصراف",
            cancelText: "بمون",
            onConfirm: () => cancelLeagueRegistration(user)
        });
    };
    box.appendChild(cancelBtn);

    // قوانین
    box.appendChild(buildLeagueRulesCard());

    categoriesDiv.appendChild(box);

    // پولینگ خودکار
    leaguePollInterval = setInterval(async function () {
        try {
            const status = LEAGUE_API_MODE === "local"
                ? await LeagueAPI.getRegistrationStatus(user.username, league.id)
                : await LeagueAPI.getRegistrationStatus(league.id);

            if (status.registered !== data.registered) {
                clearLeaguePoll();
                showLeagueScreen();
            }
        } catch (_) {}
    }, 10000);
}

/* =========================================================
   ورود هفتگی (هفته‌های بعد)
   ========================================================= */

function showWeeklyEntry(user, league) {
    categoriesDiv.innerHTML = "";
    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg," + league.color + ",#1e40af);" +
        "color:white;box-shadow:0 10px 30px rgba(0,0,0,0.3);" +
        "margin-bottom:20px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">' + league.emoji + '</div>' +
        '<div style="font-size:24px;font-weight:900;margin-bottom:8px;">' +
        league.name + '</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">' +
        'ورودی هفتگی این لیگ</div>';
    box.appendChild(header);

    // اطلاعات
    const info = document.createElement("div");
    info.style.cssText =
        "padding:16px;border-radius:16px;background:#f8fafc;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;" +
        "font-size:13px;font-weight:700;color:#334155;line-height:2;";
    info.innerHTML =
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>💰 ورودی این هفته:</span>' +
        '<b>' + fa(league.entryFee) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🏆 جایزه نفر اول:</span>' +
        '<b>' + fa(league.rewards[1]) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🪙 موجودی شما:</span>' +
        '<b style="color:#10b981;">' + fa(user.coins || 0) + ' سکه</b></div>';
    box.appendChild(info);

    // توضیح
    const explain = document.createElement("div");
    explain.style.cssText =
        "padding:14px;border-radius:14px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:3px solid #3b82f6;text-align:center;" +
        "font-size:13px;font-weight:800;color:#1e40af;line-height:1.9;";
    explain.innerHTML =
        '🎯 <b>وقتی پرداخت کنی:</b><br>' +
        '<span style="font-size:12px;font-weight:700;">' +
        'خودکار توی گروهت قرار می‌گیری<br>' +
        'با ۹ بازیکن دیگه مسابقه می‌دی<br>' +
        'آخر هفته: صعود یا سقوط</span>';
    box.appendChild(explain);

    // دکمه پرداخت
    const payBtn = document.createElement("button");
    payBtn.style.cssText =
        "width:100%;padding:18px;border-radius:18px;" +
        "background:linear-gradient(180deg,#22c55e,#16a34a);" +
        "color:white;border:3px solid #4ade80;" +
        "font-size:16px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 6px 0 #14532d;" +
        "text-shadow:0 2px 4px rgba(0,0,0,0.3);";
    payBtn.textContent = "💳 پرداخت و ورود به لیگ";
    payBtn.onclick = () => joinWeeklyLeague(user, league);
    box.appendChild(payBtn);

    // دکمه بازگشت
    const backBtn = document.createElement("button");
    backBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;margin-top:10px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    backBtn.textContent = "🔙 بازگشت";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);

    // قوانین
    box.appendChild(buildLeagueRulesCard());

    categoriesDiv.appendChild(box);
}

/* =========================================================
   ثبت‌نام در لیگ (هفته‌ی اول)
   ========================================================= */

async function registerForLeague(user, league) {
    try {
        // ۱. کسر سکه
        await User.addCoins(-league.entryFee);

        // ۲. ثبت‌نام
        let result;
        if (LEAGUE_API_MODE === "local") {
            result = await LeagueAPI.register(user, league.id, league.entryFee);
        } else {
            result = await LeagueAPI.register(user, league.id, league.entryFee);
        }

        if (result.status === "bootstrapped") {
            // 🎉 لیگ راه‌اندازی شد!
            await Users.updateCurrent({
                leaguePaidWeek: getFridayStart(),
                leaguePaidAmount: league.entryFee
            });

            showInfoModal({
                emoji: "🎉",
                title: "لیگ شروع شد!",
                message:
                    "گروه‌ها تشکیل شدن!<br>" +
                    fa(result.groupsCreated) + " گروه ساخته شد.<br>" +
                    "الان برو مسابقاتت رو ببین",
                color: "#22c55e", shadow: "#14532d",
                buttonText: "🚀 بریم!",
                onClose: showLeagueScreen
            });
        } else {
            // هنوز منتظر
            await Users.updateCurrent({
                leaguePaidWeek: getFridayStart(),
                leaguePaidAmount: league.entryFee
            });

            showInfoModal({
                emoji: "✅",
                title: "ثبت‌نام موفق!",
                message:
                    "وقتی " + fa(LEAGUE_SETTINGS.MIN_PLAYERS_TO_START) +
                    " نفر ثبت‌نام کنن، لیگ شروع می‌شه",
                color: "#10b981", shadow: "#047857",
                onClose: showLeagueScreen
            });
        }
    } catch (e) {
        // برگشت سکه
        await User.addCoins(league.entryFee);
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: e.message || "ثبت‌نام ناموفق",
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* =========================================================
   انصراف از ثبت‌نام
   ========================================================= */

async function cancelLeagueRegistration(user) {
    try {
        const league = LEAGUES[user.leagueId || "division3"];

        if (LEAGUE_API_MODE === "local") {
            await LeagueAPI.cancelRegistration(user.username);
        } else {
            await LeagueAPI.cancelRegistration(league.id);
        }

        // برگشت سکه
        await User.addCoins(league.entryFee);
        await Users.updateCurrent({
            leaguePaidWeek: null,
            leaguePaidAmount: 0
        });

        showInfoModal({
            emoji: "✅",
            title: "انصراف موفق",
            message: fa(league.entryFee) + " سکه برگشت",
            color: "#10b981", shadow: "#047857",
            onClose: showHomeScreen
        });
    } catch (e) {
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: e.message,
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* =========================================================
   ورود هفتگی (پرداخت و join)
   ========================================================= */

async function joinWeeklyLeague(user, league) {
    try {
        // ۱. کسر سکه
        await User.addCoins(-league.entryFee);

        // ۲. join
        let result;
        if (LEAGUE_API_MODE === "local") {
            result = await LeagueAPI.weeklyJoin(user, league.id, league.entryFee);
        } else {
            result = await LeagueAPI.weeklyJoin(user, league.id, league.entryFee);
        }

        await Users.updateCurrent({
            leaguePaidWeek: getFridayStart(),
            leaguePaidAmount: league.entryFee
        });

        showInfoModal({
            emoji: "🎉",
            title: "ورود موفق!",
            message: result.groupReady
                ? "گروهت آماده‌ست! برو رقابت کن"
                : "توی گروهت قرار گرفتی. منتظر شروع مسابقات باش",
            color: "#10b981", shadow: "#047857",
            onClose: showLeagueScreen
        });
    } catch (e) {
        // برگشت سکه
        await User.addCoins(league.entryFee);
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: e.message || "پرداخت ناموفق",
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* =========================================================
   داشبورد لیگ
   ========================================================= */

function renderLeagueDashboard(user, state) {
    const league = LEAGUES[state.leagueId];
    const standings = calculateStandings(state.group);
    const userId = "user_" + user.username;
    const now = Date.now();

    categoriesDiv.innerHTML = "";

    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:22px;border-radius:22px;color:white;text-align:center;" +
        "background:linear-gradient(135deg," + league.color + ",#1e40af);" +
        "margin-bottom:14px;";
    header.innerHTML =
        '<div style="font-size:25px;font-weight:900">' +
        league.emoji + ' ' + league.name + '</div>' +
        '<div style="margin-top:8px;font-weight:700">گروه ' +
        fa(state.group.number) + ' — ' + fa(state.group.players.length) + ' نفر</div>' +
        '<div style="margin-top:7px">پایان مسابقات: ' +
        formatRemaining(state.competitionEnd - now) + '</div>';
    categoriesDiv.appendChild(header);

    // قوانین خلاصه
    const rules = document.createElement("div");
    rules.style.cssText =
        "padding:12px;border-radius:14px;background:#e2e8f0;" +
        "color:#334155;text-align:center;font-weight:800;" +
        "margin-bottom:14px;line-height:1.8;font-size:12px;";
    rules.innerHTML =
        "برد ۳، مساوی ۱، باخت یا غیبت ۰ امتیاز<br>" +
        "در امتیاز برابر: پاسخ صحیح بیشتر";
    categoriesDiv.appendChild(rules);

    // جدول
    const title = document.createElement("h3");
    title.textContent = "📊 جدول گروه";
    categoriesDiv.appendChild(title);

    const table = document.createElement("div");
    table.className = "league-table";
    standings.forEach(function (p, index) {
        const rank = index + 1;
        const row = document.createElement("div");
        row.className = "league-row" + (p.id === userId ? " is-user" : "");
        let movement = "";
        if (league.promote && rank <= league.promote) movement = "⬆️";
        if (league.relegate && rank > standings.length - league.relegate) movement = "⬇️";

        row.innerHTML =
            '<div class="league-rank">' +
            (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : fa(rank)) +
            '</div>' +
            '<div class="league-avatar">' + safeAvatar(p.avatar, 30) + '</div>' +
            '<div class="league-name-text">' + p.username +
            (p.id === userId ? " (شما)" : "") + '</div>' +
            '<div style="font-size:11px;color:#64748b">صحیح: ' +
            fa(p.correctAnswers) + '</div>' +
            '<div class="league-points">' + fa(p.points) + '</div>' +
            '<div>' + movement + '</div>';
        table.appendChild(row);
    });
    categoriesDiv.appendChild(table);

    // مسابقات
    const matchTitle = document.createElement("h3");
    matchTitle.textContent = "🎮 برنامه مسابقات شما";
    matchTitle.style.marginTop = "20px";
    categoriesDiv.appendChild(matchTitle);

    const userMatches = state.group.matches.filter(
        m => m.homeId === userId || m.awayId === userId
    );

    if (userMatches.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText =
            "text-align:center;padding:20px;color:#64748b;font-weight:700";
        empty.textContent = "هنوز مسابقه‌ای برای شما برنامه‌ریزی نشده";
        categoriesDiv.appendChild(empty);
    }

    userMatches.forEach(function (m) {
        const isHome = m.homeId === userId;
        const opponentName = isHome ? m.awayName : m.homeName;
        const opponentAvatar = isHome ? m.awayAvatar : m.homeAvatar;
        const mySubmitted = isHome ? m.homeSubmitted : m.awaySubmitted;
        const oppSubmitted = isHome ? m.awaySubmitted : m.homeSubmitted;
        const myScore = isHome ? m.homeScore : m.awayScore;
        const active = now >= m.startTime && now < m.endTime && !mySubmitted;

        const card = document.createElement("div");
        card.style.cssText =
            "padding:14px;border:2px solid #cbd5e1;border-radius:16px;" +
            "margin-bottom:10px;background:#fff";

        let status;
        if (m.status === "completed" || m.status === "forfeit") {
            status = "✅ تمام شده";
        } else if (active) {
            status = "🟢 فعال";
        } else if (now < m.startTime) {
            status = "⏳ در انتظار";
        } else if (mySubmitted && !oppSubmitted) {
            status = "⏳ منتظر حریف";
        } else {
            status = "❌ از دست رفته";
        }

        card.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px">' +
            '<div style="font-size:32px">' + opponentAvatar + '</div>' +
            '<div style="flex:1"><b>' + opponentName + '</b>' +
            '<div style="font-size:12px;margin-top:4px">' +
            formatDateTime(m.startTime) + '</div></div>' +
            '<b>' + status + '</b></div>';

        if (active) {
            const btn = document.createElement("button");
            btn.className = "match-btn match-btn-play";
            btn.textContent = "🎮 شروع مسابقه";
            btn.onclick = () => startLeagueMatch(state, m);
            card.appendChild(btn);
        } else if (m.status === "completed" || m.status === "forfeit") {
            const score = document.createElement("div");
            score.style.cssText =
                "text-align:center;margin-top:8px;font-weight:900;font-size:18px";
            score.textContent = fa(m.homeScore) + " - " + fa(m.awayScore);
            card.appendChild(score);
        } else if (mySubmitted && !oppSubmitted) {
            const info = document.createElement("div");
            info.style.cssText =
                "text-align:center;margin-top:8px;font-size:12px;" +
                "color:#64748b;font-weight:700";
            info.textContent = "نتیجه تو: " + fa(myScore) + " — منتظر حریف";
            card.appendChild(info);
        }

        categoriesDiv.appendChild(card);
    });
}

/* =========================================================
   بارگذاری موضوعات و سوالات
   ========================================================= */

async function getValidLeagueTopics() {
    if (validTopicsCache) return validTopicsCache;

    const results = await Promise.all(CATEGORIES.map(async function (cat) {
        try {
            const response = await fetch("questions/" + cat.file);
            const data = await response.json();
            return { cat, questions: Array.isArray(data) ? data : [] };
        } catch (_) {
            return { cat, questions: [] };
        }
    }));
    validTopicsCache = results.filter(x => x.questions.length >= 3);
    return validTopicsCache;
}

function difficultyWeights(leagueId) {
    return {
        division3: { easy: .60, medium: .35, hard: .05 },
        division2: { easy: .30, medium: .50, hard: .20 },
        division1: { easy: .10, medium: .40, hard: .50 },
        premier: { easy: 0, medium: .20, hard: .80 }
    }[leagueId];
}

function pickQuestions(pool, count, weights) {
    const buckets = { easy: [], medium: [], hard: [] };
    pool.forEach(q => (buckets[q.difficulty] || buckets.medium).push(q));
    Object.values(buckets).forEach(a => a.sort(() => Math.random() - .5));

    const out = [];
    while (out.length < count) {
        const r = Math.random();
        const target = r < weights.easy ? "easy" :
                       r < weights.easy + weights.medium ? "medium" : "hard";
        const order = target === "easy" ? ["easy", "medium", "hard"] :
                      target === "hard" ? ["hard", "medium", "easy"] :
                      ["medium", "easy", "hard"];
        const key = order.find(k => buckets[k].length);
        if (!key) break;
        out.push(buckets[key].shift());
    }
    return out;
}

/* =========================================================
   شروع مسابقه
   ========================================================= */

async function startLeagueMatch(state, match) {
    categoriesDiv.innerHTML =
        '<div style="text-align:center;padding:60px;font-weight:900">' +
        'در حال بارگذاری سوالات...</div>';

    const topics = await getValidLeagueTopics();
    if (topics.length < 3) {
        alert("حداقل سه موضوع دارای سوال لازم است");
        showLeagueScreen();
        return;
    }
    topics.sort(() => Math.random() - .5);
    const selected = topics.slice(0, 3);
    const weights = difficultyWeights(state.leagueId);

    const questions = [];
    selected.forEach(t => pickQuestions(t.questions, 3, weights)
        .forEach(q => questions.push({ ...q, topicName: t.cat.title })));

    runLeagueQuiz(state, match, questions.slice(0, 9));
}

/* =========================================================
   اجرای کوییز لیگ
   ========================================================= */

function runLeagueQuiz(state, match, questions) {
    let index = 0, score = 0;

    function next() {
        clearLeagueTimer();
        categoriesDiv.innerHTML = "";

        if (index >= questions.length) {
            submitLeagueResult(state, match, score);
            return;
        }

        const q = questions[index];
        let answered = false;
        const buttons = []; // ✅ قبل از createTimer

        const top = document.createElement("div");
        top.style.cssText = "display:flex;align-items:center;gap:12px;margin-bottom:16px";

        const timer = createTimer(QUESTION_SECONDS, function () {
            if (answered) return;
            answered = true;
            buttons.forEach(b => b.disabled = true);
            if (buttons[q.correct]) buttons[q.correct].classList.add("correct");
            setTimeout(() => { index++; next(); }, 1000);
        });
        top.appendChild(timer.element);

        const info = document.createElement("div");
        info.innerHTML =
            '<b>' + q.topicName + '</b>' +
            '<div style="margin-top:5px;color:#64748b">سوال ' +
            fa(index + 1) + ' از ' + fa(questions.length) + '</div>';
        top.appendChild(info);
        categoriesDiv.appendChild(top);

        const box = document.createElement("div");
        box.className = "question-box";
        box.textContent = String(q.question).replace(/^[۰-۹0-9]+\s*[.\-:]\s*/, "");
        categoriesDiv.appendChild(box);

        q.answers.forEach(function (answer, answerIndex) {
            const btn = document.createElement("button");
            btn.className = "category";
            btn.textContent = answer;
            btn.onclick = function () {
                if (answered) return;
                answered = true;
                clearLeagueTimer();
                buttons.forEach(b => b.disabled = true);
                if (answerIndex === q.correct) {
                    score++;
                    btn.classList.add("correct");
                } else {
                    btn.classList.add("wrong");
                    if (buttons[q.correct]) buttons[q.correct].classList.add("correct");
                }
                setTimeout(() => { index++; next(); }, 850);
            };
            buttons.push(btn);
            categoriesDiv.appendChild(btn);
        });
    }
    next();
}

/* =========================================================
   ارسال نتیجه
   ========================================================= */

async function submitLeagueResult(state, match, score) {
    categoriesDiv.innerHTML =
        '<div style="text-align:center;padding:60px;font-weight:900">' +
        'در حال ثبت نتیجه...</div>';

    // ✅ username از قبل
    const user = Users.loadCurrent();
    if (!user) {
        showLeagueMessage("خطا", "کاربر یافت نشد", "بازگشت", showHomeScreen);
        return;
    }

    try {
        await LeagueAPI.submitScore(user.username, match.id, score);
        showLeagueMessage(
            "✅ نتیجه ثبت شد",
            "تعداد پاسخ صحیح شما: " + fa(score),
            "بازگشت به لیگ",
            showLeagueScreen
        );
    } catch (e) {
        showLeagueMessage(
            "ثبت نتیجه ناموفق بود",
            e.message || "خطای نامشخص",
            "🔄 تلاش دوباره",
            () => submitLeagueResult(state, match, score)
        );
    }
}

/* =========================================================
   پایان فصل و اعلام نتایج
   ========================================================= */

async function finaliseLeagueSeason(user, state) {
    const standings = calculateStandings(state.group);
    const userId = "user_" + user.username;
    const rank = standings.findIndex(p => p.id === userId) + 1;
    const league = LEAGUES[state.leagueId];

    let nextLeagueId = state.leagueId;
    const idx = LEAGUE_ORDER.indexOf(state.leagueId);
    let change = "ماندن در " + league.name;

    if (league.promote && rank <= league.promote && idx < LEAGUE_ORDER.length - 1) {
        nextLeagueId = LEAGUE_ORDER[idx + 1];
        change = "⬆️ صعود به " + LEAGUES[nextLeagueId].name;
    } else if (league.relegate && rank > standings.length - league.relegate && idx > 0) {
        nextLeagueId = LEAGUE_ORDER[idx - 1];
        change = "⬇️ سقوط به " + LEAGUES[nextLeagueId].name;
    }

    const reward = rank === 1 ? Number(league.rewards[1] || 0) : 0;
    const honors = Array.isArray(user.honors) ? [...user.honors] : [];
    const honorId = "honor_" + state.seasonId + "_" + state.leagueId;

    // ✅ جلوگیری از پاداش تکراری
    const alreadyRewarded = honors.some(h => h.id === honorId);

    if (rank === 1 && !alreadyRewarded) {
        honors.push({
            id: honorId,
            type: "league_champion",
            title: "قهرمان " + league.name,
            leagueId: state.leagueId,
            seasonId: state.seasonId,
            achievedAt: Date.now(),
            trophy: "🏆"
        });
        if (reward) await User.addCoins(reward);
    }

    await Users.updateCurrent({
        leagueId: nextLeagueId,
        honors: honors,
        leaguePaidWeek: null,
        leaguePaidAmount: 0
    });

    if (!state.finalised) {
        await LeagueAPI.finalise(user.username);
    }

    showSeasonResult(
        rank, standings.length, league, change, reward,
        rank === 1 && !alreadyRewarded
    );
}

/* =========================================================
   نمایش نتیجه‌ی فصل
   ========================================================= */

function showSeasonResult(rank, total, league, change, reward, champion) {
    categoriesDiv.innerHTML = "";
    const card = document.createElement("div");
    card.style.cssText =
        "max-width:500px;margin:auto;padding:28px;border-radius:28px;" +
        "text-align:center;color:white;background:" +
        (champion
            ? "linear-gradient(135deg,#92400e,#fbbf24,#f59e0b)"
            : "linear-gradient(135deg,#1e3a8a,#3b82f6)") +
        ";border:4px solid #fde68a;box-shadow:0 12px 40px #0005";

    card.innerHTML =
        '<div style="font-size:90px">' +
        (champion ? "🏆" : league.emoji) + '</div>' +
        '<div style="font-size:28px;font-weight:900">' +
        (champion ? "قهرمان لیگ شدی!" : "پایان لیگ") + '</div>' +
        '<div style="margin-top:14px;font-size:18px;font-weight:800">رتبه ' +
        fa(rank) + ' از ' + fa(total) + '</div>' +
        '<div style="margin-top:10px">' + change + '</div>' +
        (reward
            ? '<div style="margin-top:16px;padding:12px;background:#fff3;' +
              'border-radius:14px;font-weight:900">جایزه: 🪙 ' +
              fa(reward) + '</div>'
            : "") +
        (champion
            ? '<div style="margin-top:10px;font-weight:800">' +
              'جام در صفحه افتخارات ثبت شد</div>'
            : "");

    const btn = document.createElement("button");
    btn.className = "category next";
    btn.textContent = "بازگشت به خانه";
    btn.onclick = showHomeScreen;
    card.appendChild(btn);

    categoriesDiv.appendChild(card);
}

/* =========================================================
   افتخارات لیگ (برای پروفایل)
   ========================================================= */

function getLeagueHonors() {
    const user = Users.loadCurrent();
    return user && Array.isArray(user.honors)
        ? user.honors.filter(h => h.type === "league_champion")
        : [];
              }
