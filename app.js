// @ts-nocheck
/* ============================================
   اپ دانشمند — v6.0.0 (Supabase + لیگ آنلاین)
   ============================================ */

const CATEGORIES = [
    { id: "general",     title: "🧠 اطلاعات عمومی",      file: "general.json"      },
    { id: "football",    title: "⚽ فوتبال",              file: "football.json"     },
    { id: "sports-hall", title: "🏀 بسکتبال و والیبال",   file: "sports-hall.json"  },
    { id: "geography",   title: "🌍 جغرافیا",            file: "geograghy.json"    },
    { id: "history",     title: "📜 تاریخ",               file: "history.json"      },
    { id: "computer",    title: "💻 کامپیوتر و فناوری",   file: "computer.json"     },
    { id: "games",       title: "🎮 بازی‌های ویدئویی",   file: "games.json"        },
    { id: "cinema-tv",   title: "🎬 سینما و تلویزیون",    file: "cinema-tv.json"    },
    { id: "music",       title: "🎵 موسیقی",              file: "music.json"        },
    { id: "literature",  title: "📚 ادبیات",              file: "literature.json"   },
    { id: "islamic",     title: "🕌 معارف اسلامی",        file: "islamic.json"      },
    { id: "puzzle",      title: "🧩 معما و هوش",          file: "puzzle.json"       }
];

const AVATARS = [
    "👨", "👨🏻", "👨🏼", "👨🏽", "🧔", "🧔🏻",
    "👨‍🦰", "👨‍🦱", "👱‍♂️", "👨‍🦳", "🧑‍💼", "🧑‍🎓",
    "👩", "👩🏻", "👩🏼", "👩🏽", "👩‍🦰", "👩‍🦱",
    "👱‍♀️", "👩‍🦳", "👩‍💼", "👩‍🎓", "🧕", "👸"
];

const VIP_AVATARS = [
    { id: "vip1", url: "images/avatars/avatar1.png", price: 500, category: "🌟 ویژه" },
    { id: "vip2", url: "images/avatars/avatar2.png", price: 800, category: "🌟 ویژه" }
];

const XP_PER_CORRECT = 10;
const XP_PER_LEVEL = 100;
const COINS_PER_CORRECT = 3;
const TOTAL_QUESTIONS = 10;

const MAX_HEARTS = 10;
const HEART_MAX = 10;
const HEART_REGEN_MINUTES = 30;
const HEART_BUY_COST = 200;
const DAILY_HEARTS_REWARD = 5;
const USERNAME_CHANGE_COST = 500;

const COINS_PERFECT_BONUS = 80;
const COINS_MASTER_BONUS = 150;

const QUESTION_TIME = 15;
const ONLINE_UNLOCK_LEVEL = 5;

const SIGNING_KEY = "SCIENTIST_APP_2026_SECRET_v4";

/* 🔌 Supabase API */
const SUPABASE_URL = "https://scientist-api.seydi6600.workers.dev";
const SUPABASE_KEY = "sb_publishable_upUFTYz_9jtjqVxL9DOkKA_tM2_WWN3";

/* 🏆 League API */
const LEAGUE_API_MODE = "online";
const LEAGUE_API_BASE = "https://scientist-api.seydi6600.workers.dev/league";
const LEAGUE_AUTH_SECRET = "SCIENTIST_LEAGUE_SECRET_v1";

/* 🏆 League Config */
const LEAGUE_MIN_LEVEL = 10;
const LEAGUE_QUESTION_SECONDS = 15;
const LEAGUE_FRIDAY = 5;
const LEAGUE_THURSDAY = 4;

const LEAGUE_SETTINGS = {
    MIN_PLAYERS_TO_START: 80,
    MIN_GROUPS_TO_START: 8,
    DEV_MIN_PLAYERS: 2
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

async function supabaseFetch(path, options = {}) {
    const response = await fetch(SUPABASE_URL + "/functions/v1/" + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + SUPABASE_KEY
        },
        ...options
    });
    return response.json();
}

const DIFFICULTY_MIX = {
    easy:    { easy: 0.7,  medium: 0.3,  hard: 0.0  },
    medium:  { easy: 0.2,  medium: 0.5,  hard: 0.3  },
    hard:    { easy: 0.0,  medium: 0.3,  hard: 0.7  },
    random:  { easy: 0.33, medium: 0.34, hard: 0.33 }
};

const BANNED_ROOTS = [
    "کوس", "کیر", "کس", "کش", "جنده", "حروم", "خارکسه",
    "مادرجنده", "پدرسگ", "بیشرف", "دیوث", "قرمساق",
    "لخت", "سکسی", "پورن", "شهوانی", "فحش",
    "fuck", "fuk", "fck", "shit", "bitch", "ass",
    "dick", "pussy", "cock", "sex", "porn", "xxx",
    "nude", "naked", "rape", "kill", "hate", "die",
    "anal", "boob", "tits", "penis", "vagina",
    "18plus", "adult", "adult18", "sexy", "hotgirl", "hotboy"
];

const RESERVED_USERNAMES = ["admin", "system", "bot", "demo", "moderator", "support"];

const categoriesDiv = document.getElementById("categories");
let isExitingApp = false;

/* ============================================
   🔐 امنیت
   ============================================ */

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function hasCryptoSupport() {
    return !!(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
}

async function hashPassword(password) {
    if (!hasCryptoSupport()) throw new Error("Web Crypto API در دسترس نیست");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(password),
        "PBKDF2", false, ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, 256
    );
    return { salt: Array.from(salt), hash: Array.from(new Uint8Array(hash)) };
}

async function verifyPassword(password, stored) {
    if (!hasCryptoSupport()) return false;
    if (!stored || !stored.salt || !stored.hash) return false;
    const salt = new Uint8Array(stored.salt);
    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(password),
        "PBKDF2", false, ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, 256
    );
    const computed = Array.from(new Uint8Array(hash));
    if (computed.length !== stored.hash.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) diff |= computed[i] ^ stored.hash[i];
    return diff === 0;
}

async function signData(data) {
    if (!hasCryptoSupport()) return "";
    const key = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(SIGNING_KEY),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC", key, new TextEncoder().encode(JSON.stringify(data))
    );
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateId() {
    if (hasCryptoSupport()) {
        const arr = crypto.getRandomValues(new Uint8Array(16));
        return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}

/* ============================================
   🎲 تصادفی‌سازی
   ============================================ */

function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function shuffleQuestion(q) {
    if (!q || !Array.isArray(q.answers) || q.answers.length === 0) return q;
    let correctIdx = q.correct;
    if (typeof correctIdx !== "number" || correctIdx < 0 || correctIdx >= q.answers.length) {
        correctIdx = 0;
    }
    const indices = q.answers.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    const newAnswers = shuffledIndices.map(i => q.answers[i]);
    const newCorrect = shuffledIndices.indexOf(correctIdx);
    return {
        question: q.question,
        answers: newAnswers,
        correct: newCorrect === -1 ? 0 : newCorrect,
        difficulty: q.difficulty
    };
}

/* ============================================
   🛡️ اعتبارسنجی نام کاربری
   ============================================ */

function aggressiveNormalize(str) {
    if (!str) return "";
    let s = String(str).toLowerCase();
    s = s.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
         .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    s = s.replace(/ي/g, "ی").replace(/ك/g, "ک")
         .replace(/ة/g, "ه").replace(/ۀ/g, "ه");
    s = s.replace(/[\u064B-\u065F\u0670]/g, "");
    s = s.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, "");
    const leet = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g", "@": "a", "$": "s", "!": "i", "|": "i" };
    s = s.replace(/[01345789@$!|]/g, ch => leet[ch] || ch);
    s = s.replace(/[\s\.\_\-\*\#\+\/\u200c\u200d]/g, "");
    s = s.replace(/(.)\1+/g, "$1");
    return s;
}

const NORMALIZED_BANNED_ROOTS = BANNED_ROOTS.map(function(root) {
    return { raw: root.toLowerCase(), normalized: aggressiveNormalize(root) };
}).filter(function(r) { return r.normalized && r.normalized.length >= 2; });

function levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function isWhitelisted(name) {
    if (!name) return { ok: false, error: "نام کاربری خالیه" };
    if (typeof name !== "string") return { ok: false, error: "نامعتبر" };
    const trimmed = name.trim();
    if (trimmed.length < 3) return { ok: false, error: "حداقل ۳ کاراکتر" };
    if (trimmed.length > 15) return { ok: false, error: "حداکثر ۱۵ کاراکتر" };
    if (!/^[a-zA-Z0-9_\u0600-\u06FF\u200c]+$/.test(trimmed)) {
        return { ok: false, error: "فقط حروف، عدد و _" };
    }
    if (/\s/.test(trimmed)) return { ok: false, error: "فاصله مجاز نیست" };
    const letters = trimmed.match(/[a-zA-Z\u0600-\u06FF]/g) || [];
    if (letters.length < 2) return { ok: false, error: "حداقل ۲ حرف لازمه" };
    const digits = trimmed.match(/[0-9]/g) || [];
    if (digits.length > trimmed.length * 0.5) {
        return { ok: false, error: "عدد زیاد مجاز نیست" };
    }
    if (/^[0-9_]+$/.test(trimmed)) return { ok: false, error: "فقط عدد مجاز نیست" };
    return { ok: true };
}

function hasSuspiciousPattern(name) {
    const n = name.toLowerCase();
    if (/^(.)\1{2,}$/.test(n)) return true;
    if (/^(.{2,4})\1{2,}$/.test(n)) return true;
    if (/(.)\1{3,}/.test(n)) return true;
    if (/18\s*\+?|adult|sex|xxx|porn/i.test(n)) return true;
    if (/^[0-9_]+$/.test(n)) return true;
    if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(n)) return true;
    return false;
}

function containsBannedRoot(name) {
    const normalized = aggressiveNormalize(name);
    if (normalized.length < 2) return false;
    const raw = name.toLowerCase().replace(/[\s\.\_\-\u200c]/g, "");
    for (let i = 0; i < NORMALIZED_BANNED_ROOTS.length; i++) {
        const root = NORMALIZED_BANNED_ROOTS[i];
        if (normalized.includes(root.normalized)) return true;
        if (raw.includes(root.raw)) return true;
        const maxDist = root.normalized.length <= 3 ? 1 : 2;
        const words = [normalized].concat(normalized.split(/[\s_]+/));
        for (let w = 0; w < words.length; w++) {
            const word = words[w];
            if (word.length < 2) continue;
            if (levenshtein(word, root.normalized) <= maxDist) return true;
        }
    }
    return false;
}

function isReservedUsername(username) {
    if (!username) return true;
    const lower = String(username).toLowerCase().trim();
    if (lower.startsWith("🤖")) return true;
    if (RESERVED_USERNAMES.indexOf(lower) !== -1) return true;
    return false;
}

const UsernameAttempts = {
    KEY: "username_attempts_v1",
    MAX_PER_HOUR: 10,
    _load() { return Storage.load(this.KEY, { count: 0, resetAt: Date.now() + 3600000 }); },
    _save(data) { Storage.save(this.KEY, data); },
    canAttempt() {
        const d = this._load();
        if (Date.now() > d.resetAt) {
            this._save({ count: 0, resetAt: Date.now() + 3600000 });
            return { ok: true };
        }
        if (d.count >= this.MAX_PER_HOUR) {
            const minutesLeft = Math.ceil((d.resetAt - Date.now()) / 60000);
            return { ok: false, error: "تلاش زیاد. " + toPersianNumber(minutesLeft) + " دقیقه صبر کن" };
        }
        return { ok: true };
    },
    record() {
        const d = this._load();
        d.count = (d.count || 0) + 1;
        this._save(d);
    }
};

function checkUsernameLive(username) {
    if (typeof username !== "string") return { ok: false, error: "نامعتبر" };
    const wl = isWhitelisted(username);
    if (!wl.ok) return wl;
    if (hasSuspiciousPattern(username)) return { ok: false, error: "این نام کاربری مجاز نیست" };
    if (containsBannedRoot(username)) return { ok: false, error: "این نام کاربری مجاز نیست" };
    if (isReservedUsername(username)) return { ok: false, error: "این نام کاربری رزرو شده" };
    return { ok: true };
}

function isValidUsername(username) {
    const rl = UsernameAttempts.canAttempt();
    if (!rl.ok) return rl;
    const check = checkUsernameLive(username);
    if (!check.ok) return check;
    UsernameAttempts.record();
    return { ok: true };
}

/* ============================================
   اعتبارسنجی شماره
   ============================================ */

function normalizePhone(phone) {
    if (!phone) return "";
    let p = String(phone).trim();
    p = p.replace(/[\s\-\(\)]/g, "");
    p = p.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
         .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    if (p.startsWith("+98")) p = "0" + p.slice(3);
    if (p.startsWith("0098")) p = "0" + p.slice(4);
    if (p.startsWith("98") && p.length === 12) p = "0" + p.slice(2);
    return p;
}

function isValidIranianPhone(phone) {
    return /^09\d{9}$/.test(normalizePhone(phone));
}

/* ============================================
   💾 Storage
   ============================================ */

const Storage = {
    save(key, value) {
        try {
            if (!key || typeof key !== "string") return false;
            if (value === undefined) return false;
            const serialized = JSON.stringify(value);
            if (serialized.length > 4 * 1024 * 1024) return false;
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error("❌ Storage.save خطا:", key, e.message);
            return false;
        }
    },
    load(key, defaultValue = null) {
        try {
            if (!key || typeof key !== "string") return defaultValue;
            const raw = localStorage.getItem(key);
            if (!raw) return defaultValue;
            const parsed = JSON.parse(raw);
            return parsed !== null && parsed !== undefined ? parsed : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    remove(key) {
        try {
            if (!key) return;
            localStorage.removeItem(key);
        } catch (e) {}
    }
};

/* ============================================
   کاربران — v6.0 (با محافظت کامل از داده)
   ============================================ */

const Users = {
    _cache: null,

    loadAll() {
        if (this._cache) return this._cache;
        const data = Storage.load("users_v2", {});
        this._cache = (data && typeof data === "object") ? data : {};
        return this._cache;
    },
    saveAll(users) {
        if (!users || typeof users !== "object") return false;
        this._cache = users;
        return Storage.save("users_v2", users);
    },
    invalidateCache() { this._cache = null; },

    _backup(user) {
        if (!user || !user.phone) return;
        try {
            Storage.save("user_backup_" + user.phone, { user: user, timestamp: Date.now() });
            Storage.save("stats_backup_" + user.phone, {
                xp: user.xp || 0,
                level: user.level || 1,
                coins: user.coins || 0,
                timestamp: Date.now()
            });
            if (Array.isArray(user.vipAvatars) && user.vipAvatars.length > 0) {
                const vipBackupKey = "vip_owned_" + user.phone;
                const existing = Storage.load(vipBackupKey, []);
                const merged = Array.from(new Set(existing.concat(user.vipAvatars).filter(Boolean)));
                Storage.save(vipBackupKey, merged);
            }
        } catch (e) {}
    },

    findByUsername(username) {
        const users = this.loadAll();
        if (!username) return null;
        const lower = String(username).trim().toLowerCase();
        for (const phone in users) {
            if (users[phone] && users[phone].username &&
                users[phone].username.toLowerCase() === lower) {
                return users[phone];
            }
        }
        return null;
    },

    _mergeWithLocal(serverUser) {
        if (!serverUser || !serverUser.phone) return serverUser;

        const phone = serverUser.phone;
        const local = Storage.load("user_" + phone, null);
        const backupWrap = Storage.load("user_backup_" + phone, null);
        const backupUser = backupWrap && backupWrap.user ? backupWrap.user : null;
        const statsBackup = Storage.load("stats_backup_" + phone, null);
        const vipBackup = Storage.load("vip_owned_" + phone, []);

        const sources = [];
        if (local && typeof local === "object") sources.push(local);
        if (backupUser && typeof backupUser === "object") sources.push(backupUser);

        const pickMaxNum = function (key, base) {
            let best = (typeof base === "number" && isFinite(base)) ? base : 0;
            for (let i = 0; i < sources.length; i++) {
                const v = sources[i][key];
                if (typeof v === "number" && isFinite(v) && v > best) best = v;
            }
            if (statsBackup && (key === "xp" || key === "level" || key === "coins")) {
                const v = statsBackup[key];
                if (typeof v === "number" && isFinite(v) && v > best) best = v;
            }
            return best;
        };

        const pickBestAvatar = function (base) {
            const candidates = [];
            if (base && typeof base === "string" && base.trim()) candidates.push(base.trim());
            for (let i = 0; i < sources.length; i++) {
                const a = sources[i].avatar;
                if (a && typeof a === "string" && a.trim()) candidates.push(a.trim());
            }
            for (let i = 0; i < candidates.length; i++) {
                const a = candidates[i];
                if (AVATARS.indexOf(a) !== -1) return a;
                if (a.indexOf("vip") === 0 || a.indexOf("images/") !== -1) return a;
            }
            return candidates[0] || base || null;
        };

        const pickBestUsername = function (base) {
            if (base && String(base).trim()) return String(base).trim();
            for (let i = 0; i < sources.length; i++) {
                if (sources[i].username && String(sources[i].username).trim()) {
                    return String(sources[i].username).trim();
                }
            }
            return base || null;
        };

        const merged = Object.assign({}, local || {}, serverUser);

        merged.xp = pickMaxNum("xp", serverUser.xp);
        merged.level = Math.max(
            pickMaxNum("level", serverUser.level || 1),
            Math.floor((merged.xp || 0) / XP_PER_LEVEL) + 1
        );
        if (merged.level < 1) merged.level = 1;
        merged.coins = pickMaxNum("coins", serverUser.coins);
        merged.gamesPlayed = pickMaxNum("gamesPlayed", serverUser.gamesPlayed);
        merged.correctAnswers = pickMaxNum("correctAnswers", serverUser.correctAnswers);
        merged.wrongAnswers = pickMaxNum("wrongAnswers", serverUser.wrongAnswers);
        merged.bestScore = pickMaxNum("bestScore", serverUser.bestScore);
        merged.leagueWins = pickMaxNum("leagueWins", serverUser.leagueWins);
        merged.onlineWins = pickMaxNum("onlineWins", serverUser.onlineWins);

        const bestAvatar = pickBestAvatar(serverUser.avatar);
        if (bestAvatar) merged.avatar = bestAvatar;

        const bestUsername = pickBestUsername(serverUser.username);
        if (bestUsername) merged.username = bestUsername;

        let vip = Array.isArray(serverUser.vipAvatars) ? serverUser.vipAvatars.slice() : [];
        for (let i = 0; i < sources.length; i++) {
            if (Array.isArray(sources[i].vipAvatars)) {
                vip = vip.concat(sources[i].vipAvatars);
            }
        }
        if (Array.isArray(vipBackup)) vip = vip.concat(vipBackup);
        merged.vipAvatars = Array.from(new Set(vip.filter(Boolean)));

        let cat = Object.assign({}, serverUser.categoryStats || {});
        for (let i = 0; i < sources.length; i++) {
            if (sources[i].categoryStats && typeof sources[i].categoryStats === "object") {
                const cs = sources[i].categoryStats;
                for (const k in cs) {
                    if (!cs.hasOwnProperty(k)) continue;
                    if (!cat[k]) cat[k] = { correct: 0, total: 0 };
                    cat[k].correct = Math.max(cat[k].correct || 0, cs[k].correct || 0);
                    cat[k].total = Math.max(cat[k].total || 0, cs[k].total || 0);
                }
            }
        }
        merged.categoryStats = cat;

        let bestSubUntil = serverUser.subscriptionUntil || 0;
        let bestSubType = serverUser.subscriptionType || null;
        for (let i = 0; i < sources.length; i++) {
            if ((sources[i].subscriptionUntil || 0) > bestSubUntil) {
                bestSubUntil = sources[i].subscriptionUntil;
                bestSubType = sources[i].subscriptionType || bestSubType;
            }
        }
        if (bestSubUntil) {
            merged.subscriptionUntil = bestSubUntil;
            merged.subscriptionType = bestSubType;
        }

        let bestTx = Array.isArray(serverUser.transactions) ? serverUser.transactions : [];
        for (let i = 0; i < sources.length; i++) {
            if (Array.isArray(sources[i].transactions) && sources[i].transactions.length > bestTx.length) {
                bestTx = sources[i].transactions;
            }
        }
        merged.transactions = bestTx;

        if (Array.isArray(serverUser.honors)) merged.honors = serverUser.honors;
        else if (!Array.isArray(merged.honors)) merged.honors = [];

        return merged;
    },

    async register(phone, username, password) {
        if (!hasCryptoSupport()) {
            return { ok: false, error: "مرورگر شما از امنیت لازم پشتیبانی نمی‌کند" };
        }
        if (!password || password.length < 6)
            return { ok: false, error: "رمز حداقل ۶ کاراکتر" };
        if (password.length > 50)
            return { ok: false, error: "رمز حداکثر ۵۰ کاراکتر" };

        const unCheck = isValidUsername(username);
        if (!unCheck.ok) return unCheck;

        const normalizedPhone = normalizePhone(phone);
        if (!isValidIranianPhone(normalizedPhone))
            return { ok: false, error: "شماره موبایل معتبر نیست (۰۹...)" };

        try {
            const data = await supabaseFetch("auth-register", {
                body: JSON.stringify({
                    phone: normalizedPhone,
                    username: username.trim(),
                    password: password
                })
            });

            if (!data.ok) {
                return { ok: false, error: data.error || "خطا در ثبت‌نام" };
            }

            const user = this._mergeWithLocal(data.user);
            Storage.save("currentUser_v2", user.phone);
            Storage.save("user_" + user.phone, user);
            this._backup(user);

            try {
                this._syncToAPI(user.phone, {
                    xp: user.xp || 0,
                    level: user.level || 1,
                    coins: user.coins || 0,
                    avatar: user.avatar || null,
                    username: user.username || null,
                    gamesPlayed: user.gamesPlayed || 0,
                    correctAnswers: user.correctAnswers || 0,
                    wrongAnswers: user.wrongAnswers || 0,
                    bestScore: user.bestScore || 0,
                    categoryStats: user.categoryStats || {},
                    vipAvatars: user.vipAvatars || [],
                    subscriptionUntil: user.subscriptionUntil || 0,
                    subscriptionType: user.subscriptionType || null
                });
            } catch (e) {}

            return { ok: true, user: user };
        } catch (err) {
            console.error("Register error:", err);
            return { ok: false, error: "خطای اتصال. دوباره امتحان کن" };
        }
    },

    async login(phoneOrUsername, password) {
        if (!hasCryptoSupport()) {
            return { ok: false, error: "مرورگر شما از امنیت لازم پشتیبانی نمی‌کند" };
        }
        if (!phoneOrUsername || !password)
            return { ok: false, error: "نام کاربری/شماره و رمز را وارد کن" };

        const input = String(phoneOrUsername).trim();
        const normalizedPhone = normalizePhone(input);

        let phone = normalizedPhone;
        if (!isValidIranianPhone(normalizedPhone)) {
            const localUsers = this.loadAll();
            let foundPhone = null;
            for (const p in localUsers) {
                if (localUsers[p].username &&
                    localUsers[p].username.toLowerCase() === input.toLowerCase()) {
                    foundPhone = p;
                    break;
                }
            }
            if (foundPhone) {
                phone = foundPhone;
            } else {
                return { ok: false, error: "شماره موبایل معتبر وارد کن" };
            }
        }

        try {
            const data = await supabaseFetch("auth-login", {
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            if (!data.ok) {
                return { ok: false, error: data.error || "ورود ناموفق" };
            }

            const user = this._mergeWithLocal(data.user);
            Storage.save("currentUser_v2", user.phone);
            Storage.save("user_" + user.phone, user);
            this._backup(user);

            try {
                this._syncToAPI(user.phone, {
                    xp: user.xp || 0,
                    level: user.level || 1,
                    coins: user.coins || 0,
                    avatar: user.avatar || null,
                    username: user.username || null,
                    gamesPlayed: user.gamesPlayed || 0,
                    correctAnswers: user.correctAnswers || 0,
                    wrongAnswers: user.wrongAnswers || 0,
                    bestScore: user.bestScore || 0,
                    categoryStats: user.categoryStats || {},
                    vipAvatars: user.vipAvatars || [],
                    subscriptionUntil: user.subscriptionUntil || 0,
                    subscriptionType: user.subscriptionType || null
                });
            } catch (e) {}

            return { ok: true, user: user };
        } catch (err) {
            console.error("Login error:", err);
            return { ok: false, error: "خطای اتصال. دوباره امتحان کن" };
        }
    },

    saveCurrent(user) {
        if (!user || !user.phone) return false;
        this._backup(user);
        const r1 = Storage.save("currentUser_v2", user.phone);
        const r2 = Storage.save("user_" + user.phone, user);
        this._cache = null;
        return r1 && r2;
    },

    loadCurrent() {
        const phone = Storage.load("currentUser_v2", null);
        if (!phone) return null;

        let user = Storage.load("user_" + phone, null);

        if (!user) {
            const backupWrap = Storage.load("user_backup_" + phone, null);
            if (backupWrap && backupWrap.user) {
                user = backupWrap.user;
                Storage.save("user_" + phone, user);
            } else {
                return null;
            }
        }

        const vipBackup = Storage.load("vip_owned_" + phone, []);
        const existingVip = Array.isArray(user.vipAvatars) ? user.vipAvatars : [];
        user.vipAvatars = Array.from(new Set(existingVip.concat(vipBackup).filter(Boolean)));

        if (!user.avatar) {
            const bw = Storage.load("user_backup_" + phone, null);
            if (bw && bw.user && bw.user.avatar) user.avatar = bw.user.avatar;
        }

        if (!Array.isArray(user.transactions)) user.transactions = [];
        if (!Array.isArray(user.honors)) user.honors = [];
        if (!user.categoryStats || typeof user.categoryStats !== "object") {
            user.categoryStats = {};
        }

        const level = (typeof user.level === "number" && isFinite(user.level) && user.level >= 1)
            ? user.level : 1;
        const xp = (typeof user.xp === "number" && isFinite(user.xp) && user.xp >= 0)
            ? user.xp : 0;

        const minXPForLevel = (level - 1) * XP_PER_LEVEL;
        const maxXPForLevel = level * XP_PER_LEVEL;

        let correctedLevel = level;
        let correctedXP = xp;
        let needsFix = false;

        if (xp < minXPForLevel) {
            correctedLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
            if (correctedLevel < 1) correctedLevel = 1;
            correctedXP = Math.max(xp, (correctedLevel - 1) * XP_PER_LEVEL);
            needsFix = true;
        } else if (xp >= maxXPForLevel) {
            correctedLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
            needsFix = true;
        }

        if (needsFix) {
            user.level = correctedLevel;
            user.xp = correctedXP;
            Storage.save("user_" + phone, user);
        }

        return user;
    },

    updateCurrent(partial) {
        if (!partial || typeof partial !== "object") return null;
        const user = this.loadCurrent();
        if (!user) return null;

        const allowedKeys = [
            "avatar", "xp", "level", "coins",
            "gamesPlayed", "correctAnswers", "wrongAnswers", "bestScore",
            "leagueWins", "onlineWins", "categoryStats",
            "items", "vipAvatars",
            "subscriptionUntil", "subscriptionType",
            "lastDailyHeartClaim",
            "adsWatchedToday", "adsResetTime",
            "transactions", "honors",
            "leagueId", "leaguePaidWeek", "leaguePaidAmount"
        ];

        const safeUpdates = {};
        for (const key of Object.keys(partial)) {
            if (allowedKeys.indexOf(key) === -1) continue;
            const val = partial[key];
            if (val === undefined || val === null) continue;

            if (key === "xp") {
                if (typeof val !== "number" || !isFinite(val) || val < 0) continue;
                if (partial.level === undefined) {
                    const newLevel = Math.floor(val / XP_PER_LEVEL) + 1;
                    if (newLevel >= 1 && newLevel !== user.level) {
                        safeUpdates.level = newLevel;
                    }
                }
            }
            if (key === "level") {
                if (typeof val !== "number" || !isFinite(val) || val < 1) continue;
            }
            if (key === "coins") {
                if (typeof val !== "number" || !isFinite(val) || val < 0) continue;
            }
            if (key === "vipAvatars" || key === "transactions" || key === "honors") {
                if (!Array.isArray(val)) continue;
            }
            if (key === "avatar") {
                if (typeof val !== "string" || val.length === 0) continue;
            }

            safeUpdates[key] = val;
        }

        if (Object.keys(safeUpdates).length === 0) return user;

        if (safeUpdates.vipAvatars && Array.isArray(safeUpdates.vipAvatars)) {
            const existing = Array.isArray(user.vipAvatars) ? user.vipAvatars : [];
            safeUpdates.vipAvatars = Array.from(new Set(existing.concat(safeUpdates.vipAvatars).filter(Boolean)));
        }
        if (safeUpdates.transactions && Array.isArray(safeUpdates.transactions)) {
            const existing = Array.isArray(user.transactions) ? user.transactions : [];
            const existingIds = new Set(existing.map(t => t && t.id).filter(Boolean));
            const newOnes = safeUpdates.transactions.filter(t => t && t.id && !existingIds.has(t.id));
            safeUpdates.transactions = existing.concat(newOnes).slice(-100);
        }

        Object.assign(user, safeUpdates);

        const saved = this.saveCurrent(user);
        if (!saved) return null;

        const users = this.loadAll();
        users[user.phone] = user;
        this.saveAll(users);

        this._syncToAPI(user.phone, safeUpdates);

        return user;
    },

    _syncToAPI(phone, updates) {
        if (!phone) return;

        const apiUpdates = {};
        const map = {
            gamesPlayed: "games_played",
            correctAnswers: "correct_answers",
            wrongAnswers: "wrong_answers",
            bestScore: "best_score",
            leagueWins: "league_wins",
            onlineWins: "online_wins",
            leagueId: "league_id",
            vipAvatars: "vip_avatars",
            categoryStats: "category_stats",
            lastDailyHeartClaim: "last_daily_heart_claim",
            subscriptionUntil: "subscription_until",
            subscriptionType: "subscription_type"
        };

        for (const key in updates) {
            const apiKey = map[key] || key;
            apiUpdates[apiKey] = updates[key];
        }

        supabaseFetch("user-update", {
            body: JSON.stringify({
                phone: phone,
                updates: apiUpdates
            })
        }).catch(err => console.warn("API sync failed:", err));
    },

    repairUsernameIfMissing() {
        const user = this.loadCurrent();
        if (!user) return false;
        if (user.username && user.username.trim().length > 0) return false;

        const allUsers = this.loadAll();
        if (allUsers[user.phone] && allUsers[user.phone].username) {
            user.username = allUsers[user.phone].username;
            this.saveCurrent(user);
            return true;
        }
        return false;
    },

    setUsername(newUsername) {
        const user = this.loadCurrent();
        if (!user) return { ok: false, error: "کاربر وارد نشده" };
        const check = checkUsernameLive(newUsername);
        if (!check.ok) return check;

        const existing = this.findByUsername(newUsername);
        if (existing && existing.phone !== user.phone) {
            return { ok: false, error: "این نام کاربری قبلاً گرفته شده" };
        }

        user.username = newUsername.trim();
        this.saveCurrent(user);

        this._syncToAPI(user.phone, { username: newUsername.trim() });

        const users = this.loadAll();
        users[user.phone] = user;
        this.saveAll(users);

        return { ok: true, username: user.username };
    },

    logout() {
        Storage.remove("currentUser_v2");
        this._cache = null;
    }
};

/* ============================================
   فروشگاه
   ============================================ */

const Shop = {
    async logTransaction(user, type, amount, item = null) {
        if (!user || !user.phone) return null;
        const tx = {
            id: generateId(), type, amount, item,
            timestamp: Date.now(), phone: user.phone
        };
        tx.signature = await signData({
            id: tx.id, type: tx.type, amount: tx.amount,
            item: tx.item, timestamp: tx.timestamp, phone: tx.phone
        });

        const currentUser = Users.loadCurrent();
        if (!currentUser) return tx;

        const transactions = Array.isArray(currentUser.transactions)
            ? currentUser.transactions.slice() : [];
        transactions.push(tx);
        if (transactions.length > 100) {
            transactions.splice(0, transactions.length - 100);
        }
        Users.updateCurrent({ transactions });
        return tx;
    },

    async addCoins(amount, reason) {
        if (typeof amount !== "number" || !isFinite(amount)) return false;
        const user = Users.loadCurrent();
        if (!user) return false;

        const oldCoins = (typeof user.coins === "number" && isFinite(user.coins))
            ? user.coins : 0;
        let newCoins = oldCoins + amount;
        if (newCoins < 0) newCoins = 0;
        if (newCoins > 999999) newCoins = 999999;

        const r = Users.updateCurrent({ coins: newCoins });
        if (!r) return false;

        try {
            await this.logTransaction(user, "coin_earn", amount, reason);
        } catch (e) {}
        return true;
    }
};

/* ============================================
   ❤️ قلب
   ============================================ */

const Hearts = {
    getUserKey() {
        const user = Users.loadCurrent();
        return user ? "hearts_v2_" + user.phone : null;
    },
    _load() {
        const key = this.getUserKey();
        const fallback = { count: HEART_MAX, lastRegen: Date.now() };
        if (!key) return fallback;

        let data = Storage.load(key, fallback);
        if (!data || typeof data !== "object") return fallback;
        if (typeof data.count !== "number" || !isFinite(data.count) || data.count < 0) {
            data.count = HEART_MAX;
        }
        if (data.count > HEART_MAX) data.count = HEART_MAX;
        if (typeof data.lastRegen !== "number" || !isFinite(data.lastRegen)) {
            data.lastRegen = Date.now();
        }
        if (data.lastRegen > Date.now()) data.lastRegen = Date.now();
        return data;
    },
    _save(data) {
        const key = this.getUserKey();
        if (key) Storage.save(key, data);
    },

    peek() {
        const data = this._load();
        if (data.count >= HEART_MAX) return HEART_MAX;
        const elapsed = Date.now() - data.lastRegen;
        const regen = Math.floor(elapsed / (HEART_REGEN_MINUTES * 60000));
        return Math.min(HEART_MAX, data.count + regen);
    },

    sync() {
        const data = this._load();
        const now = Date.now();
        const elapsed = now - data.lastRegen;
        const regenCount = Math.floor(elapsed / (HEART_REGEN_MINUTES * 60000));

        if (regenCount > 0 && data.count < HEART_MAX) {
            const newCount = Math.min(HEART_MAX, data.count + regenCount);
            if (newCount >= HEART_MAX) data.lastRegen = now;
            else data.lastRegen += regenCount * HEART_REGEN_MINUTES * 60000;
            data.count = newCount;
            this._save(data);
        }
        return data.count;
    },

    get() { return this.sync(); },

    use(amount = 1) {
        const data = this._load();
        const now = Date.now();
        const elapsed = now - data.lastRegen;
        const regenCount = Math.floor(elapsed / (HEART_REGEN_MINUTES * 60000));

        if (regenCount > 0 && data.count < HEART_MAX) {
            const newCount = Math.min(HEART_MAX, data.count + regenCount);
            if (newCount >= HEART_MAX) data.lastRegen = now;
            else data.lastRegen += regenCount * HEART_REGEN_MINUTES * 60000;
            data.count = newCount;
        }

        if (data.count <= 0) {
            this._save(data);
            this.updateDisplay();
            return false;
        }
        data.count = Math.max(0, data.count - amount);
        this._save(data);
        this.updateDisplay();
        return true;
    },

    add(amount = 1) {
        const data = this._load();
        const oldCount = data.count;
        data.count = Math.min(HEART_MAX, data.count + amount);
        if (data.count >= HEART_MAX || oldCount === 0) {
            data.lastRegen = Date.now();
        }
        this._save(data);
        this.updateDisplay();
        return data.count;
    },

    claimDailyHearts() {
        const user = Users.loadCurrent();
        if (!user) return { ok: false, error: "ابتدا وارد شو" };

        const now = Date.now();
        const lastClaim = user.lastDailyHeartClaim || 0;
        const HOURS_24 = 24 * 60 * 60 * 1000;

        if (now - lastClaim < HOURS_24) {
            const remaining = HOURS_24 - (now - lastClaim);
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            return {
                ok: false,
                error: "قلب رایگان بعدی تا " + toPersianNumber(hours) +
                       " ساعت و " + toPersianNumber(minutes) + " دقیقه دیگه"
            };
        }

        this.add(DAILY_HEARTS_REWARD);
        Users.updateCurrent({ lastDailyHeartClaim: now });
        return { ok: true, amount: DAILY_HEARTS_REWARD };
    },

    hasDailyReward() {
        const user = Users.loadCurrent();
        if (!user) return false;
        const lastClaim = user.lastDailyHeartClaim || 0;
        return (Date.now() - lastClaim) >= (24 * 60 * 60 * 1000);
    },

    async buy() {
        const user = Users.loadCurrent();
        if (!user) return { ok: false, error: "ابتدا وارد شو" };
        if (user.coins < HEART_BUY_COST) return { ok: false, error: "سکه کافی نداری" };
        if (this.peek() >= HEART_MAX) return { ok: false, error: "قلب‌هات پره" };

        const snapshot = this._load();
        this.add(1);
        const ok = await Shop.addCoins(-HEART_BUY_COST, "heart_buy");
        if (!ok) {
            this._save(snapshot);
            this.updateDisplay();
            return { ok: false, error: "خطا در خرید — دوباره امتحان کن" };
        }
        return { ok: true };
    },

    updateDisplay() {
        const el = document.getElementById("heartsMiniDisplay");
        if (!el) return;
        const count = this.peek();

        const perRow = 5;
        const rows = Math.ceil(HEART_MAX / perRow);
        let html = "";

        for (let row = 0; row < rows; row++) {
            html += '<div class="hearts-row">';
            for (let col = 0; col < perRow; col++) {
                const idx = row * perRow + col;
                if (idx >= HEART_MAX) break;
                const isFilled = idx < count;
                html += '<span class="heart-item ' + (isFilled ? "filled" : "empty") + '">' +
                        (isFilled ? "❤️" : "🖤") + '</span>';
            }
            html += '</div>';
        }

        el.innerHTML = html;
        el.classList.toggle("empty", count === 0);
    }
};

/* ============================================
   🎫 اشتراک
   ============================================ */

const SUBSCRIPTIONS = {
    daily: {
        id: "daily", title: "اشتراک نامحدود", emoji: "🎫",
        price: 500, durationMs: 24 * 60 * 60 * 1000,
        color: "#10b981", shadow: "#047857",
        desc: "۲۴ ساعت بازی بدون محدودیت"
    },
    weekly: {
        id: "weekly", title: "عضویت ویژه", emoji: "💎",
        price: 2000, durationMs: 7 * 24 * 60 * 60 * 1000,
        color: "#8b5cf6", shadow: "#5b21b6",
        desc: "۷ روز بازی بدون محدودیت + ۲۰٪ تخفیف",
        badge: "محبوب‌ترین"
    },
    monthly: {
        id: "monthly", title: "VIP", emoji: "👑",
        price: 6000, durationMs: 30 * 24 * 60 * 60 * 1000,
        color: "#f59e0b", shadow: "#b45309",
        desc: "۳۰ روز بازی بدون محدودیت + ۳۳٪ تخفیف",
        badge: "بهترین ارزش"
    }
};

const Subscription = {
    isActive() {
        const user = Users.loadCurrent();
        if (!user) return false;
        return (user.subscriptionUntil || 0) > Date.now();
    },
    remainingMs() {
        const user = Users.loadCurrent();
        if (!user) return 0;
        const rem = (user.subscriptionUntil || 0) - Date.now();
        return rem > 0 ? rem : 0;
    },
    activeType() {
        const user = Users.loadCurrent();
        if (!user) return null;
        if (!this.isActive()) return null;
        return user.subscriptionType || null;
    },
    cleanup() {
        const user = Users.loadCurrent();
        if (!user) return;
        const until = user.subscriptionUntil || 0;
        if (until === 0) return;
        const GRACE_PERIOD = 60 * 60 * 1000;
        if (until + GRACE_PERIOD < Date.now() && user.subscriptionType) {
            Users.updateCurrent({ subscriptionType: null });
        }
    },
    formatRemaining() {
        const ms = this.remainingMs();
        if (ms <= 0) return "";
        const totalMin = Math.floor(ms / 60000);
        const days = Math.floor(totalMin / (60 * 24));
        const hours = Math.floor((totalMin % (60 * 24)) / 60);
        const minutes = totalMin % 60;
        if (days > 0) return toPersianNumber(days) + " روز و " + toPersianNumber(hours) + " ساعت";
        if (hours > 0) return toPersianNumber(hours) + " ساعت و " + toPersianNumber(minutes) + " دقیقه";
        return toPersianNumber(minutes) + " دقیقه";
    },
    async buy(subId) {
        const sub = SUBSCRIPTIONS[subId];
        if (!sub) return { ok: false, error: "اشتراک نامعتبر" };
        const user = Users.loadCurrent();
        if (!user) return { ok: false, error: "ابتدا وارد شو" };
        if (user.coins < sub.price) return { ok: false, error: "سکه کافی نداری" };

        const ok = await Shop.addCoins(-sub.price, "sub_" + subId);
        if (!ok) return { ok: false, error: "خطا در ثبت تراکنش" };

        const now = Date.now();
        const currentUntil = user.subscriptionUntil || 0;
        const baseTime = currentUntil > now ? currentUntil : now;
        const newUntil = baseTime + sub.durationMs;

        Users.updateCurrent({
            subscriptionUntil: newUntil,
            subscriptionType: subId
        });
        return { ok: true };
    }
};

/* ============================================
   User
   ============================================ */

let _topBarTimer = null;

const User = {
    get() { return Users.loadCurrent(); },

    async addXP(amount) {
        const user = this.get();
        if (!user) return null;
        if (typeof amount !== "number" || !isFinite(amount)) return null;
        if (Math.abs(amount) > 5000) return null;
        if (amount < 0) return null;

        const oldLevel = (typeof user.level === "number" && user.level >= 1) ? user.level : 1;
        let oldXP = (typeof user.xp === "number" && isFinite(user.xp)) ? user.xp : 0;
        const minXPForLevel = (oldLevel - 1) * XP_PER_LEVEL;
        if (oldXP < minXPForLevel) oldXP = minXPForLevel;

        let newXP = oldXP + amount;
        if (newXP < minXPForLevel) newXP = minXPForLevel;
        if (newXP > 999999) newXP = 999999;

        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

        const r = Users.updateCurrent({ xp: newXP, level: newLevel });
        if (!r) return null;

        this.scheduleTopBarUpdate();
        return { leveledUp: newLevel > oldLevel, newLevel: newLevel };
    },

    async addCoins(amount) {
        if (typeof amount !== "number" || !isFinite(amount)) return;
        if (Math.abs(amount) > 1000) return;
        await Shop.addCoins(amount, "system");
        this.scheduleTopBarUpdate();
    },

    scheduleTopBarUpdate() {
        if (_topBarTimer) clearTimeout(_topBarTimer);
        _topBarTimer = setTimeout(() => {
            _topBarTimer = null;
            this.updateTopBar();
        }, 150);
    },

    updateTopBar() {
        const user = this.get();
        if (!user) return;
        const topBar = document.getElementById("topBar");
        if (topBar) topBar.style.display = "flex";
        const coinsEl = document.getElementById("coinsDisplay");
        if (coinsEl) {
            const coins = (typeof user.coins === "number" && isFinite(user.coins)) ? user.coins : 0;
            coinsEl.textContent = toPersianNumber(coins);
        }
        Hearts.updateDisplay();
    },

    hideTopBar() {
        const topBar = document.getElementById("topBar");
        if (topBar) topBar.style.display = "none";
        const bottomBar = document.getElementById("bottomBar");
        if (bottomBar) bottomBar.style.display = "none";
    },
    showBottomBar() {
        const bottomBar = document.getElementById("bottomBar");
        if (bottomBar) bottomBar.style.display = "flex";
    },
    hideBottomBar() {
        const bottomBar = document.getElementById("bottomBar");
        if (bottomBar) bottomBar.style.display = "none";
    }
};

/* ============================================
   کمکی
   ============================================ */

function toPersianNumber(num) {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(num).replace(/\d/g, d => persian[d]).replace(/,/g, "٬");
}

function getDisplayName(user) {
    if (!user) return "کاربر";
    if (user.username && user.username.trim().length > 0) return user.username;
    if (user.phone && user.phone.length >= 4) return "کاربر " + toPersianNumber(user.phone.slice(-4));
    return "کاربر";
}

function cleanQuestionText(text) {
    if (!text) return "";
    let s = String(text).trim();
    s = s.replace(/^[\s]*[\(\[]?[۰-۹0-9]+[\)\]]?\s*[\.\-:،\)\]\/\\]\s*/, "");
    s = s.replace(/^[\s]*[\(\[]?[۰-۹0-9]+[\)\]]?\s+/, "");
    s = s.replace(/^(سوال|سؤال|question|q)\s*[۰-۹0-9]+\s*[\.\-:،\)\]]\s*/i, "");
    s = s.replace(/^q\s*[۰-۹0-9]+\s*[:\.\)]\s*/i, "");
    return s.trim();
}

function pickQuestionsByLevel(questions, difficulty) {
    const mix = DIFFICULTY_MIX[difficulty] || DIFFICULTY_MIX.medium;
    const total = Math.min(TOTAL_QUESTIONS, questions.length);

    const easyCount = Math.round(total * mix.easy);
    const hardCount = Math.round(total * mix.hard);
    const mediumCount = Math.max(0, total - easyCount - hardCount);

    const byLevel = {
        easy: questions.filter(q => (q.difficulty || "medium") === "easy"),
        medium: questions.filter(q => (q.difficulty || "medium") === "medium"),
        hard: questions.filter(q => (q.difficulty || "medium") === "hard")
    };

    Object.keys(byLevel).forEach(k => {
        byLevel[k].sort(() => Math.random() - 0.5);
    });

    const selected = [
        ...byLevel.easy.slice(0, easyCount),
        ...byLevel.medium.slice(0, mediumCount),
        ...byLevel.hard.slice(0, hardCount)
    ];

    if (selected.length < total) {
        const selectedSet = new Set(selected);
        const allRemaining = questions
            .filter(q => !selectedSet.has(q))
            .sort(() => Math.random() - 0.5);
        while (selected.length < total && allRemaining.length > 0) {
            selected.push(allRemaining.shift());
        }
    }

    return selected.sort(() => Math.random() - 0.5);
}

function isValidAvatar(avatarId, user) {
    if (!avatarId || typeof avatarId !== "string") return false;
    if (AVATARS.indexOf(avatarId) !== -1) return true;
    if (user && Array.isArray(user.vipAvatars)) {
        if (user.vipAvatars.indexOf(avatarId) !== -1) return true;
    }
    return false;
}

function getSafeAvatar(avatarId, user) {
    if (isValidAvatar(avatarId, user)) return avatarId;
    return AVATARS[0];
}

function getAvatarHTML(avatarId, size) {
    if (!avatarId) return "👤";
    const vip = VIP_AVATARS.find(v => v.id === avatarId);
    if (vip) {
        const px = size || 48;
        return '<img src="' + escapeHtml(vip.url) +
            '" alt="آواتار" style="width:' + px + 'px; height:' + px +
            'px; border-radius:50%; object-fit:cover; display:inline-block; vertical-align:middle;"' +
            ' onerror="this.style.display=\'none\';this.parentNode.textContent=\'🌟\';">';
    }
    if (AVATARS.indexOf(avatarId) === -1) return "👤";
    return escapeHtml(avatarId);
}

function resetCategoriesDiv() {
    categoriesDiv.innerHTML = "";
    categoriesDiv.style.display = "";
    categoriesDiv.style.overflow = "";
    categoriesDiv.style.paddingTop = "";
    categoriesDiv.style.paddingBottom = "";
    categoriesDiv.style.flexDirection = "";
    categoriesDiv.style.gap = "";
    categoriesDiv.style.height = "";
}

function setActiveTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
}

function goTab(tabName) {
    setActiveTab(tabName);
    playMusicMain();
    if (tabName === "home") showHomeScreen();
    if (tabName === "play") showGameModeScreen();
    if (tabName === "profile") showProfileScreen();
    if (tabName === "league") showLeagueScreen();
    if (tabName === "shop") showComingSoon("فروشگاه", "🛒", "#3b82f6", "#1e40af");
}

function showComingSoon(title, emoji, color, shadow) {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    const box = document.createElement("div");
    box.style.cssText = "max-width:520px;margin:60px auto;text-align:center;padding:24px;";
    const icon = document.createElement("div");
    icon.style.cssText = "font-size:80px;margin-bottom:16px;filter:drop-shadow(0 6px 15px rgba(0,0,0,0.25));";
    icon.textContent = emoji;
    box.appendChild(icon);
    const t = document.createElement("div");
    t.style.cssText = "font-size:24px;font-weight:900;color:" + shadow + ";margin-bottom:12px;";
    t.textContent = title;
    box.appendChild(t);
    const msg = document.createElement("div");
    msg.style.cssText = "font-size:14px;font-weight:700;color:#64748b;line-height:1.8;margin-bottom:20px;";
    msg.textContent = "به‌زودی فعال می‌شه! 🚀";
    box.appendChild(msg);
    const btn = document.createElement("button");
    btn.style.cssText =
        "padding:14px 30px;border-radius:16px;" +
        "background:linear-gradient(180deg," + color + "," + shadow + ");" +
        "color:white;border:3px solid " + color + ";" +
        "font-family:inherit;font-size:15px;font-weight:900;cursor:pointer;" +
        "box-shadow:0 5px 0 " + shadow + ";";
    btn.textContent = "بازگشت به خانه";
    btn.onclick = showHomeScreen;
    box.appendChild(btn);
    categoriesDiv.appendChild(box);
}

/* ============================================
   🎵 موسیقی
   ============================================ */

function playMusicMain() {
    try {
        if (typeof Music !== "undefined" && Music.playMain) Music.playMain();
    } catch (e) {}
}
function playMusicQuiz() {
    try {
        if (typeof Music !== "undefined" && Music.playQuiz) Music.playQuiz();
    } catch (e) {}
}
function setupMusicOnClick() {
    document.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (btn.id === "musicToggleBtn") return;
        if (document.querySelector(".exit-btn")) playMusicQuiz();
        else playMusicMain();
    }, true);
}

/* ============================================
   🎉 Toast Level Up
   ============================================ */

function showLevelUpToast(newLevel) {
    const toast = document.createElement("div");
    toast.style.cssText =
        "position:fixed;top:100px;left:50%;transform:translateX(-50%);" +
        "z-index:99999;padding:16px 24px;border-radius:20px;" +
        "background:linear-gradient(135deg,#f59e0b,#fbbf24,#fde68a);" +
        "color:#78350f;font-size:16px;font-weight:900;font-family:inherit;" +
        "box-shadow:0 10px 0 #b45309,0 15px 40px rgba(245,158,11,0.5);" +
        "border:3px solid #fcd34d;text-align:center;" +
        "animation:toastSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1);";
    toast.innerHTML =
        '<div style="font-size:36px;margin-bottom:4px;">🎉</div>' +
        '<div>تبریک! سطح ' + toPersianNumber(newLevel) + ' شدی!</div>';
    document.body.appendChild(toast);

    setTimeout(function () {
        toast.style.animation = "toastSlideOut 0.4s ease forwards";
        setTimeout(function () { toast.remove(); }, 400);
    }, 2500);
}

/* ============================================
   🚪 مودال خروج
   ============================================ */

function showExitAppModal(callback) {
    const existing = document.getElementById("appExitModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "appExitModal";
    modal.style.cssText =
        "position:fixed; inset:0; z-index:99999;" +
        "background:rgba(15,23,42,0.85);backdrop-filter:blur(10px);" +
        "display:flex; align-items:center; justify-content:center; padding:20px;";

    const card = document.createElement("div");
    card.style.cssText =
        "width:100%; max-width:380px;" +
        "background:linear-gradient(180deg,#ffffff,#f0f4ff);" +
        "border:4px solid #3b82f6; border-radius:28px;" +
        "padding:30px 24px; text-align:center;" +
        "box-shadow:0 20px 0 #1e40af,0 30px 80px rgba(30,64,175,0.5);";

    card.innerHTML =
        '<div style="font-size:60px;margin-bottom:15px;">🚪</div>' +
        '<div style="font-size:24px;font-weight:900;color:#1e293b;margin-bottom:10px;">خروج از برنامه</div>' +
        '<div style="font-size:14px;font-weight:700;color:#64748b;margin-bottom:24px;line-height:1.7;">' +
        'مطمئنی می‌خوای از برنامه خارج شی؟' +
        '<div style="margin-top:8px;font-size:12px;color:#3b82f6;font-weight:900;">✨ پیشرفتت محفوظ می‌مونه</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1.3fr;gap:10px;">' +
        '<button type="button" id="exitStayBtn" style="padding:14px;background:linear-gradient(180deg,#22c55e,#16a34a);' +
        'color:white;border:3px solid #4ade80;border-radius:16px;' +
        'font-size:14px;font-weight:900;font-family:inherit;cursor:pointer;' +
        'box-shadow:0 5px 0 #14532d;touch-action:manipulation;">🏠 می‌مونم</button>' +
        '<button type="button" id="exitConfirmBtn" style="padding:14px;background:linear-gradient(180deg,#ef4444,#b91c1c);' +
        'color:white;border:3px solid #f87171;border-radius:16px;' +
        'font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;' +
        'box-shadow:0 5px 0 #7f1d1d;touch-action:manipulation;">🚪 خروج</button>' +
        '</div>';

    modal.appendChild(card);
    document.body.appendChild(modal);

    let finished = false;
    function finish(shouldExit) {
        if (finished) return;
        finished = true;
        try { modal.remove(); } catch (e) {}
        if (typeof callback === "function") {
            try { callback(shouldExit); } catch (e) { console.error(e); }
        }
        if (shouldExit) {
            setTimeout(function () { performAppExit(); }, 30);
        }
    }

    const stayBtn = card.querySelector("#exitStayBtn");
    const confirmBtn = card.querySelector("#exitConfirmBtn");
    stayBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        finish(false);
    });
    confirmBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        finish(true);
    });
    modal.addEventListener("click", function (e) {
        if (e.target === modal) finish(false);
    });
}

/* ============================================
   📝 مودال نام کاربری
   ============================================ */

function showSetUsernameModal(onSuccess, isPaidChange) {
    if (document.getElementById("setUsernameModal")) return;
    const modal = document.createElement("div");
    modal.id = "setUsernameModal";
    modal.style.cssText =
        "position:fixed; inset:0; z-index:99999;" +
        "background:rgba(15,23,42,0.9);backdrop-filter:blur(12px);" +
        "display:flex; align-items:center; justify-content:center;padding:20px;";
    const card = document.createElement("div");
    card.style.cssText =
        "width:100%; max-width:400px;" +
        "background:linear-gradient(180deg,#ffffff,#f0f4ff);" +
        "border:4px solid #3b82f6; border-radius:28px;" +
        "padding:30px 24px;" +
        "box-shadow:0 20px 0 #1e40af,0 30px 80px rgba(30,64,175,0.5);" +
        "text-align:center;";

    const user = Users.loadCurrent();
    const userCoins = user && typeof user.coins === "number" ? user.coins : 0;

    let headerHTML =
        '<div style="font-size:60px;margin-bottom:12px;">👤</div>' +
        '<div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:8px;">' +
        'نام کاربری جدید</div>';

    if (isPaidChange) {
        const canAfford = userCoins >= USERNAME_CHANGE_COST;
        headerHTML +=
            '<div style="padding:12px;margin-bottom:16px;border-radius:14px;' +
            'background:' + (canAfford ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : 'linear-gradient(135deg,#fee2e2,#fecaca)') + ';' +
            'border:3px solid ' + (canAfford ? '#fbbf24' : '#f87171') + ';' +
            'font-size:14px;font-weight:900;' +
            'color:' + (canAfford ? '#92400e' : '#991b1b') + ';">' +
            '💰 هزینه تغییر: ' + toPersianNumber(USERNAME_CHANGE_COST) + ' سکه<br>' +
            '<span style="font-size:12px;font-weight:700;">موجودی شما: ' +
            toPersianNumber(userCoins) + ' سکه</span></div>';
    } else {
        headerHTML +=
            '<div style="padding:12px;margin-bottom:16px;border-radius:14px;' +
            'background:linear-gradient(135deg,#d1fae5,#a7f3d0);' +
            'border:3px solid #10b981;font-size:13px;font-weight:900;color:#047857;' +
            'line-height:1.8;">✨ این تغییر <b>رایگان</b> است</div>';
    }

    card.innerHTML = headerHTML;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "نام کاربری (۳-۱۵ کاراکتر)";
    input.maxLength = 15;
    input.style.cssText =
        "width:100%;padding:14px 16px;margin-bottom:8px;" +
        "border:3px solid #3b82f6;border-radius:14px;" +
        "font-family:inherit;font-size:15px;font-weight:900;" +
        "text-align:center;background:white;color:#1e293b;" +
        "outline:none;box-sizing:border-box;";
    card.appendChild(input);

    const hint = document.createElement("div");
    hint.style.cssText =
        "font-size:11px;font-weight:900;text-align:center;" +
        "min-height:18px;color:#94a3b8;margin-bottom:14px;line-height:1.5;";
    hint.textContent = "۳ تا ۱۵ کاراکتر — حداقل ۲ حرف";
    card.appendChild(hint);

    const errorMsg = document.createElement("div");
    errorMsg.style.cssText =
        "font-size:12px;font-weight:900;color:#dc2626;" +
        "min-height:16px;margin-bottom:10px;text-align:center;";
    card.appendChild(errorMsg);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = isPaidChange
        ? "💾 ذخیره (پرداخت " + toPersianNumber(USERNAME_CHANGE_COST) + " سکه)"
        : "✅ ذخیره";
    saveBtn.style.cssText =
        "width:100%;padding:15px;border-radius:16px;" +
        "background:linear-gradient(180deg,#22c55e,#16a34a);" +
        "color:white;border:3px solid #4ade80;" +
        "font-size:15px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 6px 0 #14532d;";
    card.appendChild(saveBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌ انصراف";
    cancelBtn.style.cssText =
        "width:100%;padding:12px;margin-top:10px;border-radius:14px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    cancelBtn.onclick = function () { modal.remove(); };
    card.appendChild(cancelBtn);

    input.oninput = function () {
        const v = input.value.trim();
        if (v.length === 0) {
            hint.textContent = "۳ تا ۱۵ کاراکتر — حداقل ۲ حرف";
            hint.style.color = "#94a3b8";
            errorMsg.textContent = "";
            return;
        }
        const r = checkUsernameLive(v);
        if (r.ok) {
            hint.textContent = "✅ این نام کاربری مناسبه";
            hint.style.color = "#16a34a";
            errorMsg.textContent = "";
        } else {
            hint.textContent = "❌ " + r.error;
            hint.style.color = "#dc2626";
        }
    };

    saveBtn.onclick = async function () {
        const v = input.value.trim();
        const check = checkUsernameLive(v);
        if (!check.ok) {
            errorMsg.textContent = "❌ " + check.error;
            return;
        }

        saveBtn.disabled = true;
        saveBtn.style.opacity = "0.6";
        saveBtn.style.cursor = "not-allowed";
        const originalText = saveBtn.textContent;

        try {
            if (isPaidChange) {
                const currentUser = Users.loadCurrent();
                if (!currentUser) throw new Error("کاربر وارد نشده");
                if (currentUser.coins < USERNAME_CHANGE_COST) throw new Error("سکه کافی نداری!");

                saveBtn.textContent = "⏳ در حال پرداخت...";
                const paid = await Shop.addCoins(-USERNAME_CHANGE_COST, "username_change");
                if (!paid) throw new Error("خطا در پرداخت");
            }

            const r = Users.setUsername(v);
            if (!r.ok) {
                if (isPaidChange) {
                    await Shop.addCoins(USERNAME_CHANGE_COST, "username_change_refund");
                }
                throw new Error(r.error);
            }

            modal.remove();
            if (onSuccess) onSuccess(r.username);

        } catch (e) {
            errorMsg.textContent = "❌ " + e.message;
            saveBtn.disabled = false;
            saveBtn.style.opacity = "1";
            saveBtn.style.cursor = "pointer";
            saveBtn.textContent = originalText;
        }
    };

    input.onkeydown = function (e) {
        if (e.key === "Enter") saveBtn.click();
    };

    modal.appendChild(card);
    document.body.appendChild(modal);
    setTimeout(function () { input.focus(); }, 200);
}

/* ============================================
   📋 مودال اطلاعات
   ============================================ */

function showInfoModal(config) {
    if (document.getElementById("infoModal")) return;
    const modal = document.createElement("div");
    modal.id = "infoModal";
    modal.style.cssText =
        "position:fixed; inset:0; z-index:99998;" +
        "background:rgba(15,23,42,0.88);backdrop-filter:blur(12px);" +
        "display:flex; align-items:center; justify-content:center;" +
        "padding:20px; animation:modalFadeIn 0.25s ease;";
    const card = document.createElement("div");
    card.style.cssText =
        "width:100%; max-width:380px;" +
        "background:linear-gradient(180deg,#ffffff,#f0f4ff);" +
        "border:4px solid " + (config.color || "#3b82f6") + ";" +
        "border-radius:28px; padding:30px 24px; text-align:center;" +
        "box-shadow:0 20px 0 " + (config.shadow || "#1e40af") + "," +
        "0 30px 80px rgba(30,64,175,0.5);" +
        "animation:modalBounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1);";
    const emoji = document.createElement("div");
    emoji.style.cssText =
        "font-size:70px;margin-bottom:16px;line-height:1;" +
        "filter:drop-shadow(0 6px 15px rgba(0,0,0,0.25));" +
        "animation:logoBounce 2s ease infinite;";
    emoji.textContent = config.emoji || "ℹ️";
    card.appendChild(emoji);
    const title = document.createElement("div");
    title.style.cssText = "font-size:22px;font-weight:900;color:#1e293b;margin-bottom:12px;";
    title.textContent = config.title || "";
    card.appendChild(title);
    const msg = document.createElement("div");
    msg.style.cssText = "font-size:14px;font-weight:700;color:#64748b;margin-bottom:24px;line-height:2;white-space:pre-line;";
    msg.textContent = config.message || "";
    card.appendChild(msg);
    if (config.showProgress && config.currentLevel) {
        const pWrap = document.createElement("div");
        pWrap.style.cssText = "width:100%;height:14px;background:#e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:8px;border:2px solid #cbd5e1;";
        const pBar = document.createElement("div");
        const pct = Math.min(100, (config.currentLevel / ONLINE_UNLOCK_LEVEL) * 100);
        pBar.style.cssText = "height:100%;width:" + pct + "%;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#fbbf24);background-size:200% 100%;animation:onlineEnergyFlow 2s linear infinite;border-radius:10px;transition:width 0.8s ease;";
        pWrap.appendChild(pBar);
        card.appendChild(pWrap);
        const pText = document.createElement("div");
        pText.style.cssText = "font-size:12px;font-weight:900;color:#64748b;margin-bottom:18px;";
        pText.textContent = "سطح " + toPersianNumber(config.currentLevel) + " از " + toPersianNumber(ONLINE_UNLOCK_LEVEL);
        card.appendChild(pText);
    }
    const btn = document.createElement("button");
    btn.textContent = config.buttonText || "باشه";
    btn.style.cssText =
        "width:100%;padding:15px;border-radius:16px;" +
        "background:linear-gradient(180deg," + (config.color || "#3b82f6") +
        "," + (config.shadow || "#1e40af") + ");" +
        "color:white;border:3px solid " + (config.color || "#60a5fa") + ";" +
        "font-size:16px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 6px 0 " + (config.shadow || "#1e3a8a") + ";";
    btn.onclick = function () {
        modal.remove();
        if (config.onClose) config.onClose();
    };
    card.appendChild(btn);
    modal.appendChild(card);
    document.body.appendChild(modal);
    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.remove();
            if (config.onClose) config.onClose();
        }
    };
}

/* ============================================
   📋 مودال تأیید
   ============================================ */

function showConfirmModal(config) {
    if (document.getElementById("confirmModal")) return;
    const modal = document.createElement("div");
    modal.id = "confirmModal";
    modal.style.cssText =
        "position:fixed; inset:0; z-index:99999;" +
        "background:rgba(15,23,42,0.88);backdrop-filter:blur(12px);" +
        "display:flex; align-items:center; justify-content:center;" +
        "padding:20px; animation:modalFadeIn 0.25s ease;";
    const card = document.createElement("div");
    card.style.cssText =
        "width:100%; max-width:380px;" +
        "background:linear-gradient(180deg,#ffffff,#f0f4ff);" +
        "border:4px solid " + (config.color || "#3b82f6") + ";" +
        "border-radius:28px; padding:30px 24px; text-align:center;" +
        "box-shadow:0 20px 0 " + (config.shadow || "#1e40af") + "," +
        "0 30px 80px rgba(30,64,175,0.5);" +
        "animation:modalBounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1);";
    const emoji = document.createElement("div");
    emoji.style.cssText = "font-size:70px;margin-bottom:16px;line-height:1;filter:drop-shadow(0 6px 15px rgba(0,0,0,0.25));";
    emoji.textContent = config.emoji || "❓";
    card.appendChild(emoji);
    const title = document.createElement("div");
    title.style.cssText = "font-size:20px;font-weight:900;color:#1e293b;margin-bottom:12px;";
    title.textContent = config.title || "";
    card.appendChild(title);
    const msg = document.createElement("div");
    msg.style.cssText = "font-size:14px;font-weight:700;color:#64748b;margin-bottom:24px;line-height:2;white-space:pre-line;";
    msg.textContent = config.message || "";
    card.appendChild(msg);
    const row = document.createElement("div");
    row.style.cssText = "display:grid;grid-template-columns:1fr 1.2fr;gap:10px;";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = config.cancelText || "لغو";
    cancelBtn.style.cssText =
        "padding:14px;background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;border-radius:16px;" +
        "font-size:14px;font-weight:900;font-family:inherit;cursor:pointer;" +
        "box-shadow:0 5px 0 #334155;";
    cancelBtn.onclick = function () { modal.remove(); };
    row.appendChild(cancelBtn);
    const okBtn = document.createElement("button");
    okBtn.textContent = config.confirmText || "تأیید";
    okBtn.style.cssText =
        "padding:14px;background:linear-gradient(180deg," +
        (config.color || "#3b82f6") + "," +
        (config.shadow || "#1e40af") + ");" +
        "color:white;border:3px solid " + (config.color || "#60a5fa") + ";" +
        "border-radius:16px;font-size:15px;font-weight:900;" +
        "font-family:inherit;cursor:pointer;" +
        "box-shadow:0 5px 0 " + (config.shadow || "#1e3a8a") + ";";
    okBtn.onclick = function () {
        modal.remove();
        if (config.onConfirm) config.onConfirm();
    };
    row.appendChild(okBtn);
    card.appendChild(row);
    modal.appendChild(card);
    document.body.appendChild(modal);
    modal.onclick = function (e) {
        if (e.target === modal) modal.remove();
    };
}

/* ============================================
   صفحه ورود / ثبت‌نام
   ============================================ */

function showLoginScreen() {
    User.hideTopBar();
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");

    if (!hasCryptoSupport()) {
        const warn = document.createElement("div");
        warn.style.cssText =
            "max-width:400px;margin:60px auto;padding:24px;" +
            "background:#fee2e2;border:3px solid #dc2626;border-radius:20px;" +
            "text-align:center;font-family:inherit;direction:rtl;";
        warn.innerHTML =
            '<div style="font-size:60px;margin-bottom:12px;">⚠️</div>' +
            '<div style="font-size:18px;font-weight:900;color:#991b1b;margin-bottom:10px;">' +
            'مرورگر پشتیبانی نمی‌شود</div>' +
            '<div style="font-size:13px;color:#7f1d1d;line-height:1.9;font-weight:700;">' +
            'برای استفاده از اپ دانشمند، لطفاً مرورگر خود را به‌روز کنید ' +
            'یا از Chrome / Firefox جدید استفاده کنید.</div>';
        categoriesDiv.appendChild(warn);
        return;
    }

    const card = document.createElement("div");
    card.className = "login-card";

    const logo = document.createElement("img");
    logo.className = "login-logo-img";
    logo.src = "images/scientist.png";
    logo.alt = "دانشمند";
    logo.onerror = function () {
        const emoji = document.createElement("div");
        emoji.className = "login-logo";
        emoji.textContent = "🧠";
        card.replaceChild(emoji, logo);
    };
    card.appendChild(logo);

    const title = document.createElement("h1");
    title.textContent = "دانشمند";
    card.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "login-subtitle";
    subtitle.textContent = "به دنیای دانش خوش آمدید";
    card.appendChild(subtitle);

    const phoneLabel = document.createElement("label");
    phoneLabel.textContent = "📱 شماره موبایل";
    phoneLabel.style.cssText = "display:block;text-align:right;font-size:12px;font-weight:900;color:#64748b;margin:0 4px 6px 0;";
    card.appendChild(phoneLabel);

    const phoneInput = document.createElement("input");
    phoneInput.type = "tel";
    phoneInput.placeholder = "۰۹۱۲۳۴۵۶۷۸۹";
    phoneInput.maxLength = 15;
    phoneInput.inputMode = "numeric";
    phoneInput.dir = "ltr";
    phoneInput.style.cssText = "text-align:center;margin-bottom:12px;";
    card.appendChild(phoneInput);

    const usernameLabel = document.createElement("label");
    usernameLabel.textContent = "👤 نام کاربری (برای ثبت‌نام)";
    usernameLabel.style.cssText = "display:block;text-align:right;font-size:12px;font-weight:900;color:#64748b;margin:0 4px 6px 0;";
    card.appendChild(usernameLabel);

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "نام کاربری (فقط برای کاربران جدید)";
    usernameInput.maxLength = 15;
    usernameInput.style.cssText = "text-align:center;margin-bottom:6px;";
    card.appendChild(usernameInput);

    const usernameHint = document.createElement("div");
    usernameHint.id = "usernameLiveHint";
    usernameHint.style.cssText =
        "font-size:11px;font-weight:900;text-align:right;" +
        "margin:0 4px 12px 0;min-height:16px;color:#94a3b8;line-height:1.5;";
    usernameHint.textContent = "۳ تا ۱۵ کاراکتر — حداقل ۲ حرف";
    card.appendChild(usernameHint);

    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "🔒 رمز عبور";
    passwordLabel.style.cssText = "display:block;text-align:right;font-size:12px;font-weight:900;color:#64748b;margin:0 4px 6px 0;";
    card.appendChild(passwordLabel);

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "حداقل ۶ کاراکتر";
    passwordInput.maxLength = 50;
    passwordInput.style.cssText = "text-align:center;margin-bottom:14px;";
    card.appendChild(passwordInput);

    const errorMsg = document.createElement("p");
    errorMsg.style.cssText =
        "color:#dc2626;font-weight:900;font-size:13px;" +
        "min-height:20px;text-align:center;margin:8px 0;";
    card.appendChild(errorMsg);

    const actionBtn = document.createElement("button");
    actionBtn.className = "login-btn primary";
    actionBtn.textContent = "ورود";
    card.appendChild(actionBtn);

    const registerBtn = document.createElement("button");
    registerBtn.type = "button";
    registerBtn.className = "login-btn";
    registerBtn.textContent = "ثبت‌نام";
    registerBtn.style.cssText = "margin-top:10px;background:#e2e8f0;color:#0f172a;";
    card.appendChild(registerBtn);

    const hint = document.createElement("p");
    hint.textContent = "🎁 کاربر جدید: ۵۰ سکه هدیه + ۱۰ قلب رایگان";
    hint.style.cssText = "font-size:11px;color:#16a34a;margin-top:14px;text-align:center;font-weight:900;line-height:1.8;";
    card.appendChild(hint);

    function accountExistsMessage() {
        errorMsg.textContent = "❌ یک حساب دارید. از دکمه ورود استفاده کنید";
    }

    async function submitAuth(mode) {
        errorMsg.textContent = "";
        actionBtn.disabled = true;
        registerBtn.disabled = true;
        const oldLogin = actionBtn.textContent;
        const oldRegister = registerBtn.textContent;
        if (mode === "login") actionBtn.textContent = "⏳ لطفاً صبر کن...";
        else registerBtn.textContent = "⏳ لطفاً صبر کن...";
        try {
            const phone = phoneInput.value.trim();
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            if (!isValidIranianPhone(phone)) {
                errorMsg.textContent = "❌ شماره موبایل معتبر وارد کن";
                return;
            }
            if (!password || password.length < 6) {
                errorMsg.textContent = "❌ رمز باید حداقل ۶ کاراکتر باشد";
                return;
            }

            if (mode === "login") {
                const result = await Users.login(phone, password);
                if (!result.ok) {
                    errorMsg.textContent = "❌ " + result.error;
                    return;
                }
                Users.saveCurrent(result.user);
                if (!result.user.username || result.user.username.trim().length === 0) {
                    showSetUsernameModal(function () {
                        if (!result.user.avatar) showAvatarScreen();
                        else showHomeScreen();
                    }, false);
                    return;
                }
                if (!result.user.avatar) showAvatarScreen();
                else showHomeScreen();
                return;
            }

            const nameCheck = checkUsernameLive(username);
            if (!username || !nameCheck.ok) {
                errorMsg.textContent = "❌ " + (username ? nameCheck.error : "برای ثبت‌نام، نام کاربری هم لازمه");
                usernameInput.focus();
                return;
            }

            const probe = await Users.login(phone, password);
            const missing = probe.error && probe.error.indexOf("پیدا نشد") !== -1;
            if (!missing) {
                accountExistsMessage();
                return;
            }

            const result = await Users.register(phone, username, password);
            if (!result.ok) {
                const err = result.error || "";
                if (err.indexOf("قبلا") !== -1 || err.indexOf("موجود") !== -1 || err.indexOf("وجود") !== -1) {
                    accountExistsMessage();
                } else {
                    errorMsg.textContent = "❌ " + err;
                }
                return;
            }
            Users.saveCurrent(result.user);
            if (!result.user.avatar) showAvatarScreen();
            else showHomeScreen();
        } catch (err) {
            console.error(err);
            errorMsg.textContent = "❌ خطا. دوباره امتحان کن";
        } finally {
            actionBtn.disabled = false;
            registerBtn.disabled = false;
            actionBtn.textContent = oldLogin;
            registerBtn.textContent = oldRegister;
        }
    }

    actionBtn.onclick = function () { submitAuth("login"); };
    registerBtn.onclick = function () { submitAuth("register"); };

    usernameInput.oninput = function () {
        const v = usernameInput.value.trim();
        if (v.length === 0) {
            usernameHint.textContent = "۳ تا ۱۵ کاراکتر — حداقل ۲ حرف";
            usernameHint.style.color = "#94a3b8";
            return;
        }
        const r = checkUsernameLive(v);
        if (r.ok) {
            usernameHint.textContent = "✅ این نام کاربری مناسبه";
            usernameHint.style.color = "#16a34a";
        } else {
            usernameHint.textContent = "❌ " + r.error;
            usernameHint.style.color = "#dc2626";
        }
    };

    categoriesDiv.appendChild(card);
}

/* ============================================
   انتخاب آواتار
   ============================================ */

function showAvatarScreen(returnTo) {
    User.hideTopBar();
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    playMusicMain();
    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }
    const card = document.createElement("div");
    card.className = "avatar-picker";
    const title = document.createElement("h2");
    title.textContent = "آواتار خود را انتخاب کنید";
    card.appendChild(title);
    const subtitle = document.createElement("p");
    subtitle.style.cssText = "color:var(--text-3);font-size:13px;margin-bottom:20px;font-weight:600;";
    subtitle.textContent = "این آواتار در پروفایل شما نمایش داده می‌شه";
    card.appendChild(subtitle);
    let selectedAvatar = getSafeAvatar(user.avatar, user);
    const preview = document.createElement("div");
    preview.className = "avatar-preview";
    preview.innerHTML = getAvatarHTML(selectedAvatar, 80);
    card.appendChild(preview);
    const grid = document.createElement("div");
    grid.className = "avatar-grid";
    AVATARS.forEach(function (emoji) {
        const btn = document.createElement("button");
        btn.className = "avatar-option" + (emoji === selectedAvatar ? " selected" : "");
        btn.textContent = emoji;
        btn.onclick = function () {
            selectedAvatar = emoji;
            preview.innerHTML = getAvatarHTML(emoji, 80);
            Array.from(grid.children).forEach(b => {
                b.classList.toggle("selected", b.textContent === emoji);
            });
        };
        grid.appendChild(btn);
    });
    card.appendChild(grid);
    const continueBtn = document.createElement("button");
    continueBtn.className = "login-btn secondary";
    continueBtn.textContent = "انتخاب و ادامه";
    continueBtn.onclick = function () {
        Users.updateCurrent({ avatar: selectedAvatar });
        if (returnTo === "profile") showProfileScreen();
        else showHomeScreen();
    };
    card.appendChild(continueBtn);
    categoriesDiv.appendChild(card);
}

/* ============================================
   🌟 آواتارهای VIP
   ============================================ */

function showVipAvatarScreen() {
    User.hideTopBar();
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    playMusicMain();

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    const userCoins = typeof user.coins === "number" ? user.coins : 0;
    const ownedVips = Array.isArray(user.vipAvatars) ? user.vipAvatars : [];

    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← بازگشت به پروفایل";
    backBtn.onclick = showProfileScreen;
    categoriesDiv.appendChild(backBtn);

    const header = document.createElement("div");
    header.style.cssText =
        "position:relative;background:linear-gradient(135deg,#f59e0b,#fbbf24,#fde68a);" +
        "border-radius:24px;padding:24px 20px;text-align:center;color:#78350f;" +
        "box-shadow:0 10px 30px rgba(245,158,11,0.4);margin-bottom:18px;" +
        "border:3px solid #fcd34d;";
    header.innerHTML =
        '<div style="font-size:60px;margin-bottom:8px;">🌟</div>' +
        '<div style="font-size:22px;font-weight:900;">آواتارهای ویژه</div>' +
        '<div style="font-size:13px;margin-top:6px;font-weight:900;">' +
        '💰 موجودی شما: ' + toPersianNumber(userCoins) + ' سکه</div>';
    categoriesDiv.appendChild(header);

    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:14px;";

    VIP_AVATARS.forEach(function (vip) {
        const isOwned = ownedVips.indexOf(vip.id) !== -1;
        const isSelected = user.avatar === vip.id;
        const canAfford = userCoins >= vip.price;

        const card = document.createElement("div");
        card.style.cssText =
            "position:relative;padding:18px;background:white;" +
            "border:3px solid " + (isSelected ? "#8b5cf6" : (isOwned ? "#10b981" : "#fbbf24")) + ";" +
            "border-radius:20px;display:flex;align-items:center;gap:16px;" +
            "box-shadow:0 5px 0 " + (isSelected ? "#5b21b6" : (isOwned ? "#047857" : "#b45309")) + ";";

        const avatarBox = document.createElement("div");
        avatarBox.style.cssText =
            "width:80px;height:80px;border-radius:50%;overflow:hidden;" +
            "border:3px solid " + (isOwned ? "#10b981" : "#fbbf24") + ";" +
            "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
            "display:flex;align-items:center;justify-content:center;flex-shrink:0;";
        const img = document.createElement("img");
        img.src = vip.url;
        img.alt = vip.id;
        img.style.cssText = "width:100%;height:100%;object-fit:cover;";
        img.onerror = function () {
            avatarBox.innerHTML = '<span style="font-size:36px;">🌟</span>';
        };
        avatarBox.appendChild(img);
        card.appendChild(avatarBox);

        const info = document.createElement("div");
        info.style.cssText = "flex:1;";
        const nameEl = document.createElement("div");
        nameEl.textContent = "آواتار " + vip.category;
        nameEl.style.cssText = "font-size:16px;font-weight:900;color:#1e293b;margin-bottom:6px;";
        info.appendChild(nameEl);

        if (isOwned) {
            const status = document.createElement("div");
            status.textContent = "✅ خریداری شده";
            status.style.cssText = "font-size:12px;font-weight:900;color:#10b981;";
            info.appendChild(status);
        } else {
            const priceEl = document.createElement("div");
            priceEl.textContent = "🪙 " + toPersianNumber(vip.price) + " سکه";
            priceEl.style.cssText = "font-size:14px;font-weight:900;color:" + (canAfford ? "#d97706" : "#dc2626") + ";";
            info.appendChild(priceEl);
        }
        card.appendChild(info);

        const actionBtn = document.createElement("button");
        if (isSelected) {
            actionBtn.textContent = "✅ فعال";
            actionBtn.style.cssText =
                "padding:10px 18px;border-radius:14px;" +
                "background:linear-gradient(180deg,#10b981,#047857);" +
                "color:white;border:3px solid #34d399;" +
                "font-family:inherit;font-size:13px;font-weight:900;" +
                "cursor:default;box-shadow:0 4px 0 #065f46;";
            actionBtn.disabled = true;
        } else if (isOwned) {
            actionBtn.textContent = "🎨 انتخاب";
            actionBtn.style.cssText =
                "padding:10px 18px;border-radius:14px;" +
                "background:linear-gradient(180deg,#8b5cf6,#7c3aed);" +
                "color:white;border:3px solid #c4b5fd;" +
                "font-family:inherit;font-size:13px;font-weight:900;" +
                "cursor:pointer;box-shadow:0 4px 0 #5b21b6;";
            actionBtn.onclick = function () {
                Users.updateCurrent({ avatar: vip.id });
                showInfoModal({
                    emoji: "🎨", title: "آواتار انتخاب شد!",
                    message: "حالا آواتار ویژه‌ت فعاله",
                    color: "#8b5cf6", shadow: "#5b21b6",
                    onClose: showVipAvatarScreen
                });
            };
        } else {
            actionBtn.textContent = "🛒 خرید";
            actionBtn.style.cssText =
                "padding:10px 18px;border-radius:14px;" +
                "background:linear-gradient(180deg," +
                (canAfford ? "#f59e0b,#d97706" : "#94a3b8,#64748b") + ");" +
                "color:white;border:3px solid " + (canAfford ? "#fcd34d" : "#cbd5e1") + ";" +
                "font-family:inherit;font-size:13px;font-weight:900;" +
                "cursor:pointer;box-shadow:0 4px 0 " + (canAfford ? "#b45309" : "#334155") + ";";
            actionBtn.onclick = function () {
                const u = Users.loadCurrent();
                if (!u) return;
                if (u.coins < vip.price) {
                    showInfoModal({
                        emoji: "💰", title: "سکه کافی نداری!",
                        message: "برای خرید این آواتار به " + toPersianNumber(vip.price) + " سکه نیاز داری.\n" +
                            "موجودی فعلی: " + toPersianNumber(u.coins) + " سکه",
                        color: "#dc2626", shadow: "#7f1d1d"
                    });
                    return;
                }
                showConfirmModal({
                    emoji: "🌟", title: "خرید آواتار ویژه",
                    message: "قیمت: " + toPersianNumber(vip.price) + " سکه\n" +
                        "موجودی بعد از خرید: " + toPersianNumber(u.coins - vip.price) + " سکه",
                    color: "#f59e0b", shadow: "#b45309",
                    confirmText: "🛒 خرید", cancelText: "لغو",
                    onConfirm: async function () {
                        const paid = await Shop.addCoins(-vip.price, "vip_avatar_" + vip.id);
                        if (!paid) {
                            showInfoModal({ emoji: "⚠️", title: "خطا", message: "پرداخت انجام نشد", color: "#dc2626", shadow: "#7f1d1d" });
                            return;
                        }
                        const current = Users.loadCurrent();
                        const owned = Array.isArray(current.vipAvatars) ? current.vipAvatars.slice() : [];
                        if (owned.indexOf(vip.id) === -1) owned.push(vip.id);

                        const vipBackupKey = "vip_owned_" + current.phone;
                        const globalOwned = Storage.load(vipBackupKey, []);
                        if (globalOwned.indexOf(vip.id) === -1) {
                            globalOwned.push(vip.id);
                            Storage.save(vipBackupKey, globalOwned);
                        }

                        Users.updateCurrent({ vipAvatars: owned, avatar: vip.id });
                        showInfoModal({
                            emoji: "🌟", title: "آواتار ویژه گرفتی!",
                            message: "حالا آواتار ویژه‌ت فعاله",
                            color: "#f59e0b", shadow: "#b45309",
                            buttonText: "عالیه! 🎉",
                            onClose: showVipAvatarScreen
                        });
                    }
                });
            };
        }
        card.appendChild(actionBtn);
        list.appendChild(card);
    });

    categoriesDiv.appendChild(list);

    const tip = document.createElement("div");
    tip.style.cssText =
        "padding:14px 16px;margin-top:16px;border-radius:16px;" +
        "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
        "border:2px dashed #f59e0b;text-align:center;" +
        "font-size:12px;font-weight:900;color:#78350f;line-height:1.9;";
    tip.innerHTML = '🌟 آواتارهای ویژه یه‌بار خریداری می‌شن و <b>همیشه مال تو می‌مونن</b>';
    categoriesDiv.appendChild(tip);
}

/* ============================================
   🎮 رندر کارت حریف
   ============================================ */

function renderOpponentCard(opponent, options) {
    const opts = options || {};
    const size = opts.size || 60;
    const showLevel = opts.showLevel !== false;
    const showStatus = opts.showStatus || false;
    const statusText = opts.statusText || "";
    const statusColor = opts.statusColor || "#10b981";

    const card = document.createElement("div");
    card.style.cssText =
        "display:flex;flex-direction:column;align-items:center;gap:8px;" +
        "padding:14px 12px;background:white;border-radius:18px;" +
        "border:3px solid " + (opts.borderColor || "#3b82f6") + ";" +
        "box-shadow:0 5px 0 " + (opts.shadowColor || "#1e40af") + ";" +
        "min-width:120px;";

    const avatarWrapper = document.createElement("div");
    avatarWrapper.style.cssText = "position:relative;width:" + (size + 10) + "px;height:" + (size + 10) + "px;";

    const ring = document.createElement("div");
    ring.style.cssText =
        "position:absolute;inset:0;border-radius:50%;" +
        "border:3px solid " + (opts.borderColor || "#3b82f6") + ";" +
        "animation:pulse 2s ease infinite;";
    avatarWrapper.appendChild(ring);

    const avatar = document.createElement("div");
    avatar.style.cssText =
        "position:absolute;inset:5px;border-radius:50%;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "display:flex;align-items:center;justify-content:center;" +
        "font-size:" + Math.round(size * 0.6) + "px;overflow:hidden;";
    avatar.innerHTML = getAvatarHTML(opponent.avatar, size);
    avatarWrapper.appendChild(avatar);
    card.appendChild(avatarWrapper);

    const name = document.createElement("div");
    name.textContent = getDisplayName(opponent);
    name.style.cssText =
        "font-size:14px;font-weight:900;color:#1e293b;" +
        "text-align:center;max-width:130px;" +
        "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    card.appendChild(name);

    if (showLevel) {
        const level = document.createElement("div");
        level.textContent = "🏆 سطح " + toPersianNumber(opponent.level || 1);
        level.style.cssText = "font-size:11px;font-weight:900;color:#64748b;background:#f1f5f9;padding:3px 10px;border-radius:10px;";
        card.appendChild(level);
    }

    if (showStatus && statusText) {
        const status = document.createElement("div");
        status.textContent = statusText;
        status.style.cssText =
            "font-size:10px;font-weight:900;color:white;" +
            "background:" + statusColor + ";padding:3px 10px;border-radius:10px;margin-top:2px;";
        card.appendChild(status);
    }

    return card;
}

/* ============================================
   🌐 Online Match (random opponent - local bot)
   ============================================ */

function showOnlineMatchmaking() {
    User.hideBottomBar();
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    playMusicMain();

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    const box = document.createElement("div");
    box.style.cssText =
        "max-width:520px;margin:0 auto;padding:20px;" +
        "min-height:100vh;display:flex;flex-direction:column;" +
        "align-items:center;justify-content:center;gap:20px;";

    const selfCard = renderOpponentCard(user, {
        borderColor: "#10b981", shadowColor: "#047857",
        size: 70, showStatus: true, statusText: "✅ تو", statusColor: "#10b981"
    });
    box.appendChild(selfCard);

    const vs = document.createElement("div");
    vs.textContent = "⚔️";
    vs.style.cssText = "font-size:50px;animation:pulse 1.5s ease infinite;filter:drop-shadow(0 6px 15px rgba(0,0,0,0.25));";
    box.appendChild(vs);

    const opponentHolder = document.createElement("div");
    opponentHolder.id = "opponentHolder";
    opponentHolder.style.cssText =
        "display:flex;flex-direction:column;align-items:center;gap:8px;" +
        "padding:14px 12px;background:white;border-radius:18px;" +
        "border:3px dashed #cbd5e1;min-width:120px;";
    opponentHolder.innerHTML =
        '<div style="width:70px;height:70px;border-radius:50%;' +
        'background:linear-gradient(135deg,#e2e8f0,#cbd5e1);' +
        'display:flex;align-items:center;justify-content:center;' +
        'font-size:36px;animation:pulse 1s ease infinite;">🔍</div>' +
        '<div style="font-size:13px;font-weight:900;color:#94a3b8;">در حال پیدا کردن...</div>';
    box.appendChild(opponentHolder);

    const status = document.createElement("div");
    status.style.cssText =
        "font-size:14px;font-weight:900;color:#3b82f6;text-align:center;" +
        "padding:10px 18px;background:#dbeafe;border-radius:14px;" +
        "border:2px solid #3b82f6;";
    status.textContent = "⏳ لطفاً صبر کن...";
    box.appendChild(status);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌ انصراف";
    cancelBtn.style.cssText =
        "padding:12px 24px;border-radius:14px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-family:inherit;font-size:14px;font-weight:900;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    cancelBtn.onclick = function () {
        if (matchTimer) clearTimeout(matchTimer);
        showGameModeScreen();
    };
    box.appendChild(cancelBtn);

    categoriesDiv.appendChild(box);

    let matchTimer = setTimeout(function () {
        const opponent = generateMockOpponent();

        opponentHolder.innerHTML = "";
        opponentHolder.style.borderColor = "#dc2626";
        opponentHolder.style.borderStyle = "solid";
        opponentHolder.style.boxShadow = "0 5px 0 #7f1d1d";
        const oppCard = renderOpponentCard(opponent, {
            borderColor: "#dc2626", shadowColor: "#7f1d1d",
            size: 70, showStatus: true, statusText: "🎯 حریف", statusColor: "#dc2626"
        });
        opponentHolder.appendChild(oppCard);

        status.textContent = "✅ حریف پیدا شد!";
        status.style.background = "#d1fae5";
        status.style.color = "#047857";
        status.style.borderColor = "#10b981";

        setTimeout(function () {
            startOnlineMatch(opponent);
        }, 1000);
    }, 2500);
}

function generateMockOpponent() {
    const names = [
        "AliGamer", "SaraPro", "RezaKing", "Mina_Star",
        "HosseinX", "NargesWin", "AmirChamp", "ZahraGold",
        "MohammadP", "FatemeQueen", "ErfanHero", "YasnaPlay",
        "KianBoss", "AtenaFox", "SinaWolf", "HeliaLion"
    ];
    const levels = [3, 5, 7, 8, 10, 12, 15, 18, 20, 25];

    return {
        username: names[Math.floor(Math.random() * names.length)],
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        isBot: true
    };
}

function startOnlineMatch(opponent) {
    playMusicQuiz();

    const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    fetch("questions/" + randomCat.file)
        .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
        .then(q => {
            if (!Array.isArray(q) || q.length === 0) {
                showError("سوال‌ها آماده نیست");
                return;
            }
            if (!Subscription.isActive()) {
                Hearts.sync();
                if (Hearts.peek() <= 0) { showNoHeartsMessage(); return; }
                Hearts.use(1);
            }
            runOnlineQuiz(q, opponent, randomCat.title);
        })
        .catch(err => {
            console.error(err);
            showError("سوال‌ها آماده نیست");
        });
}

function runOnlineQuiz(questions, opponent, categoryTitle) {
    const picked = pickQuestionsByLevel(questions, "medium");
    const selectedQuestions = picked.map(shuffleQuestion);
    const totalQ = selectedQuestions.length;

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    let myScore = 0;
    let oppScore = 0;
    let current = 0;
    let finalized = false;
    let timer = null;
    let timeLeft = QUESTION_TIME;

    User.hideBottomBar();

    function stopTimer() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    function startTimer(onExpire) {
        stopTimer();
        timeLeft = QUESTION_TIME;
        updateTimerDisplay();
        timer = setInterval(function () {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                stopTimer();
                onExpire();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const el = document.getElementById("quizTimerDisplay");
        if (!el) return;
        el.textContent = "⏱ " + toPersianNumber(Math.max(0, timeLeft));
        el.style.color = timeLeft <= 5 ? "#dc2626" : "#1e40af";
        el.style.background = timeLeft <= 5 ? "#fee2e2" : "#dbeafe";
    }

    function buildScoreBar() {
        const bar = document.createElement("div");
        bar.style.cssText =
            "display:grid;grid-template-columns:1fr auto 1fr;gap:8px;" +
            "align-items:center;padding:8px;background:white;" +
            "border:2px solid #3b82f6;border-radius:14px;flex-shrink:0;";

        const meBox = document.createElement("div");
        meBox.style.cssText = "display:flex;align-items:center;gap:8px;";
        const meAvatar = document.createElement("div");
        meAvatar.style.cssText =
            "width:38px;height:38px;border-radius:50%;overflow:hidden;" +
            "border:2px solid #10b981;background:#dbeafe;" +
            "display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;";
        meAvatar.innerHTML = getAvatarHTML(user.avatar, 34);
        meBox.appendChild(meAvatar);
        const meInfo = document.createElement("div");
        meInfo.style.cssText = "flex:1;min-width:0;";
        meInfo.innerHTML =
            '<div style="font-size:11px;font-weight:900;color:#047857;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
            escapeHtml(getDisplayName(user)) + '</div>' +
            '<div style="font-size:13px;font-weight:900;color:#10b981;">' +
            '<span id="myScoreDisplay">۰</span></div>';
        meBox.appendChild(meInfo);
        bar.appendChild(meBox);

        const vs = document.createElement("div");
        vs.textContent = "⚔️";
        vs.style.cssText = "font-size:22px;";
        bar.appendChild(vs);

        const oppBox = document.createElement("div");
        oppBox.style.cssText = "display:flex;align-items:center;gap:8px;flex-direction:row-reverse;";
        const oppAvatar = document.createElement("div");
        oppAvatar.style.cssText =
            "width:38px;height:38px;border-radius:50%;overflow:hidden;" +
            "border:2px solid #dc2626;background:#fee2e2;" +
            "display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;";
        oppAvatar.innerHTML = getAvatarHTML(opponent.avatar, 34);
        oppBox.appendChild(oppAvatar);
        const oppInfo = document.createElement("div");
        oppInfo.style.cssText = "flex:1;min-width:0;text-align:left;";
        oppInfo.innerHTML =
            '<div style="font-size:11px;font-weight:900;color:#991b1b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
            escapeHtml(getDisplayName(opponent)) + '</div>' +
            '<div style="font-size:13px;font-weight:900;color:#dc2626;">' +
            '<span id="oppScoreDisplay">۰</span></div>';
        oppBox.appendChild(oppInfo);
        bar.appendChild(oppBox);

        return bar;
    }

    function updateScores() {
        const me = document.getElementById("myScoreDisplay");
        const opp = document.getElementById("oppScoreDisplay");
        if (me) me.textContent = toPersianNumber(myScore);
        if (opp) opp.textContent = toPersianNumber(oppScore);
    }

    function showQuestion() {
        categoriesDiv.innerHTML = "";
        categoriesDiv.style.cssText =
            "overflow:hidden;padding-top:14px;padding-bottom:14px;" +
            "display:flex;flex-direction:column;gap:10px;height:100vh;";

        const q = selectedQuestions[current];
        categoriesDiv.appendChild(buildScoreBar());

        const topRow = document.createElement("div");
        topRow.style.cssText =
            "display:flex;justify-content:space-between;align-items:center;" +
            "gap:6px;padding:6px 10px;background:white;" +
            "border:2px solid #3b82f6;border-radius:14px;flex-shrink:0;";

        const catBadge = document.createElement("span");
        catBadge.textContent = categoryTitle || "🎯";
        catBadge.style.cssText = "font-size:10px;font-weight:900;color:#3b82f6;background:#dbeafe;padding:3px 8px;border-radius:8px;";
        topRow.appendChild(catBadge);

        const timerEl = document.createElement("span");
        timerEl.id = "quizTimerDisplay";
        timerEl.style.cssText = "font-size:13px;font-weight:900;color:#1e40af;background:#dbeafe;padding:4px 10px;border-radius:10px;border:1.5px solid #3b82f6;";
        topRow.appendChild(timerEl);

        const progress = document.createElement("span");
        progress.textContent = toPersianNumber(current + 1) + "/" + toPersianNumber(totalQ);
        progress.style.cssText = "font-size:12px;font-weight:900;color:#64748b;";
        topRow.appendChild(progress);

        const exitBtn = document.createElement("button");
        exitBtn.className = "exit-btn";
        exitBtn.textContent = "خروج";
        exitBtn.onclick = function () {
            stopTimer();
            showOnlineResult("exit");
        };
        topRow.appendChild(exitBtn);

        categoriesDiv.appendChild(topRow);

        const questionCard = document.createElement("div");
        questionCard.style.cssText =
            "background:white;border:3px solid #3b82f6;border-radius:18px;" +
            "padding:16px 18px;flex-shrink:0;min-height:80px;" +
            "display:flex;align-items:center;justify-content:center;";

        const qText = document.createElement("p");
        qText.style.cssText = "font-size:17px;font-weight:900;color:#1e293b;line-height:1.6;margin:0;text-align:center;";
        qText.textContent = cleanQuestionText(q.question);
        questionCard.appendChild(qText);
        categoriesDiv.appendChild(questionCard);

        const answerButtons = [];
        q.answers.forEach(function (answerText, i) {
            const button = document.createElement("button");
            button.textContent = answerText;
            button.className = "category";
            button.style.cssText = "min-height:auto;padding:14px 18px;font-size:15px;font-weight:900;flex-shrink:0;";
            button.onclick = async function () {
                if (button.disabled) return;
                stopTimer();
                answerButtons.forEach(b => b.disabled = true);
                if (i === q.correct) {
                    myScore++;
                    button.classList.add("correct");
                    const levelResult = await User.addXP(XP_PER_CORRECT);
                    await User.addCoins(COINS_PER_CORRECT);
                    if (levelResult && levelResult.leveledUp) {
                        showLevelUpToast(levelResult.newLevel);
                    }
                } else {
                    button.classList.add("wrong");
                    if (answerButtons[q.correct]) answerButtons[q.correct].classList.add("correct");
                }
                updateScores();
                setTimeout(function () {
                    if (Math.random() < 0.7) oppScore++;
                    updateScores();
                }, 400);
                setTimeout(function () {
                    current++;
                    if (current < totalQ) showQuestion();
                    else showOnlineResult("complete");
                }, 1400);
            };
            answerButtons.push(button);
            categoriesDiv.appendChild(button);
        });

        startTimer(async function () {
            if (answerButtons.every(b => b.disabled)) return;
            answerButtons.forEach(b => b.disabled = true);
            if (answerButtons[q.correct]) answerButtons[q.correct].classList.add("correct");
            updateScores();
            setTimeout(function () {
                if (Math.random() < 0.7) oppScore++;
                updateScores();
            }, 400);
            setTimeout(function () {
                current++;
                if (current < totalQ) showQuestion();
                else showOnlineResult("complete");
            }, 1400);
        });
    }

    function showOnlineResult(reason) {
        if (finalized) return;
        finalized = true;
        stopTimer();
        playMusicMain();
        categoriesDiv.innerHTML = "";
        categoriesDiv.style.cssText = "overflow:auto;display:block;";

        const youWon = myScore > oppScore;
        const tie = myScore === oppScore;
        const isExit = reason === "exit";

        let rewardXP = 0, rewardCoins = 0;
        if (youWon && !isExit) {
            const u = Users.loadCurrent();
            if (u) {
                Users.updateCurrent({ onlineWins: (u.onlineWins || 0) + 1 });
            }
            rewardXP = 20;
            rewardCoins = 10;
            User.addXP(rewardXP);
            User.addCoins(rewardCoins);
        } else if (tie && !isExit) {
            rewardXP = 10;
            rewardCoins = 5;
            User.addXP(rewardXP);
            User.addCoins(rewardCoins);
        }

        const screen = document.createElement("div");
        screen.className = "online-result-screen";

        const card = document.createElement("div");
        let cardClass = "online-result-card ";
        if (isExit) cardClass += "online-result-exit";
        else if (youWon) cardClass += "online-result-win";
        else if (tie) cardClass += "online-result-tie";
        else cardClass += "online-result-lose";
        card.className = cardClass;

        let confettiHTML = "";
        if (youWon) confettiHTML = '<div class="online-confetti"></div>'.repeat(7);

        let emoji, title, subtitle;
        if (isExit) { emoji = "🚪"; title = "خروج از مسابقه"; subtitle = "نتیجه‌ای ثبت نشد"; }
        else if (youWon) { emoji = "🏆"; title = "بردی!"; subtitle = "آفرین قهرمان! 🎉"; }
        else if (tie) { emoji = "🤝"; title = "مساوی شد!"; subtitle = "نزدیک بود ببری!"; }
        else { emoji = "😢"; title = "باختی!"; subtitle = "دفعه بعد بهتر می‌شی!"; }

        let rewardsHTML = "";
        if (!isExit && (rewardXP > 0 || rewardCoins > 0)) {
            rewardsHTML = '<div class="online-rewards-box">';
            if (rewardXP > 0) {
                rewardsHTML += '<div class="online-reward-badge"><span class="online-reward-icon">⭐</span><span>+' + toPersianNumber(rewardXP) + '</span></div>';
            }
            if (rewardCoins > 0) {
                rewardsHTML += '<div class="online-reward-badge"><span class="online-reward-icon">🪙</span><span>+' + toPersianNumber(rewardCoins) + '</span></div>';
            }
            rewardsHTML += '</div>';
        }

        card.innerHTML =
            confettiHTML +
            '<div class="online-result-emoji">' + emoji + '</div>' +
            '<div class="online-result-title">' + title + '</div>' +
            '<div class="online-result-subtitle">' + subtitle + '</div>' +
            '<div class="online-battle-box">' +
                '<div class="online-player-card">' +
                    '<div class="online-player-avatar is-me">' + getAvatarHTML(user.avatar, 50) + '</div>' +
                    '<div class="online-player-name is-me">' + escapeHtml(getDisplayName(user)) + '</div>' +
                    '<div class="online-player-score ' + (youWon ? "winner" : "") + '">' + toPersianNumber(myScore) + '</div>' +
                '</div>' +
                '<div class="online-vs-symbol">⚔️</div>' +
                '<div class="online-player-card">' +
                    '<div class="online-player-avatar is-opponent">' + getAvatarHTML(opponent.avatar, 50) + '</div>' +
                    '<div class="online-player-name is-opponent">' + escapeHtml(getDisplayName(opponent)) + '</div>' +
                    '<div class="online-player-score ' + (!youWon && !tie ? "winner" : "") + '">' + toPersianNumber(oppScore) + '</div>' +
                '</div>' +
            '</div>' +
            rewardsHTML +
            '<div class="online-result-actions">' +
                '<button class="online-result-btn online-result-btn-again" id="onlineAgainBtn">' +
                    '<span class="online-result-btn-icon">🔄</span><span>مسابقه دوباره</span>' +
                '</button>' +
                '<button class="online-result-btn online-result-btn-home" id="onlineHomeBtn">' +
                    '<span class="online-result-btn-icon">🏠</span><span>بازگشت به خانه</span>' +
                '</button>' +
            '</div>';

        screen.appendChild(card);
        categoriesDiv.appendChild(screen);

        const againBtn = document.getElementById("onlineAgainBtn");
        const homeBtn = document.getElementById("onlineHomeBtn");
        if (againBtn) againBtn.onclick = showOnlineMatchmaking;
        if (homeBtn) homeBtn.onclick = showHomeScreen;

        User.updateTopBar();
    }

    showQuestion();
}

/* ============================================
   صفحه اصلی
   ============================================ */

function showHomeScreen() {
    // 🏆 پاک کردن لیگ
    if (typeof clearLeagueTimer === "function") clearLeagueTimer();
    if (typeof clearLeaguePoll === "function") clearLeaguePoll();

    resetCategoriesDiv();
    categoriesDiv.classList.add("no-scroll");
    User.showBottomBar();
    setActiveTab("home");
    playMusicMain();

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }
    User.updateTopBar();
    Hearts.updateDisplay();

    if (!isValidAvatar(user.avatar, user)) {
        const safeAvatar = AVATARS[0];
        Users.updateCurrent({ avatar: safeAvatar });
        user.avatar = safeAvatar;
    }

    const box = document.createElement("div");
    box.style.cssText =
        "max-width:520px;margin:0 auto;width:100%;height:100%;" +
        "display:flex;flex-direction:column;gap:12px;justify-content:center;";

    const card = document.createElement("div");
    card.className = "profile-card";
    card.style.flexShrink = "0";

    const name = document.createElement("div");
    name.className = "profile-name";
    name.textContent = getDisplayName(user);
    card.appendChild(name);

    const midRow = document.createElement("div");
    midRow.className = "profile-mid-row";

    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "profile-avatar-wrapper";
    const ring = document.createElement("div");
    ring.className = "profile-avatar-ring";
    avatarWrapper.appendChild(ring);
    const avatar = document.createElement("div");
    avatar.className = "profile-avatar";
    avatar.innerHTML = getAvatarHTML(user.avatar, 60);
    avatarWrapper.appendChild(avatar);
    midRow.appendChild(avatarWrapper);

    const statsGrid = document.createElement("div");
    statsGrid.className = "profile-stats-grid";

    const levelBox = document.createElement("div");
    levelBox.className = "stat-box stat-level";
    levelBox.innerHTML =
        '<span class="stat-icon">🏆</span>' +
        '<span class="stat-value">' + toPersianNumber(user.level || 1) + '</span>' +
        '<span class="stat-label">سطح</span>';
    statsGrid.appendChild(levelBox);

    const xpInLevel = (user.xp || 0) - ((user.level || 1) - 1) * XP_PER_LEVEL;
    const xpBox = document.createElement("div");
    xpBox.className = "stat-box stat-xp";
    xpBox.innerHTML =
        '<span class="stat-icon">⭐</span>' +
        '<span class="stat-value">' + toPersianNumber(Math.max(0, xpInLevel)) + '</span>' +
        '<span class="stat-label">امتیاز</span>';
    statsGrid.appendChild(xpBox);
    midRow.appendChild(statsGrid);
    card.appendChild(midRow);
    box.appendChild(card);

    if (Hearts.hasDailyReward()) {
        const dailyBtn = document.createElement("button");
        dailyBtn.style.cssText =
            "width:100%;padding:16px 20px;margin-top:4px;" +
            "display:flex;align-items:center;justify-content:center;gap:12px;" +
            "background:linear-gradient(135deg,#ec4899,#db2777,#be185d);" +
            "border:3px solid #f9a8d4;border-radius:18px;color:white;" +
            "font-family:inherit;font-size:15px;font-weight:900;cursor:pointer;" +
            "box-shadow:0 5px 0 #831843,0 8px 20px rgba(236,72,153,0.4);" +
            "animation:pulse 1.5s ease infinite;";
        dailyBtn.innerHTML =
            '<span style="font-size:28px;">🎁</span>' +
            '<span>دریافت ' + toPersianNumber(DAILY_HEARTS_REWARD) + ' قلب رایگان!</span>';
        dailyBtn.onclick = function () {
            const r = Hearts.claimDailyHearts();
            if (r.ok) {
                showInfoModal({
                    emoji: "🎁", title: "قلب‌های رایگان گرفتی!",
                    message: "+" + toPersianNumber(r.amount) + " ❤️ به قلبهات اضافه شد",
                    color: "#ec4899", shadow: "#831843",
                    buttonText: "عالیه! 💖",
                    onClose: showHomeScreen
                });
            } else {
                showInfoModal({
                    emoji: "⏳", title: "صبر کن!",
                    message: r.error,
                    color: "#f59e0b", shadow: "#b45309",
                    buttonText: "باشه"
                });
            }
        };
        box.appendChild(dailyBtn);
    }

    if (Subscription.isActive()) {
        const sub = SUBSCRIPTIONS[Subscription.activeType()];
        if (sub) {
            const badge = document.createElement("div");
            badge.style.cssText =
                "display:flex;align-items:center;justify-content:center;gap:10px;" +
                "padding:14px 18px;margin-top:4px;" +
                "background:linear-gradient(135deg," + sub.color + "," + sub.shadow + ");" +
                "border:3px solid rgba(255,255,255,0.4);border-radius:18px;color:white;" +
                "box-shadow:0 5px 0 " + sub.shadow + ";";
            badge.innerHTML =
                '<span style="font-size:28px;">' + sub.emoji + '</span>' +
                '<div style="text-align:right;">' +
                '<div style="font-size:14px;font-weight:900;">' + sub.title + ' فعال</div>' +
                '<div style="font-size:11px;font-weight:700;opacity:0.95;margin-top:2px;">' +
                '⏰ ' + Subscription.formatRemaining() + ' باقی مانده</div></div>';
            box.appendChild(badge);
        }
    }

    const tip = document.createElement("div");
    tip.style.cssText =
        "padding:14px 16px;margin-top:8px;border-radius:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:2px dashed #3b82f6;text-align:center;" +
        "font-size:12px;font-weight:800;color:#1e40af;line-height:1.9;";
    tip.innerHTML = '💡 برای خرید اشتراک ویژه و دیدن راهنما به تب <b style="color:#7c3aed;">👤 پروفایل</b> سر بزن';
    box.appendChild(tip);
    categoriesDiv.appendChild(box);
}

/* ============================================
   🎯 حالت بازی
   ============================================ */

function showGameModeScreen() {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("play");
    playMusicMain();
    const user = Users.loadCurrent();
    if (user) User.updateTopBar();

    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← بازگشت";
    backBtn.onclick = showHomeScreen;
    categoriesDiv.appendChild(backBtn);

    const modeTitle = document.createElement("h3");
    modeTitle.textContent = "🎯 حالت بازی رو انتخاب کن";
    modeTitle.style.cssText = "margin:8px 0 14px;font-size:15px;font-weight:900;color:#1e40af;text-align:center;";
    categoriesDiv.appendChild(modeTitle);

    const modeRow = document.createElement("div");
    modeRow.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;";

    const randomBtn = document.createElement("button");
    randomBtn.style.cssText =
        "position:relative;min-height:180px;padding:0;border-radius:24px;" +
        "border:none;background:transparent;cursor:pointer;overflow:hidden;font-family:inherit;";
    const randomBg = document.createElement("div");
    randomBg.style.cssText =
        "position:absolute;inset:0;border-radius:24px;" +
        "background:linear-gradient(135deg,#1e40af 0%,#3b82f6 40%,#06b6d4 100%);" +
        "background-size:200% 200%;animation:onlineGradientMove 4s ease infinite;";
    randomBtn.appendChild(randomBg);
    const randomContent = document.createElement("div");
    randomContent.style.cssText =
        "position:relative;z-index:3;display:flex;flex-direction:column;" +
        "align-items:center;justify-content:center;gap:8px;" +
        "padding:20px 12px;text-align:center;height:100%;min-height:180px;";
    randomContent.innerHTML =
        '<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.15));border:3px solid rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;font-size:38px;">🎲</div>' +
        '<div style="font-size:15px;font-weight:900;color:white;text-shadow:0 2px 5px rgba(0,0,0,0.4);">حریف تصادفی</div>' +
        '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.95);">بازی آنلاین با یه نفر</div>';
    randomBtn.appendChild(randomContent);
    randomBtn.onclick = function () {
        if (!user) return;
        if ((user.level || 1) < ONLINE_UNLOCK_LEVEL) {
            const needed = ONLINE_UNLOCK_LEVEL - (user.level || 1);
            showInfoModal({
                emoji: "🔒", title: "بازی آنلاین هنوز باز نشده!",
                message: "برای باز شدن بازی آنلاین، به سطح " + toPersianNumber(ONLINE_UNLOCK_LEVEL) + " نیاز داری.\n" +
                    "سطح فعلی تو: " + toPersianNumber(user.level || 1) + "\n\n" +
                    "فقط " + toPersianNumber(needed) + " سطح دیگه مونده! 💪",
                color: "#f59e0b", shadow: "#b45309",
                buttonText: "باشه، تلاش می‌کنم 💪",
                showProgress: true, currentLevel: user.level || 1
            });
            return;
        }
        showOnlineMatchmaking();
    };
    modeRow.appendChild(randomBtn);

    const rankedBtn = document.createElement("button");
    rankedBtn.style.cssText =
        "position:relative;min-height:180px;padding:0;border-radius:24px;" +
        "border:none;background:transparent;cursor:pointer;overflow:hidden;font-family:inherit;";
    const rankedBg = document.createElement("div");
    rankedBg.style.cssText =
        "position:absolute;inset:0;border-radius:24px;" +
        "background:linear-gradient(135deg,#d97706 0%,#f59e0b 40%,#fbbf24 100%);" +
        "background-size:200% 200%;animation:onlineGradientMove 4s ease infinite;";
    rankedBtn.appendChild(rankedBg);
    const rankedContent = document.createElement("div");
    rankedContent.style.cssText =
        "position:relative;z-index:3;display:flex;flex-direction:column;" +
        "align-items:center;justify-content:center;gap:8px;" +
        "padding:20px 12px;text-align:center;height:100%;min-height:180px;";
    rankedContent.innerHTML =
        '<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0.15));border:3px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;font-size:38px;">🏆</div>' +
        '<div style="font-size:15px;font-weight:900;color:white;text-shadow:0 2px 5px rgba(0,0,0,0.4);">بازی امتیازی</div>' +
        '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.95);">بازی آفلاین معمولی</div>';
    rankedBtn.appendChild(rankedContent);
    rankedBtn.onclick = function () { showDifficultySelection(); };
    modeRow.appendChild(rankedBtn);
    categoriesDiv.appendChild(modeRow);
}

function showCategories() { showGameModeScreen(); }

/* ============================================
   🎚️ سطح دشواری
   ============================================ */

function showDifficultySelection() {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("play");
    playMusicMain();
    const user = Users.loadCurrent();
    if (user) User.updateTopBar();

    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← بازگشت به حالت‌ها";
    backBtn.onclick = showGameModeScreen;
    categoriesDiv.appendChild(backBtn);

    const title = document.createElement("h3");
    title.textContent = "🎚️ سطح دشواری رو انتخاب کن";
    title.style.cssText = "margin:10px 0 6px;font-size:16px;font-weight:900;color:#1e40af;text-align:center;";
    categoriesDiv.appendChild(title);

    const sub = document.createElement("p");
    sub.textContent = "سوالات بر اساس ترکیب انتخاب می‌شن";
    sub.style.cssText = "text-align:center;font-size:12px;color:#64748b;font-weight:700;margin-bottom:18px;";
    categoriesDiv.appendChild(sub);

    const levels = [
        { id: "easy", emoji: "🟢", title: "آسان", desc: "شروع مناسب برای تازه‌کارا", mix: "۷۰٪ آسان + ۳۰٪ متوسط",
          gradient: "linear-gradient(135deg,#16a34a,#22c55e,#4ade80)", borderColor: "#4ade80", shadowColor: "#14532d" },
        { id: "medium", emoji: "🟡", title: "متوسط", desc: "تعادل بین آسان و سخت", mix: "۲۰٪ آسان + ۵۰٪ متوسط + ۳۰٪ سخت",
          gradient: "linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)", borderColor: "#fcd34d", shadowColor: "#78350f" },
        { id: "hard", emoji: "🔴", title: "سخت", desc: "برای حرفه‌ای‌ها و استادان", mix: "۳۰٪ متوسط + ۷۰٪ سخت",
          gradient: "linear-gradient(135deg,#b91c1c,#ef4444,#f87171)", borderColor: "#fca5a5", shadowColor: "#7f1d1d" },
        { id: "random", emoji: "🎲", title: "تصادفی", desc: "ترکیب همه سطوح", mix: "۳۳٪ آسان + ۳۴٪ متوسط + ۳۳٪ سخت",
          gradient: "linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)", borderColor: "#c4b5fd", shadowColor: "#4c1d95" }
    ];

    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:12px;";

    levels.forEach(function (lv) {
        const btn = document.createElement("button");
        btn.style.cssText =
            "position:relative;width:100%;padding:18px 16px;" +
            "background:" + lv.gradient + ";" +
            "border:3px solid " + lv.borderColor + ";" +
            "border-radius:20px;cursor:pointer;overflow:hidden;" +
            "font-family:inherit;text-align:right;" +
            "box-shadow:0 5px 0 " + lv.shadowColor + ";display:flex;align-items:center;gap:14px;";
        const icon = document.createElement("div");
        icon.style.cssText = "font-size:44px;line-height:1;flex-shrink:0;";
        icon.textContent = lv.emoji;
        btn.appendChild(icon);
        const info = document.createElement("div");
        info.style.cssText = "flex:1;";
        const t = document.createElement("div");
        t.textContent = lv.title;
        t.style.cssText = "font-size:18px;font-weight:900;color:white;text-shadow:0 2px 4px rgba(0,0,0,0.4);margin-bottom:4px;";
        info.appendChild(t);
        const d = document.createElement("div");
        d.textContent = lv.desc;
        d.style.cssText = "font-size:11px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:4px;";
        info.appendChild(d);
        const m = document.createElement("div");
        m.textContent = "📊 " + lv.mix;
        m.style.cssText = "font-size:10px;font-weight:900;color:white;background:rgba(0,0,0,0.2);padding:3px 8px;border-radius:10px;display:inline-block;";
        info.appendChild(m);
        btn.appendChild(info);
        btn.onclick = function () { showCategorySelection(lv.id); };
        list.appendChild(btn);
    });
    categoriesDiv.appendChild(list);
}

/* ============================================
   📚 انتخاب دسته‌بندی
   ============================================ */

function showCategorySelection(difficulty) {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("play");
    playMusicMain();
    const user = Users.loadCurrent();
    if (user) User.updateTopBar();
    if (difficulty) Storage.save("current_difficulty", difficulty);

    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← بازگشت به سطوح";
    backBtn.onclick = showDifficultySelection;
    categoriesDiv.appendChild(backBtn);

    if (difficulty) {
        const levelInfo = {
            easy: { emoji: "🟢", name: "آسان", color: "#16a34a" },
            medium: { emoji: "🟡", name: "متوسط", color: "#d97706" },
            hard: { emoji: "🔴", name: "سخت", color: "#dc2626" },
            random: { emoji: "🎲", name: "تصادفی", color: "#7c3aed" }
        }[difficulty];
        if (levelInfo) {
            const badge = document.createElement("div");
            badge.style.cssText =
                "display:flex;align-items:center;justify-content:center;gap:8px;" +
                "padding:10px 16px;margin-bottom:14px;background:white;" +
                "border:2px solid " + levelInfo.color + ";" +
                "border-radius:14px;font-size:13px;font-weight:900;color:" + levelInfo.color + ";";
            badge.innerHTML = '<span style="font-size:18px;">' + levelInfo.emoji + '</span><span>سطح: ' + levelInfo.name + '</span>';
            categoriesDiv.appendChild(badge);
        }
    }

    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = "📚 یک دسته‌بندی انتخاب کن";
    sectionTitle.style.cssText = "margin:10px 0 14px;font-size:16px;font-weight:900;color:#1e40af;text-align:center;";
    categoriesDiv.appendChild(sectionTitle);

    const heartsInfo = document.createElement("div");
    heartsInfo.style.cssText = "padding:10px 16px;margin-bottom:14px;border-radius:12px;text-align:center;font-size:12px;font-weight:900;";

    if (Subscription.isActive()) {
        heartsInfo.innerHTML = "🎫 اشتراک فعال — قلب مصرف نمی‌شه";
        heartsInfo.style.background = "linear-gradient(135deg,#d1fae5,#a7f3d0)";
        heartsInfo.style.border = "2px solid #10b981";
        heartsInfo.style.color = "#047857";
    } else {
        heartsInfo.innerHTML = "❤️ هر بازی فقط ۱ قلب | غلط‌ها رایگان";
        heartsInfo.style.background = "linear-gradient(135deg,#fee2e2,#fecaca)";
        heartsInfo.style.border = "2px solid #f87171";
        heartsInfo.style.color = "#991b1b";
    }
    categoriesDiv.appendChild(heartsInfo);

    const grid = document.createElement("div");
    grid.className = "category-grid";
    CATEGORIES.forEach(function (cat) {
        const button = document.createElement("button");
        button.textContent = cat.title;
        button.className = "category";
        button.onclick = function () {
            startQuiz(cat.file, cat.title, difficulty);
        };
        grid.appendChild(button);
    });
    categoriesDiv.appendChild(grid);
}

/* ============================================
   کوییز آفلاین
   ============================================ */

function startQuiz(fileName, title, difficulty) {
    playMusicQuiz();
    const diff = difficulty || Storage.load("current_difficulty", "medium");

    fetch("questions/" + fileName)
        .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
        .then(q => {
            if (!Array.isArray(q) || q.length === 0) {
                showError("سوال‌ها آماده نیست");
                return;
            }
            if (!Subscription.isActive()) {
                Hearts.sync();
                if (Hearts.peek() <= 0) { showNoHeartsMessage(); return; }
                Hearts.use(1);
            }
            runQuiz(q, title, diff);
        })
        .catch(err => {
            console.error(err);
            showError("سوال‌ها آماده نیست");
        });
}

function showNoHeartsMessage() {
    resetCategoriesDiv();
    playMusicMain();
    const card = document.createElement("div");
    card.className = "section-intro-card";
    card.innerHTML =
        '<div class="section-emoji">💔</div>' +
        '<div class="section-title">قلب نداری!</div>' +
        '<div class="section-subtitle">قلب بعدی در ' + toPersianNumber(HEART_REGEN_MINUTES) + ' دقیقه</div>';
    categoriesDiv.appendChild(card);

    if (Hearts.hasDailyReward()) {
        const dailyBtn = document.createElement("button");
        dailyBtn.className = "category next";
        dailyBtn.style.marginTop = "20px";
        dailyBtn.style.background = "linear-gradient(180deg,#ec4899,#db2777)";
        dailyBtn.textContent = "🎁 دریافت " + toPersianNumber(DAILY_HEARTS_REWARD) + " قلب رایگان";
        dailyBtn.onclick = function () {
            const r = Hearts.claimDailyHearts();
            if (r.ok) {
                showInfoModal({
                    emoji: "🎁", title: "قلب‌های رایگان گرفتی!",
                    message: "+" + toPersianNumber(r.amount) + " ❤️ به قلبهات اضافه شد",
                    color: "#ec4899", shadow: "#831843",
                    onClose: showHomeScreen
                });
            } else {
                showInfoModal({ emoji: "⏳", title: "صبر کن!", message: r.error, color: "#f59e0b", shadow: "#b45309" });
            }
        };
        categoriesDiv.appendChild(dailyBtn);
    }

    const buyBtn = document.createElement("button");
    buyBtn.className = "category next";
    buyBtn.style.marginTop = "10px";
    buyBtn.textContent = "💰 خرید ۱ قلب (" + toPersianNumber(HEART_BUY_COST) + " سکه)";
    buyBtn.onclick = async function () {
        const r = await Hearts.buy();
        if (r.ok) {
            showInfoModal({ emoji: "❤️", title: "قلب گرفتی!", message: "حالا می‌تونی بازی کنی.", color: "#ef4444", shadow: "#7f1d1d", onClose: showHomeScreen });
        } else {
            showInfoModal({ emoji: "⚠️", title: "نشد!", message: r.error, color: "#f59e0b", shadow: "#b45309" });
        }
    };
    categoriesDiv.appendChild(buyBtn);

    const subBtn = document.createElement("button");
    subBtn.className = "category next";
    subBtn.style.marginTop = "10px";
    subBtn.textContent = "🎫 خرید اشتراک نامحدود";
    subBtn.onclick = showSubscriptionScreen;
    categoriesDiv.appendChild(subBtn);

    const backBtn = document.createElement("button");
    backBtn.className = "category next";
    backBtn.style.marginTop = "10px";
    backBtn.textContent = "🔙 بازگشت";
    backBtn.onclick = showHomeScreen;
    categoriesDiv.appendChild(backBtn);
}

function runQuiz(questions, title, difficulty) {
    const picked = pickQuestionsByLevel(questions, difficulty || "medium");
    const selectedQuestions = picked.map(shuffleQuestion);
    const totalQ = selectedQuestions.length;

    let score = 0, wrongCount = 0, current = 0;
    let totalXP = 0, totalCoins = 0, finalized = false;
    let timer = null;
    let timeLeft = QUESTION_TIME;

    User.hideBottomBar();

    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    function startTimer(onExpire) {
        stopTimer();
        timeLeft = QUESTION_TIME;
        updateTimerDisplay();
        timer = setInterval(function () {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) { stopTimer(); onExpire(); }
        }, 1000);
    }

    function updateTimerDisplay() {
        const el = document.getElementById("quizTimerDisplay");
        if (!el) return;
        el.textContent = "⏱ " + toPersianNumber(Math.max(0, timeLeft));
        el.style.color = timeLeft <= 5 ? "#dc2626" : "#1e40af";
        el.style.background = timeLeft <= 5 ? "#fee2e2" : "#dbeafe";
        el.style.borderColor = timeLeft <= 5 ? "#dc2626" : "#3b82f6";
    }

    function showQuestion() {
        categoriesDiv.innerHTML = "";
        categoriesDiv.style.cssText =
            "overflow:hidden;padding-top:72px;padding-bottom:14px;" +
            "display:flex;flex-direction:column;gap:10px;height:100vh;";

        const q = selectedQuestions[current];

        const topRow = document.createElement("div");
        topRow.className = "quiz-header";
        topRow.style.cssText =
            "display:flex;justify-content:space-between;align-items:center;" +
            "gap:6px;padding:8px 10px;background:white;" +
            "border:2px solid #3b82f6;border-radius:14px;flex-shrink:0;";

        const heartsEl = document.createElement("span");
        if (Subscription.isActive()) {
            heartsEl.textContent = "🎫 نامحدود";
            heartsEl.style.cssText = "font-size:12px;font-weight:900;color:#10b981;background:#d1fae5;padding:4px 10px;border-radius:10px;border:1.5px solid #10b981;";
        } else {
            const hearts = Hearts.peek();
            heartsEl.textContent = "❤️".repeat(Math.max(0, hearts)) + "🖤".repeat(Math.max(0, HEART_MAX - hearts));
            heartsEl.style.fontSize = "10px";
        }
        topRow.appendChild(heartsEl);

        const timerEl = document.createElement("span");
        timerEl.id = "quizTimerDisplay";
        timerEl.style.cssText = "font-size:13px;font-weight:900;color:#1e40af;background:#dbeafe;padding:4px 10px;border-radius:10px;border:1.5px solid #3b82f6;";
        topRow.appendChild(timerEl);

        const progress = document.createElement("span");
        progress.textContent = toPersianNumber(current + 1) + "/" + toPersianNumber(totalQ);
        progress.style.cssText = "font-size:12px;font-weight:900;color:#64748b;";
        topRow.appendChild(progress);

        const exitBtn = document.createElement("button");
        exitBtn.className = "exit-btn";
        exitBtn.textContent = "خروج";
        exitBtn.onclick = async function () {
            stopTimer();
            await showResult("exit");
        };
        topRow.appendChild(exitBtn);
        categoriesDiv.appendChild(topRow);

        const questionCard = document.createElement("div");
        questionCard.style.cssText =
            "background:white;border:3px solid #3b82f6;border-radius:18px;" +
            "padding:16px 18px;flex-shrink:0;min-height:80px;" +
            "display:flex;align-items:center;justify-content:center;";
        const qText = document.createElement("p");
        qText.style.cssText = "font-size:17px;font-weight:900;color:#1e293b;line-height:1.6;margin:0;text-align:center;";
        qText.textContent = cleanQuestionText(q.question);
        questionCard.appendChild(qText);
        categoriesDiv.appendChild(questionCard);

        const answerButtons = [];
        q.answers.forEach(function (answerText, i) {
            const button = document.createElement("button");
            button.textContent = answerText;
            button.className = "category";
            button.style.cssText = "min-height:auto;padding:14px 18px;font-size:15px;font-weight:900;flex-shrink:0;";
            button.onclick = async function () {
                if (button.disabled) return;
                stopTimer();
                answerButtons.forEach(b => b.disabled = true);
                if (i === q.correct) {
                    score++;
                    button.classList.add("correct");
                    const levelResult = await User.addXP(XP_PER_CORRECT);
                    await User.addCoins(COINS_PER_CORRECT);
                    totalXP += XP_PER_CORRECT;
                    totalCoins += COINS_PER_CORRECT;
                    if (levelResult && levelResult.leveledUp) showLevelUpToast(levelResult.newLevel);
                } else {
                    wrongCount++;
                    button.classList.add("wrong");
                    if (answerButtons[q.correct]) answerButtons[q.correct].classList.add("correct");
                }
                setTimeout(function () {
                    current++;
                    if (current < totalQ) showQuestion();
                    else showResult("complete");
                }, 1200);
            };
            answerButtons.push(button);
            categoriesDiv.appendChild(button);
        });

        startTimer(async function () {
            if (answerButtons.every(b => b.disabled)) return;
            answerButtons.forEach(b => b.disabled = true);
            wrongCount++;
            if (answerButtons[q.correct]) answerButtons[q.correct].classList.add("correct");
            setTimeout(function () {
                current++;
                if (current < totalQ) showQuestion();
                else showResult("complete");
            }, 1200);
        });
    }

    async function showResult(reason) {
        if (finalized) return;
        finalized = true;
        stopTimer();
        User.hideBottomBar();
        playMusicMain();
        categoriesDiv.style.cssText = "overflow:auto;display:block;";
        categoriesDiv.innerHTML = "";

        let bonusXP = 0, bonusCoins = 0;
        if (reason === "complete" && score === totalQ) {
            bonusXP += 50; bonusCoins += COINS_PERFECT_BONUS;
            if (wrongCount === 0) { bonusXP += 100; bonusCoins += COINS_MASTER_BONUS; }
        }

        if (bonusXP > 0) {
            await User.addXP(bonusXP);
            await User.addCoins(bonusCoins);
            totalXP += bonusXP;
            totalCoins += bonusCoins;
        }

        const currentUser = Users.loadCurrent();
        if (currentUser) {
            const categoryStats = currentUser.categoryStats || {};
            const catObj = CATEGORIES.find(c => c.title === title);
            const catKey = catObj ? catObj.file : "unknown";
            if (!categoryStats[catKey]) categoryStats[catKey] = { correct: 0, total: 0 };
            categoryStats[catKey].correct += score;
            categoryStats[catKey].total += totalQ;
            Users.updateCurrent({
                gamesPlayed: (currentUser.gamesPlayed || 0) + 1,
                correctAnswers: (currentUser.correctAnswers || 0) + score,
                wrongAnswers: (currentUser.wrongAnswers || 0) + wrongCount,
                bestScore: Math.max(currentUser.bestScore || 0, score),
                categoryStats: categoryStats
            });
        }

        let titleText = "", emoji = "";
        if (reason === "exit") { emoji = "🚪"; titleText = "خارج شدید"; }
        else { emoji = "🏆"; titleText = "تمام شد"; }

        const card = document.createElement("div");
        card.className = "result-card";

        const emojiEl = document.createElement("div");
        emojiEl.className = "result-emoji";
        emojiEl.textContent = emoji;
        card.appendChild(emojiEl);

        const titleEl = document.createElement("div");
        titleEl.className = "result-title";
        titleEl.textContent = titleText;
        card.appendChild(titleEl);

        const scoreEl = document.createElement("div");
        scoreEl.className = "result-score";
        scoreEl.textContent = "درست: " + toPersianNumber(score) + " از " + toPersianNumber(totalQ);
        card.appendChild(scoreEl);

        const currentUserAfter = Users.loadCurrent();
        const currentTotalXP = currentUserAfter ? (currentUserAfter.xp || 0) : 0;

        const xpEl = document.createElement("div");
        xpEl.className = "result-xp";
        xpEl.innerHTML =
            '<div style="font-size:16px;font-weight:900;color:#8b5cf6;">⭐ امتیاز این بازی: <b>' + toPersianNumber(totalXP) + '</b></div>' +
            '<div style="font-size:14px;color:#64748b;margin-top:6px;">📊 امتیاز کل: <b>' + toPersianNumber(currentTotalXP) + '</b></div>' +
            '<div style="font-size:14px;color:#d97706;margin-top:6px;">🪙 سکه این بازی: <b>' + toPersianNumber(totalCoins) + '</b></div>';
        card.appendChild(xpEl);
        categoriesDiv.appendChild(card);

        const buttonRow = document.createElement("div");
        buttonRow.style.marginTop = "16px";

        const retryBtn = document.createElement("button");
        retryBtn.textContent = "تلاش دوباره";
        retryBtn.className = "category next";
        retryBtn.style.marginBottom = "8px";
        retryBtn.onclick = function () {
            if (!Subscription.isActive()) {
                Hearts.sync();
                if (Hearts.peek() <= 0) { showNoHeartsMessage(); return; }
                Hearts.use(1);
            }
            playMusicQuiz();
            runQuiz(questions, title, difficulty);
        };
        buttonRow.appendChild(retryBtn);

        const back = document.createElement("button");
        back.textContent = "بازگشت به دسته‌ها";
        back.className = "category next";
        back.onclick = function () { showCategorySelection(difficulty); };
        buttonRow.appendChild(back);
        categoriesDiv.appendChild(buttonRow);
    }

    showQuestion();
}

/* ============================================
   🎫 صفحه اشتراک
   ============================================ */

function showSubscriptionScreen() {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("profile");
    playMusicMain();
    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }
    User.updateTopBar();

    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← بازگشت به پروفایل";
    backBtn.onclick = showProfileScreen;
    categoriesDiv.appendChild(backBtn);

    const header = document.createElement("div");
    header.style.cssText =
        "position:relative;background:linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa);" +
        "border-radius:24px;padding:24px 20px;text-align:center;color:white;" +
        "box-shadow:0 10px 30px rgba(124,58,237,0.4);margin-bottom:20px;";
    header.innerHTML =
        '<div style="font-size:60px;margin-bottom:8px;">🎫</div>' +
        '<div style="font-size:22px;font-weight:900;">اشتراک‌ها</div>' +
        '<div style="font-size:13px;opacity:0.95;margin-top:6px;font-weight:700;">بدون محدودیت بازی کن، بدون مصرف قلب</div>';
    categoriesDiv.appendChild(header);

    if (Subscription.isActive()) {
        const activeSub = SUBSCRIPTIONS[Subscription.activeType()];
        if (activeSub) {
            const activeBox = document.createElement("div");
            activeBox.style.cssText =
                "padding:16px;border-radius:16px;margin-bottom:16px;" +
                "background:linear-gradient(135deg,#d1fae5,#a7f3d0);" +
                "border:3px solid #10b981;text-align:center;box-shadow:0 4px 0 #047857;";
            activeBox.innerHTML =
                '<div style="font-size:13px;font-weight:900;color:#047857;margin-bottom:6px;">✅ ' + activeSub.title + ' فعلاً فعاله</div>' +
                '<div style="font-size:18px;font-weight:900;color:#065f46;">⏰ ' + Subscription.formatRemaining() + ' مونده</div>';
            categoriesDiv.appendChild(activeBox);
        }
    }

    ["daily", "weekly", "monthly"].forEach(function (subId) {
        const sub = SUBSCRIPTIONS[subId];
        const card = document.createElement("div");
        card.style.cssText =
            "position:relative;padding:20px 18px;margin-bottom:14px;" +
            "background:linear-gradient(135deg," + sub.color + "," + sub.shadow + ");" +
            "border:3px solid rgba(255,255,255,0.35);" +
            "border-radius:22px;color:white;box-shadow:0 6px 0 " + sub.shadow + ";";
        if (sub.badge) {
            const badge = document.createElement("div");
            badge.textContent = sub.badge;
            badge.style.cssText = "position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.95);color:" + sub.shadow + ";font-size:10px;font-weight:900;padding:4px 10px;border-radius:10px;";
            card.appendChild(badge);
        }
        const content = document.createElement("div");
        content.innerHTML =
            '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">' +
            '<div style="font-size:48px;line-height:1;">' + sub.emoji + '</div>' +
            '<div style="flex:1;">' +
            '<div style="font-size:18px;font-weight:900;">' + sub.title + '</div>' +
            '<div style="font-size:12px;opacity:0.95;margin-top:4px;font-weight:700;">' + sub.desc + '</div></div></div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px dashed rgba(255,255,255,0.4);">' +
            '<div style="font-size:22px;font-weight:900;">🪙 ' + toPersianNumber(sub.price) + '</div>' +
            '<button class="sub-buy-btn" data-sub-id="' + sub.id + '" style="padding:10px 20px;border-radius:14px;background:white;color:' + sub.shadow + ';border:2px solid rgba(0,0,0,0.1);font-family:inherit;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,0.2);">🛒 خرید</button></div>';
        card.appendChild(content);
        categoriesDiv.appendChild(card);
    });

    categoriesDiv.querySelectorAll(".sub-buy-btn").forEach(function (btn) {
        btn.onclick = function () {
            const subId = btn.dataset.subId;
            const sub = SUBSCRIPTIONS[subId];
            const u = Users.loadCurrent();
            if (!u) return;
            if (u.coins < sub.price) {
                showInfoModal({ emoji: "💰", title: "سکه کافی نداری!", message: "برای خرید " + sub.title + " به " + toPersianNumber(sub.price) + " سکه نیاز داری.", color: "#dc2626", shadow: "#7f1d1d" });
                return;
            }
            showConfirmModal({
                emoji: sub.emoji, title: "تأیید خرید " + sub.title,
                message: "قیمت: " + toPersianNumber(sub.price) + " سکه\nموجودی بعد از خرید: " + toPersianNumber(u.coins - sub.price) + " سکه",
                color: sub.color, shadow: sub.shadow,
                confirmText: "🛒 خرید", cancelText: "لغو",
                onConfirm: async function () {
                    const r = await Subscription.buy(subId);
                    if (r.ok) {
                        showInfoModal({ emoji: sub.emoji, title: sub.title + " فعال شد!", message: "حالا می‌تونی بدون محدودیت بازی کنی 🎉", color: sub.color, shadow: sub.shadow, buttonText: "عالیه! 🚀", onClose: showSubscriptionScreen });
                    } else {
                        showInfoModal({ emoji: "⚠️", title: "خطا", message: r.error, color: "#dc2626", shadow: "#7f1d1d" });
                    }
                }
            });
        };
    });
}

/* ============================================
   🎨 پروفایل
   ============================================ */

function createSectionTitle(text, gradient, emoji) {
    const title = document.createElement("div");
    title.style.cssText =
        "position:relative;display:flex;align-items:center;gap:10px;" +
        "font-size:16px;font-weight:900;color:white;margin:24px 0 14px;padding:14px 18px;" +
        "background:" + gradient + ";border-radius:16px;" +
        "box-shadow:0 6px 0 rgba(0,0,0,0.25);letter-spacing:0.3px;";
    const textEl = document.createElement("span");
    textEl.textContent = emoji + " " + text;
    title.appendChild(textEl);
    return title;
}

(function addLabelAnimations() {
    if (document.getElementById("labelAnimations")) return;
    const style = document.createElement("style");
    style.id = "labelAnimations";
    style.textContent =
        "@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }" +
        "@keyframes logoBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }" +
        "@keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }" +
        "@keyframes modalBounceIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }" +
        "@keyframes onlineGradientMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }" +
        "@keyframes onlineEnergyFlow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }" +
        "@keyframes toastSlideIn { 0% { transform: translateX(-50%) translateY(-100px); opacity: 0; } 100% { transform: translateX(-50%) translateY(0); opacity: 1; } }" +
        "@keyframes toastSlideOut { 0% { transform: translateX(-50%) translateY(0); opacity: 1; } 100% { transform: translateX(-50%) translateY(-100px); opacity: 0; } }";
    document.head.appendChild(style);
})();

function showProfileScreen() {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("profile");
    playMusicMain();
    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }
    User.updateTopBar();

    const gamesPlayed = user.gamesPlayed || 0;
    const correctAnswers = user.correctAnswers || 0;
    const wrongAnswers = user.wrongAnswers || 0;
    const totalAnswers = correctAnswers + wrongAnswers;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const bestScore = user.bestScore || 0;
    const leagueWins = user.leagueWins || 0;
    const onlineWins = user.onlineWins || 0;

    const box = document.createElement("div");
    box.style.cssText = "max-width:520px;margin:0 auto;padding-bottom:30px;";

    const profileHeader = document.createElement("div");
    profileHeader.className = "profile-header-card";

    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "profile-header-avatar";
    const ring = document.createElement("div");
    ring.className = "profile-avatar-ring";
    avatarWrapper.appendChild(ring);
    const avatar = document.createElement("div");
    avatar.className = "profile-avatar";
    avatar.innerHTML = getAvatarHTML(user.avatar, 80);
    avatarWrapper.appendChild(avatar);
    profileHeader.appendChild(avatarWrapper);

    const name = document.createElement("h2");
    name.className = "profile-header-name";
    name.textContent = getDisplayName(user);
    profileHeader.appendChild(name);

    const subtitle = document.createElement("p");
    subtitle.className = "profile-header-subtitle";
    subtitle.textContent = "🏆 سطح " + toPersianNumber(user.level || 1);
    profileHeader.appendChild(subtitle);
    box.appendChild(profileHeader);

    if (Subscription.isActive()) {
        const sub = SUBSCRIPTIONS[Subscription.activeType()];
        if (sub) {
            const subBox = document.createElement("div");
            subBox.style.cssText =
                "margin:14px 0;padding:16px;border-radius:18px;" +
                "background:linear-gradient(135deg," + sub.color + "," + sub.shadow + ");" +
                "color:white;text-align:center;box-shadow:0 5px 0 " + sub.shadow + ";";
            subBox.innerHTML =
                '<div style="font-size:32px;margin-bottom:6px;">' + sub.emoji + '</div>' +
                '<div style="font-size:15px;font-weight:900;">' + sub.title + ' فعال</div>' +
                '<div style="font-size:13px;margin-top:6px;font-weight:700;">⏰ ' + Subscription.formatRemaining() + ' باقی مانده</div>';
            box.appendChild(subBox);
        }
    }

    if (Hearts.hasDailyReward()) {
        const dailyBtn = document.createElement("button");
        dailyBtn.style.cssText =
            "display:flex;align-items:center;justify-content:center;gap:10px;" +
            "width:100%;min-height:60px;margin-top:14px;padding:14px;" +
            "background:linear-gradient(135deg,#ec4899,#db2777);" +
            "color:white;border:3px solid #f9a8d4;border-radius:18px;" +
            "font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;" +
            "box-shadow:0 5px 0 #831843;animation:pulse 1.5s ease infinite;";
        dailyBtn.innerHTML = '<span style="font-size:24px;">🎁</span><span>دریافت ' + toPersianNumber(DAILY_HEARTS_REWARD) + ' قلب رایگان!</span>';
        dailyBtn.onclick = function () {
            const r = Hearts.claimDailyHearts();
            if (r.ok) {
                showInfoModal({ emoji: "🎁", title: "قلب‌های رایگان گرفتی!", message: "+" + toPersianNumber(r.amount) + " ❤️ به قلبهات اضافه شد", color: "#ec4899", shadow: "#831843", onClose: showProfileScreen });
            } else {
                showInfoModal({ emoji: "⏳", title: "صبر کن!", message: r.error, color: "#f59e0b", shadow: "#b45309" });
            }
        };
        box.appendChild(dailyBtn);
    }

    const subBtn = document.createElement("button");
    subBtn.style.cssText =
        "display:flex;align-items:center;justify-content:center;gap:10px;" +
        "width:100%;min-height:60px;margin-top:14px;padding:14px;" +
        "background:linear-gradient(135deg,#7c3aed,#8b5cf6);" +
        "color:white;border:3px solid #c4b5fd;border-radius:18px;" +
        "font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;" +
        "box-shadow:0 5px 0 #4c1d95;";
    subBtn.innerHTML = '<span style="font-size:24px;">🎫</span><span>اشتراک‌های ویژه</span>';
    subBtn.onclick = showSubscriptionScreen;
    box.appendChild(subBtn);

    const guideBtn = document.createElement("button");
    guideBtn.style.cssText =
        "display:flex;align-items:center;justify-content:center;gap:10px;" +
        "width:100%;min-height:60px;margin-top:12px;padding:14px;" +
        "background:linear-gradient(135deg,#f59e0b,#fbbf24);" +
        "color:#78350f;border:3px solid #fcd34d;border-radius:18px;" +
        "font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;" +
        "box-shadow:0 5px 0 #b45309;";
    guideBtn.innerHTML = '<span style="font-size:24px;">📖</span><span>راهنما و قوانین بازی</span>';
    guideBtn.onclick = showGuideScreen;
    box.appendChild(guideBtn);

    box.appendChild(createSectionTitle("آمار کلی", "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #8b5cf6 100%)", "📊"));

    const statsGrid = document.createElement("div");
    statsGrid.className = "profile-info-grid";
    const statsData = [
        { icon: "⭐", value: toPersianNumber(user.xp || 0), label: "امتیاز کل", color: "yellow" },
        { icon: "💰", value: toPersianNumber(user.coins || 0), label: "سکه", color: "yellow" },
        { icon: "🎮", value: toPersianNumber(gamesPlayed), label: "بازی", color: "blue" },
        { icon: "✅", value: toPersianNumber(correctAnswers), label: "درست", color: "green" },
        { icon: "❌", value: toPersianNumber(wrongAnswers), label: "غلط", color: "red" },
        { icon: "🎯", value: toPersianNumber(accuracy) + "٪", label: "دقت", color: "purple" },
        { icon: "🏅", value: toPersianNumber(bestScore) + " / " + toPersianNumber(TOTAL_QUESTIONS), label: "بهترین", color: "pink" },
        { icon: "🏆", value: toPersianNumber(user.level || 1), label: "سطح", color: "yellow" }
    ];
    statsData.forEach(function (stat) {
        const item = document.createElement("div");
        item.className = "info-box info-box-" + stat.color;
        item.innerHTML = '<span class="info-icon">' + stat.icon + '</span><span class="info-value">' + stat.value + '</span><span class="info-label">' + stat.label + '</span>';
        statsGrid.appendChild(item);
    });
    box.appendChild(statsGrid);

    box.appendChild(createSectionTitle("افتخارات", "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)", "🏆"));

    const achList = document.createElement("div");
    achList.className = "achievements-list";
    const achievements = [
        { icon: "🥇", title: "قهرمانی در لیگ", desc: "بردن مسابقات لیگ هفتگی", unlocked: leagueWins > 0, value: toPersianNumber(leagueWins) + " بار" },
        { icon: "🌐", title: "پیروزی آنلاین", desc: "بردن مسابقات آنلاین", unlocked: onlineWins > 0, value: toPersianNumber(onlineWins) + " بار" },
        { icon: "💯", title: "صد در صد", desc: "یه بازی کامل درست زدی", unlocked: bestScore === TOTAL_QUESTIONS },
        { icon: "🎮", title: "اولین قدم", desc: "اولین بازی رو انجام دادی", unlocked: gamesPlayed >= 1 },
        { icon: "🏆", title: "سطح ۵", desc: "به سطح ۵ رسیدی", unlocked: (user.level || 1) >= 5 },
        { icon: "👑", title: "سطح ۱۰", desc: "به سطح ۱۰ رسیدی", unlocked: (user.level || 1) >= 10 }
    ];
    achievements.forEach(function (ach) {
        const item = document.createElement("div");
        item.className = "achievement-item " + (ach.unlocked ? "unlocked" : "locked");
        let statusHTML;
        if (ach.value && ach.unlocked) {
            statusHTML = '<span class="achievement-status" style="font-size:13px;font-weight:900;color:#d97706;background:#fef3c7;padding:4px 10px;border-radius:10px;border:2px solid #fbbf24;">' + ach.value + '</span>';
        } else if (ach.value) {
            statusHTML = '<span class="achievement-status" style="font-size:12px;font-weight:900;color:#94a3b8;">' + ach.value + '</span>';
        } else {
            statusHTML = ach.unlocked ? '<span class="achievement-status">✅</span>' : '<span class="achievement-status">🔒</span>';
        }
        item.innerHTML =
            '<span class="achievement-icon">' + ach.icon + '</span>' +
            '<div class="achievement-text"><div class="achievement-title">' + ach.title + '</div><div class="achievement-desc">' + ach.desc + '</div></div>' + statusHTML;
        achList.appendChild(item);
    });
    box.appendChild(achList);

    const categoryStats = user.categoryStats || {};
    const catKeys = Object.keys(categoryStats);
    if (catKeys.length > 0) {
        box.appendChild(createSectionTitle("پیشرفت دسته‌بندی‌ها", "linear-gradient(135deg, #10b981 0%, #22c55e 50%, #4ade80 100%)", "📈"));
        const catList = document.createElement("div");
        catList.style.cssText = "display:flex;flex-direction:column;gap:10px;background:white;border:3px solid #10b981;border-radius:18px;padding:14px;box-shadow:0 5px 0 #047857;";
        catKeys.forEach(function (key) {
            const stat = categoryStats[key];
            if (!stat || stat.total === 0) return;
            const catObj = CATEGORIES.find(c => c.file === key);
            const catTitle = catObj ? catObj.title : key;
            const pct = Math.round((stat.correct / stat.total) * 100);
            const row = document.createElement("div");
            row.style.cssText = "padding:6px 0;";
            const labelRow = document.createElement("div");
            labelRow.style.cssText = "display:flex;justify-content:space-between;font-size:12px;font-weight:900;color:#334155;margin-bottom:5px;";
            labelRow.innerHTML = '<span>' + catTitle + '</span><span>' + toPersianNumber(pct) + '٪</span>';
            row.appendChild(labelRow);
            const barWrap = document.createElement("div");
            barWrap.style.cssText = "height:10px;background:#e2e8f0;border-radius:8px;overflow:hidden;border:1.5px solid #cbd5e1;";
            const bar = document.createElement("div");
            bar.style.cssText = "height:100%;width:" + pct + "%;background:linear-gradient(90deg,#22c55e,#4ade80);border-radius:8px;transition:width 0.6s ease;";
            barWrap.appendChild(bar);
            row.appendChild(barWrap);
            catList.appendChild(row);
        });
        box.appendChild(catList);
    }

    const avatarBtn = document.createElement("button");
    avatarBtn.className = "menu-btn primary";
    avatarBtn.style.marginTop = "20px";
    avatarBtn.innerHTML = '<span class="menu-btn-icon">🎨</span><span class="menu-btn-text">تغییر آواتار</span>';
    avatarBtn.onclick = function () { showAvatarScreen("profile"); };
    box.appendChild(avatarBtn);

    const vipAvatarBtn = document.createElement("button");
    vipAvatarBtn.className = "menu-btn primary";
    vipAvatarBtn.style.marginTop = "12px";
    vipAvatarBtn.style.background = "linear-gradient(180deg,#f59e0b,#d97706)";
    vipAvatarBtn.style.boxShadow = "0 5px 0 #b45309";
    vipAvatarBtn.innerHTML = '<span class="menu-btn-icon">🌟</span><span class="menu-btn-text">آواتارهای ویژه (VIP)</span>';
    vipAvatarBtn.onclick = showVipAvatarScreen;
    box.appendChild(vipAvatarBtn);

    const usernameBtn = document.createElement("button");
    usernameBtn.className = "menu-btn primary";
    usernameBtn.style.marginTop = "12px";
    usernameBtn.style.background = "linear-gradient(180deg,#06b6d4,#0891b2)";
    usernameBtn.style.boxShadow = "0 5px 0 #0e7490";
    usernameBtn.innerHTML =
        '<span class="menu-btn-icon">✏️</span>' +
        '<span class="menu-btn-text">تغییر نام کاربری</span>' +
        '<span style="font-size:11px;font-weight:900;color:#fef3c7;background:rgba(0,0,0,0.25);padding:4px 10px;border-radius:10px;margin-right:auto;margin-left:8px;">💰 ' + toPersianNumber(USERNAME_CHANGE_COST) + '</span>';
    usernameBtn.onclick = function () {
        const u = Users.loadCurrent();
        if (!u) return;
        if ((u.coins || 0) < USERNAME_CHANGE_COST) {
            showInfoModal({ emoji: "💰", title: "سکه کافی نداری!", message: "برای تغییر نام کاربری به " + toPersianNumber(USERNAME_CHANGE_COST) + " سکه نیاز داری.", color: "#dc2626", shadow: "#7f1d1d" });
            return;
        }
        showConfirmModal({
            emoji: "✏️", title: "تغییر نام کاربری",
            message: "هزینه تغییر: " + toPersianNumber(USERNAME_CHANGE_COST) + " سکه\nمطمئنی؟",
            color: "#06b6d4", shadow: "#0e7490",
            confirmText: "✅ بله، ادامه", cancelText: "لغو",
            onConfirm: function () {
                showSetUsernameModal(function (newName) {
                    showInfoModal({ emoji: "✅", title: "نام کاربری تغییر کرد!", message: "نام جدید: " + newName, color: "#22c55e", shadow: "#14532d", onClose: showProfileScreen });
                }, true);
            }
        });
    };
    box.appendChild(usernameBtn);

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "menu-btn danger";
    logoutBtn.style.marginTop = "12px";
    logoutBtn.innerHTML = '<span class="menu-btn-icon">🚪</span><span class="menu-btn-text">خروج از حساب</span>';
    logoutBtn.onclick = function () {
        showConfirmModal({
            emoji: "🚪", title: "خروج از حساب",
            message: "مطمئنی می‌خوای از حسابت خارج شی؟",
            color: "#ef4444", shadow: "#7f1d1d",
            confirmText: "خروج", cancelText: "بمون",
            onConfirm: function () {
                Users.logout();
                showLoginScreen();
            }
        });
    };
    box.appendChild(logoutBtn);

    const exitAppBtn = document.createElement("button");
    exitAppBtn.className = "menu-btn danger";
    exitAppBtn.style.marginTop = "12px";
    exitAppBtn.style.background = "linear-gradient(180deg,#7c3aed,#5b21b6)";
    exitAppBtn.innerHTML = '<span class="menu-btn-icon">🚪</span><span class="menu-btn-text">خروج از برنامه</span>';
    exitAppBtn.onclick = function () {
        showExitAppModal(function (shouldExit) {
            // performAppExit داخل خود مودال صدا زده می‌شود
        });
    };
    box.appendChild(exitAppBtn);

    categoriesDiv.appendChild(box);
}

/* ============================================
   📖 راهنما
   ============================================ */

function showGuideScreen() {
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("profile");
    playMusicMain();

    const box = document.createElement("div");
    box.style.cssText = "max-width:520px;margin:0 auto;padding-bottom:30px;";

    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← بازگشت به پروفایل";
    backBtn.onclick = showProfileScreen;
    box.appendChild(backBtn);

    const header = document.createElement("div");
    header.style.cssText =
        "background:linear-gradient(135deg,#1e40af 0%,#3b82f6 40%,#8b5cf6 100%);" +
        "border-radius:24px;padding:30px 20px;text-align:center;color:white;margin-bottom:18px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:12px;">📖</div>' +
        '<div style="font-size:26px;font-weight:900;">راهنمای بازی</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">همه چیز درباره دانشمند</div>';
    box.appendChild(header);

    function createGuideSection(config) {
        const section = document.createElement("div");
        section.style.cssText =
            "background:white;border:3px solid " + config.borderColor + ";" +
            "border-radius:20px;padding:18px 16px;margin-bottom:14px;" +
            "box-shadow:0 5px 0 " + config.shadowColor + ";";
        const titleRow = document.createElement("div");
        titleRow.style.cssText = "display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px dashed " + config.borderColor + ";";
        const icon = document.createElement("div");
        icon.style.cssText = "font-size:30px;line-height:1;";
        icon.textContent = config.icon;
        titleRow.appendChild(icon);
        const title = document.createElement("div");
        title.style.cssText = "font-size:17px;font-weight:900;color:" + config.textColor + ";";
        title.textContent = config.title;
        titleRow.appendChild(title);
        section.appendChild(titleRow);
        config.items.forEach(function (item) {
            const row = document.createElement("div");
            row.style.cssText = "display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:13px;line-height:1.8;color:#334155;font-weight:600;";
            const bullet = document.createElement("div");
            bullet.style.cssText = "flex-shrink:0;width:8px;height:8px;border-radius:50%;background:" + config.textColor + ";margin-top:8px;";
            row.appendChild(bullet);
            const text = document.createElement("div");
            text.style.cssText = "flex:1;";
            text.innerHTML = item;
            row.appendChild(text);
            section.appendChild(row);
        });
        return section;
    }

    box.appendChild(createGuideSection({
        icon: "🎯", title: "چطور بازی کنیم؟",
        borderColor: "#3b82f6", shadowColor: "#1e40af", textColor: "#1e40af",
        items: [
            "از تب <b>بازی</b>، یکی از دو حالت رو انتخاب کن",
            "🎮 <b>بازی امتیازی</b>: خودت سطح و دسته‌بندی رو انتخاب می‌کنی",
            "🎲 <b>حریف تصادفی</b>: با یه بازیکن آنلاین مسابقه می‌دی",
            "توی هر مسابقه <b>" + toPersianNumber(TOTAL_QUESTIONS) + " سوال</b> می‌بینی",
            "برای هر سوال <b>" + toPersianNumber(QUESTION_TIME) + " ثانیه</b> وقت داری"
        ]
    }));

    box.appendChild(createGuideSection({
        icon: "❤️", title: "قلب‌ها",
        borderColor: "#ef4444", shadowColor: "#7f1d1d", textColor: "#dc2626",
        items: [
            "هر بازی فقط <b>۱ قلب</b> مصرف می‌کنه",
            "حداکثر <b>" + toPersianNumber(HEART_MAX) + " قلب</b>",
            "هر <b>" + toPersianNumber(HEART_REGEN_MINUTES) + " دقیقه</b>، ۱ قلب پر می‌شه",
            "🎁 هر ۲۴ ساعت <b>" + toPersianNumber(DAILY_HEARTS_REWARD) + " قلب رایگان</b>"
        ]
    }));

    box.appendChild(createGuideSection({
        icon: "💰", title: "سکه‌ها",
        borderColor: "#f59e0b", shadowColor: "#b45309", textColor: "#d97706",
        items: [
            "هر پاسخ درست → <b>" + toPersianNumber(COINS_PER_CORRECT) + " سکه</b>",
            "🎁 بونوس بازی کامل → <b>" + toPersianNumber(COINS_PERFECT_BONUS) + " سکه</b>",
            "کاربر جدید: <b>۵۰ سکه هدیه</b> 🎉"
        ]
    }));

    box.appendChild(createGuideSection({
        icon: "⭐", title: "امتیاز و سطح",
        borderColor: "#8b5cf6", shadowColor: "#4c1d95", textColor: "#7c3aed",
        items: [
            "هر پاسخ درست → <b>" + toPersianNumber(XP_PER_CORRECT) + " امتیاز</b>",
            "هر <b>" + toPersianNumber(XP_PER_LEVEL) + " امتیاز</b> = ۱ سطح",
            "سطح <b>" + toPersianNumber(ONLINE_UNLOCK_LEVEL) + "</b> → بازی آنلاین فعال"
        ]
    }));

    box.appendChild(createGuideSection({
        icon: "🏆", title: "لیگ هفتگی آنلاین",
        borderColor: "#22c55e", shadowColor: "#14532d", textColor: "#15803d",
        items: [
            "حداقل سطح <b>" + toPersianNumber(LEAGUE_MIN_LEVEL) + "</b> برای ورود",
            "هر هفته از <b>جمعه تا چهارشنبه</b> مسابقه",
            "هر گروه <b>۱۰ بازیکن</b> (لیگ برتر ۱۶)",
            "برد <b>۳ امتیاز</b>، مساوی <b>۱ امتیاز</b>",
            "🏆 قهرمان هر دسته پاداش ویژه می‌گیره"
        ]
    }));

    const startBtn = document.createElement("button");
    startBtn.style.cssText =
        "width:100%;padding:18px;margin-top:12px;" +
        "background:linear-gradient(180deg,#22c55e,#16a34a);" +
        "color:white;border:3px solid #4ade80;border-radius:18px;" +
        "font-size:17px;font-weight:900;font-family:inherit;cursor:pointer;" +
        "box-shadow:0 6px 0 #14532d;";
    startBtn.innerHTML = "🚀 بزن بریم بازی!";
    startBtn.onclick = showGameModeScreen;
    box.appendChild(startBtn);

    categoriesDiv.appendChild(box);
}

/* ============================================
   🏆 LEAGUE — سیستم لیگ آنلاین
   ============================================ */

let leagueTimer = null;
let leaguePollInterval = null;
let validLeagueTopicsCache = null;

function clearLeagueTimer() {
    if (leagueTimer) clearInterval(leagueTimer);
    leagueTimer = null;
}

function clearLeaguePoll() {
    if (leaguePollInterval) clearInterval(leaguePollInterval);
    leaguePollInterval = null;
}

function isDevMode() {
    return new URLSearchParams(location.search).get("dev") === "1";
}

function getFridayStart(ref) {
    const d = ref ? new Date(ref) : new Date();
    const diff = (d.getDay() - LEAGUE_FRIDAY + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getNextFridayStart() {
    const now = new Date();
    const diff = (LEAGUE_FRIDAY - now.getDay() + 7) % 7;
    const d = new Date(now);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
    return d.getTime();
}

function getCompetitionEnd(seasonStart) {
    const d = new Date(seasonStart);
    d.setDate(d.getDate() + 6);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getLeaguePhase(now) {
    const d = now ? new Date(now) : new Date();
    return d.getDay() === LEAGUE_THURSDAY ? "results" : "competition";
}

function formatLeagueDate(ts) {
    const d = new Date(ts);
    const days = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
    return days[d.getDay()] + " " +
        toPersianNumber(String(d.getHours()).padStart(2, "0")) + ":" +
        toPersianNumber(String(d.getMinutes()).padStart(2, "0"));
}

function formatRemaining(ms) {
    if (ms <= 0) return "تمام شده";
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (days) return toPersianNumber(days) + " روز و " + toPersianNumber(hours) + " ساعت";
    if (hours) return toPersianNumber(hours) + " ساعت و " + toPersianNumber(minutes) + " دقیقه";
    return toPersianNumber(minutes) + " دقیقه";
}

/* ============================================
   🏆 OnlineLeagueAPI
   ============================================ */

const OnlineLeagueAPI = {
    async _getToken() {
        const user = Users.loadCurrent();
        if (!user || !user.phone) throw new Error("کاربر وارد نشده");

        const phone = user.phone;
        const ts = Date.now();

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw", enc.encode(LEAGUE_AUTH_SECRET),
            { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(phone + ":" + ts));
        const hex = Array.from(new Uint8Array(sig))
            .map(b => b.toString(16).padStart(2, "0")).join("");

        return btoa(phone + ":" + ts + ":" + hex);
    },

    async request(path, options = {}) {
        const token = await this._getToken();
        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        };

        const response = await fetch(LEAGUE_API_BASE + path, {
            ...options,
            headers: { ...headers, ...(options.headers || {}) }
        });

        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch (_) { data = { ok: false, error: text }; }

        if (!response.ok) throw new Error(data.error || "خطای سرور");
        if (data.ok === false) throw new Error(data.error || "خطای نامشخص");
        return data;
    },

    async getState() {
        const r = await this.request("/state");
        return r.state || null;
    },

    async register(user, leagueId, paidAmount) {
        return await this.request("/register", {
            method: "POST",
            body: JSON.stringify({
                leagueId,
                paidAmount,
                devMode: isDevMode()
            })
        });
    },

    async cancelRegistration(leagueId) {
        return await this.request("/cancel", {
            method: "POST",
            body: JSON.stringify({ leagueId })
        });
    },

    async getRegistrationStatus(leagueId) {
        const dev = isDevMode() ? "&dev=1" : "";
        return await this.request("/registration-status?leagueId=" +
            encodeURIComponent(leagueId) + dev);
    },

    async weeklyJoin(user, leagueId, paidAmount) {
        return await this.request("/weekly-join", {
            method: "POST",
            body: JSON.stringify({ leagueId, paidAmount })
        });
    },

    async submitScore(username, matchId, score) {
        return await this.request("/matches/" + encodeURIComponent(matchId) + "/score", {
            method: "POST",
            body: JSON.stringify({ score })
        });
    },

    async finalise() {
        return await this.request("/finalise", { method: "POST" });
    }
};

const LeagueAPI = OnlineLeagueAPI;

/* ============================================
   🏆 UI Helpers
   ============================================ */

function showLeagueMessage(title, text, buttonText, action) {
    resetCategoriesDiv();
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
        '• برد: ۳ امتیاز<br>• مساوی: ۱ امتیاز<br>• باخت یا غیبت: ۰ امتیاز<br>' +
        '• در امتیاز مساوی: پاسخ صحیح بیشتر ملاک است' +
        '</div>' +
        '<div style="background:white;padding:12px;border-radius:12px;' +
        'margin-bottom:8px;border-right:4px solid #10b981;">' +
        '<b style="color:#047857;">📊 دسته‌ها:</b><br>' +
        '• 🥉 لیگ دسته ۳ (ورودی)<br>• 🥈 لیگ دسته ۲<br>• 🥇 لیگ دسته ۱<br>• 👑 لیگ برتر' +
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
        '• دسته ۳: ۱۰۰ سکه<br>• دسته ۲: ۲۰۰ سکه<br>' +
        '• دسته ۱: ۳۰۰ سکه<br>• لیگ برتر: ۵۰۰ سکه<br>' +
        '<b style="color:#991b1b;">🏆 جایزه قهرمان:</b><br>' +
        '• دسته ۳: ۵۰۰ سکه<br>• دسته ۲: ۸۰۰ سکه<br>' +
        '• دسته ۱: ۱۲۰۰ سکه<br>• لیگ برتر: ۲۵۰۰ سکه' +
        '</div>';

    return card;
}

/* ============================================
   🏆 Main League Screen
   ============================================ */

async function showLeagueScreen() {
    clearLeagueTimer();
    clearLeaguePoll();
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");

    User.showBottomBar();
    User.updateTopBar();
    setActiveTab("league");

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    if ((user.level || 1) < LEAGUE_MIN_LEVEL) {
        showLeagueMessage(
            "🔒 لیگ هنوز باز نشده",
            "برای ورود به لیگ باید به سطح " + toPersianNumber(LEAGUE_MIN_LEVEL) + " برسی.<br>" +
            "سطح فعلی: " + toPersianNumber(user.level || 1),
            "بریم بازی کنیم",
            showHomeScreen
        );
        return;
    }

    let state = null;
    try {
        state = await LeagueAPI.getState();
    } catch (e) {
        showLeagueMessage("خطای اتصال", e.message, "🔄 تلاش دوباره", showLeagueScreen);
        return;
    }

    const leagueId = user.leagueId || "division3";
    const league = LEAGUES[leagueId];

    // حالت ۱: کاربر توی گروه
    if (state && state.group) {
        if (getLeaguePhase() === "results" || Date.now() >= state.competitionEnd) {
            await finaliseLeagueSeason(user, state);
            return;
        }
        renderLeagueDashboard(user, state);
        return;
    }

    // حالت ۲: پنجشنبه
    if (getLeaguePhase() === "results") {
        showLeagueMessage(
            "📊 روز اعلام نتایج",
            "امروز پنجشنبه است.<br>لیگ جدید از جمعه شروع می‌شه.",
            "بازگشت",
            showHomeScreen
        );
        return;
    }

    // حالت ۳: چک وضعیت ثبت‌نام
    let status;
    try {
        status = await LeagueAPI.getRegistrationStatus(leagueId);
    } catch (e) {
        showLeagueMessage("خطای اتصال", e.message, "🔄 تلاش دوباره", showLeagueScreen);
        return;
    }

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
            toPersianNumber(league.entryFee) + " سکه نیاز داری.<br>" +
            "موجودی: " + toPersianNumber(user.coins || 0) + " سکه",
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
}

/* ============================================
   🏆 Registration Form
   ============================================ */

function showRegistrationForm(user, data) {
    const league = LEAGUES[user.leagueId || "division3"];
    const MIN_PLAYERS = isDevMode() ? LEAGUE_SETTINGS.DEV_MIN_PLAYERS : LEAGUE_SETTINGS.MIN_PLAYERS_TO_START;
    const GROUP_SIZE = league.groupSize;

    const registered = data.registered || 0;
    const progress = Math.min(100, Math.round((registered / MIN_PLAYERS) * 100));
    const remaining = Math.max(0, MIN_PLAYERS - registered);
    const currentGroups = Math.floor(registered / GROUP_SIZE);
    const canAfford = (user.coins || 0) >= league.entryFee;

    resetCategoriesDiv();
    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    const header = document.createElement("div");
    header.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);" +
        "color:white;box-shadow:0 10px 30px rgba(139,92,246,0.4);" +
        "margin-bottom:20px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">🏆</div>' +
        '<div style="font-size:24px;font-weight:900;margin-bottom:8px;">لیگ هفتگی</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">با بازیکنان واقعی رقابت کن</div>' +
        (isDevMode()
            ? '<div style="margin-top:8px;padding:4px 10px;background:rgba(255,255,255,0.3);border-radius:10px;font-size:11px;font-weight:900;">🔧 حالت تست فعال</div>'
            : "");
    box.appendChild(header);

    const progressBox = document.createElement("div");
    progressBox.style.cssText =
        "padding:20px;border-radius:20px;background:white;" +
        "border:3px solid #6366f1;margin-bottom:16px;" +
        "box-shadow:0 5px 0 #4338ca;";
    progressBox.innerHTML =
        '<div style="display:flex;justify-content:space-between;' +
        'align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:15px;font-weight:900;color:#1e293b;">' +
        '👥 ' + toPersianNumber(registered) + ' از ' + toPersianNumber(MIN_PLAYERS) + ' نفر' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#6366f1;">' +
        toPersianNumber(progress) + '٪</div></div>' +
        '<div style="height:16px;background:#e2e8f0;border-radius:12px;' +
        'overflow:hidden;border:2px solid #cbd5e1;">' +
        '<div style="height:100%;width:' + progress + '%;' +
        'background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);' +
        'border-radius:12px;transition:width 0.6s ease;"></div></div>' +
        (remaining > 0
            ? '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:800;color:#64748b;">' +
              '⏳ ' + toPersianNumber(remaining) + ' نفر دیگه مونده</div>'
            : '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:900;color:#10b981;">' +
              '✅ تعداد کافیه!</div>');
    box.appendChild(progressBox);

    const info = document.createElement("div");
    info.style.cssText =
        "padding:16px;border-radius:16px;background:#f8fafc;" +
        "border:2px solid #cbd5e1;margin-bottom:16px;" +
        "font-size:13px;font-weight:700;color:#334155;line-height:2;";
    info.innerHTML =
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>💰 ورودی:</span><b>' + toPersianNumber(league.entryFee) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🏆 جایزه نفر اول:</span><b>' + toPersianNumber(league.rewards[1]) + ' سکه</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>👥 گروه:</span><b>' + toPersianNumber(GROUP_SIZE) + ' نفره</b></div>' +
        '<div style="display:flex;justify-content:space-between;">' +
        '<span>🪙 موجودی شما:</span>' +
        '<b style="color:' + (canAfford ? '#10b981' : '#dc2626') + ';">' +
        toPersianNumber(user.coins || 0) + ' سکه</b></div>';
    box.appendChild(info);

    const registerBtn = document.createElement("button");
    registerBtn.style.cssText =
        "width:100%;padding:18px;border-radius:18px;" +
        "background:linear-gradient(180deg," +
        (canAfford ? "#22c55e,#16a34a" : "#94a3b8,#64748b") + ");" +
        "color:white;border:3px solid " + (canAfford ? "#4ade80" : "#cbd5e1") + ";" +
        "font-size:16px;font-weight:900;font-family:inherit;" +
        "cursor:" + (canAfford ? "pointer" : "not-allowed") + ";" +
        "box-shadow:0 6px 0 " + (canAfford ? "#14532d" : "#334155") + ";" +
        "text-shadow:0 2px 4px rgba(0,0,0,0.3);margin-bottom:10px;";
    registerBtn.textContent = canAfford ? "✋ ثبت‌نام می‌کنم" : "💰 سکه کافی نداری";
    registerBtn.disabled = !canAfford;
    registerBtn.onclick = () => registerForLeague(user, league);
    box.appendChild(registerBtn);

    const backBtn = document.createElement("button");
    backBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;margin-bottom:16px;";
    backBtn.textContent = "🔙 بازگشت";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);

    box.appendChild(buildLeagueRulesCard());
    categoriesDiv.appendChild(box);
}

/* ============================================
   🏆 Waiting Screen
   ============================================ */

function showRegisteredWaiting(user, data) {
    const league = LEAGUES[user.leagueId || "division3"];
    const MIN_PLAYERS = isDevMode() ? LEAGUE_SETTINGS.DEV_MIN_PLAYERS : LEAGUE_SETTINGS.MIN_PLAYERS_TO_START;

    const registered = data.registered || 0;
    const progress = Math.min(100, Math.round((registered / MIN_PLAYERS) * 100));
    const remaining = Math.max(0, MIN_PLAYERS - registered);

    resetCategoriesDiv();
    const box = document.createElement("div");
    box.style.cssText = "max-width:500px;margin:auto;padding:20px;";

    const successCard = document.createElement("div");
    successCard.style.cssText =
        "padding:28px 20px;border-radius:24px;text-align:center;" +
        "background:linear-gradient(135deg,#10b981,#059669);" +
        "color:white;box-shadow:0 10px 30px rgba(16,185,129,0.4);" +
        "margin-bottom:20px;";
    successCard.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">✅</div>' +
        '<div style="font-size:22px;font-weight:900;margin-bottom:8px;">ثبت‌نام شدی!</div>' +
        '<div style="font-size:13px;opacity:0.95;font-weight:700;">وقتی لیگ شروع شه، بهت خبر می‌دیم</div>';
    box.appendChild(successCard);

    const selfCard = document.createElement("div");
    selfCard.style.cssText =
        "display:flex;align-items:center;gap:12px;padding:14px;" +
        "border-radius:16px;margin-bottom:16px;" +
        "background:linear-gradient(135deg,#d1fae5,#a7f3d0);" +
        "border:3px solid #10b981;box-shadow:0 4px 0 #047857;";
    selfCard.innerHTML =
        '<div style="font-size:28px;">' + getAvatarHTML(user.avatar, 26) + '</div>' +
        '<div style="flex:1;">' +
        '<div style="font-size:14px;font-weight:900;color:#047857;">' +
        user.username + ' (شما)</div>' +
        '<div style="font-size:11px;font-weight:700;color:#059669;margin-top:2px;">' +
        '✅ توی لیست ثبت‌نامی</div></div>';
    box.appendChild(selfCard);

    const progressBox = document.createElement("div");
    progressBox.style.cssText =
        "padding:20px;border-radius:20px;background:white;" +
        "border:3px solid #10b981;margin-bottom:16px;" +
        "box-shadow:0 5px 0 #047857;";
    progressBox.innerHTML =
        '<div style="display:flex;justify-content:space-between;' +
        'align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:15px;font-weight:900;color:#1e293b;">' +
        '👥 ' + toPersianNumber(registered) + ' از ' + toPersianNumber(MIN_PLAYERS) + ' نفر' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;color:#10b981;">' +
        toPersianNumber(progress) + '٪</div></div>' +
        '<div style="height:16px;background:#e2e8f0;border-radius:12px;' +
        'overflow:hidden;border:2px solid #cbd5e1;">' +
        '<div style="height:100%;width:' + progress + '%;' +
        'background:linear-gradient(90deg,#10b981,#22c55e,#4ade80);' +
        'border-radius:12px;transition:width 0.6s ease;"></div></div>' +
        (remaining > 0
            ? '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:800;color:#64748b;">' +
              '⏳ ' + toPersianNumber(remaining) + ' نفر دیگه مونده</div>'
            : '<div style="text-align:center;margin-top:12px;' +
              'font-size:13px;font-weight:900;color:#10b981;">' +
              '🎉 تعداد کافیه!</div>');
    box.appendChild(progressBox);

    const startInfo = document.createElement("div");
    startInfo.style.cssText =
        "padding:16px;border-radius:16px;" +
        "background:linear-gradient(135deg,#fef3c7,#fde68a);" +
        "border:3px solid #fbbf24;margin-bottom:16px;" +
        "text-align:center;font-size:13px;font-weight:800;color:#78350f;line-height:2;";
    startInfo.innerHTML =
        '📅 شروع: <b>' + formatLeagueDate(data.startsAt) + '</b><br>' +
        '⏰ ' + formatRemaining(data.startsAt - Date.now()) + ' مونده';
    box.appendChild(startInfo);

    const refreshBtn = document.createElement("button");
    refreshBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;" +
        "background:linear-gradient(180deg,#3b82f6,#1d4ed8);" +
        "color:white;border:3px solid #60a5fa;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #1e3a8a;margin-bottom:10px;";
    refreshBtn.textContent = "🔄 بروزرسانی";
    refreshBtn.onclick = showLeagueScreen;
    box.appendChild(refreshBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.style.cssText =
        "width:100%;padding:14px;border-radius:16px;" +
        "background:linear-gradient(180deg,#ef4444,#b91c1c);" +
        "color:white;border:3px solid #f87171;" +
        "font-size:14px;font-weight:900;font-family:inherit;" +
        "cursor:pointer;box-shadow:0 5px 0 #7f1d1d;margin-bottom:16px;";
    cancelBtn.textContent = "❌ انصراف و بازگشت سکه";
    cancelBtn.onclick = function () {
        showConfirmModal({
            emoji: "❌", title: "انصراف از لیگ",
            message: "مطمئنی؟ " + toPersianNumber(league.entryFee) + " سکه برمی‌گرده",
            color: "#ef4444", shadow: "#7f1d1d",
            confirmText: "بله انصراف", cancelText: "بمون",
            onConfirm: () => cancelLeagueRegistration(user)
        });
    };
    box.appendChild(cancelBtn);

    box.appendChild(buildLeagueRulesCard());
    categoriesDiv.appendChild(box);

    // polling
    leaguePollInterval = setInterval(async function () {
        try {
            const status = await LeagueAPI.getRegistrationStatus(league.id);
            if (status.registered !== data.registered) {
                clearLeaguePoll();
                showLeagueScreen();
            }
        } catch (_) {}
    }, 10000);
}

/* ============================================
   🏆 Register / Cancel / Join
   ============================================ */

async function registerForLeague(user, league) {
    try {
        const ok = await Shop.addCoins(-league.entryFee, "league_entry");
        if (!ok) throw new Error("خطا در کسر سکه");

        const result = await LeagueAPI.register(user, league.id, league.entryFee);

        await Users.updateCurrent({
            leaguePaidWeek: getFridayStart(),
            leaguePaidAmount: league.entryFee
        });

        if (result.status === "bootstrapped") {
            showInfoModal({
                emoji: "🎉", title: "لیگ شروع شد!",
                message: toPersianNumber(result.players) + " نفر ثبت‌نام کردن<br>گروه‌ها تشکیل شدن!",
                color: "#22c55e", shadow: "#14532d",
                buttonText: "🚀 بریم!",
                onClose: showLeagueScreen
            });
        } else {
            showInfoModal({
                emoji: "✅", title: "ثبت‌نام موفق!",
                message: toPersianNumber(result.registered) + " از " +
                         toPersianNumber(result.needed) + " نفر ثبت‌نام کردن",
                color: "#10b981", shadow: "#047857",
                onClose: showLeagueScreen
            });
        }
    } catch (e) {
        await Shop.addCoins(league.entryFee, "league_entry_refund");
        showInfoModal({
            emoji: "⚠️", title: "خطا",
            message: e.message || "ثبت‌نام ناموفق",
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

async function cancelLeagueRegistration(user) {
    try {
        const league = LEAGUES[user.leagueId || "division3"];
        await LeagueAPI.cancelRegistration(league.id);
        await Shop.addCoins(league.entryFee, "league_entry_refund");
        await Users.updateCurrent({
            leaguePaidWeek: null,
            leaguePaidAmount: 0
        });

        showInfoModal({
            emoji: "✅", title: "انصراف موفق",
            message: toPersianNumber(league.entryFee) + " سکه برگشت",
            color: "#10b981", shadow: "#047857",
            onClose: showHomeScreen
        });
    } catch (e) {
        showInfoModal({
            emoji: "⚠️", title: "خطا",
            message: e.message,
            color: "#dc2626", shadow: "#7f1d1d"
        });
    }
}

/* ============================================
   🏆 League Dashboard
   ============================================ */

function calculateStandings(group) {
    const map = {};
    group.players.forEach(p => {
        map[p.id] = {
            id: p.id, username: p.username, avatar: p.avatar || "👤",
            points: 0, correctAnswers: 0, played: 0,
            wins: 0, draws: 0, losses: 0
        };
    });

    group.matches.forEach(function (m) {
        if (m.status !== "completed" && m.status !== "forfeit") return;
        const h = map[m.homeId], a = map[m.awayId];
        if (!h || !a) return;

        h.played++; a.played++;
        h.correctAnswers += Number(m.homeScore || 0);
        a.correctAnswers += Number(m.awayScore || 0);

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

    return Object.values(map).sort(function (a, b) {
        return (b.points - a.points) ||
               (b.correctAnswers - a.correctAnswers) ||
               (b.wins - a.wins) ||
               String(a.username).localeCompare(String(b.username), "fa");
    });
}

function renderLeagueDashboard(user, state) {
    const league = LEAGUES[state.leagueId];
    const standings = calculateStandings(state.group);
    const userId = "user_" + user.phone;
    const now = Date.now();

    resetCategoriesDiv();

    const header = document.createElement("div");
    header.style.cssText =
        "padding:22px;border-radius:22px;color:white;text-align:center;" +
        "background:linear-gradient(135deg," + league.color + ",#1e40af);" +
        "margin-bottom:14px;";
    header.innerHTML =
        '<div style="font-size:25px;font-weight:900">' +
        league.emoji + ' ' + league.name + '</div>' +
        '<div style="margin-top:8px;font-weight:700">گروه ' +
        toPersianNumber(state.group.number) + ' — ' +
        toPersianNumber(state.group.players.length) + ' نفر</div>' +
        '<div style="margin-top:7px">پایان مسابقات: ' +
        formatRemaining(state.competitionEnd - now) + '</div>';
    categoriesDiv.appendChild(header);

    const rules = document.createElement("div");
    rules.style.cssText =
        "padding:12px;border-radius:14px;background:#e2e8f0;" +
        "color:#334155;text-align:center;font-weight:800;" +
        "margin-bottom:14px;line-height:1.8;font-size:12px;";
    rules.innerHTML = "برد ۳، مساوی ۱، باخت یا غیبت ۰ امتیاز<br>در امتیاز برابر: پاسخ صحیح بیشتر";
    categoriesDiv.appendChild(rules);

    const title = document.createElement("h3");
    title.textContent = "📊 جدول گروه";
    categoriesDiv.appendChild(title);

    const table = document.createElement("div");
    table.style.cssText =
        "background:white;border:2px solid #cbd5e1;border-radius:16px;" +
        "overflow:hidden;margin-bottom:16px;";

    standings.forEach(function (p, index) {
        const rank = index + 1;
        const row = document.createElement("div");
        row.style.cssText =
            "display:grid;grid-template-columns:40px 40px 1fr auto auto auto;" +
            "gap:8px;align-items:center;padding:10px 12px;" +
            "border-bottom:1px solid #e2e8f0;" +
            (p.id === userId ? "background:linear-gradient(90deg,#fef3c7,#fde68a);" : "");

        let movement = "";
        if (league.promote && rank <= league.promote) movement = "⬆️";
        if (league.relegate && rank > standings.length - league.relegate) movement = "⬇️";

        row.innerHTML =
            '<div style="font-weight:900;font-size:14px;">' +
            (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : toPersianNumber(rank)) +
            '</div>' +
            '<div style="font-size:22px;">' + getAvatarHTML(p.avatar, 24) + '</div>' +
            '<div style="font-weight:900;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
            escapeHtml(p.username) + (p.id === userId ? " (شما)" : "") + '</div>' +
            '<div style="font-size:11px;color:#64748b;font-weight:700;">' +
            toPersianNumber(p.correctAnswers) + '</div>' +
            '<div style="font-weight:900;color:#1e40af;font-size:14px;">' +
            toPersianNumber(p.points) + '</div>' +
            '<div style="font-size:14px;">' + movement + '</div>';

        table.appendChild(row);
    });
    categoriesDiv.appendChild(table);

    const matchTitle = document.createElement("h3");
    matchTitle.textContent = "🎮 برنامه مسابقات شما";
    matchTitle.style.marginTop = "20px";
    categoriesDiv.appendChild(matchTitle);

    const userMatches = state.group.matches.filter(
        m => m.homeId === userId || m.awayId === userId
    );

    if (userMatches.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "text-align:center;padding:20px;color:#64748b;font-weight:700;";
        empty.textContent = "هنوز مسابقه‌ای برنامه‌ریزی نشده";
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
        if (m.status === "completed" || m.status === "forfeit") status = "✅ تمام شده";
        else if (active) status = "🟢 فعال";
        else if (now < m.startTime) status = "⏳ در انتظار";
        else if (mySubmitted && !oppSubmitted) status = "⏳ منتظر حریف";
        else status = "❌ از دست رفته";

        card.innerHTML =
            '<div style="display:flex;align-items:center;gap:10px">' +
            '<div style="font-size:32px">' + getAvatarHTML(opponentAvatar, 32) + '</div>' +
            '<div style="flex:1"><b>' + escapeHtml(opponentName) + '</b>' +
            '<div style="font-size:12px;margin-top:4px">' +
            formatLeagueDate(m.startTime) + '</div></div>' +
            '<b>' + status + '</b></div>';

        if (active) {
            const btn = document.createElement("button");
            btn.style.cssText =
                "width:100%;padding:14px;margin-top:10px;border-radius:14px;" +
                "background:linear-gradient(180deg,#22c55e,#16a34a);" +
                "color:white;border:3px solid #4ade80;" +
                "font-family:inherit;font-size:14px;font-weight:900;" +
                "cursor:pointer;box-shadow:0 5px 0 #14532d;";
            btn.textContent = "🎮 شروع مسابقه";
            btn.onclick = () => startLeagueMatch(state, m);
            card.appendChild(btn);
        } else if (m.status === "completed" || m.status === "forfeit") {
            const score = document.createElement("div");
            score.style.cssText =
                "text-align:center;margin-top:8px;font-weight:900;font-size:18px";
            score.textContent = toPersianNumber(m.homeScore) + " - " + toPersianNumber(m.awayScore);
            card.appendChild(score);
        } else if (mySubmitted && !oppSubmitted) {
            const info = document.createElement("div");
            info.style.cssText =
                "text-align:center;margin-top:8px;font-size:12px;" +
                "color:#64748b;font-weight:700";
            info.textContent = "نتیجه تو: " + toPersianNumber(myScore) + " — منتظر حریف";
            card.appendChild(info);
        }

        categoriesDiv.appendChild(card);
    });
}

/* ============================================
   🏆 League Quiz
   ============================================ */

async function getValidLeagueTopics() {
    if (validLeagueTopicsCache) return validLeagueTopicsCache;

    const results = await Promise.all(CATEGORIES.map(async function (cat) {
        try {
            const response = await fetch("questions/" + cat.file);
            const data = await response.json();
            return { cat, questions: Array.isArray(data) ? data : [] };
        } catch (_) {
            return { cat, questions: [] };
        }
    }));
    validLeagueTopicsCache = results.filter(x => x.questions.length >= 3);
    return validLeagueTopicsCache;
}

function leagueDifficultyWeights(leagueId) {
    return {
        division3: { easy: .60, medium: .35, hard: .05 },
        division2: { easy: .30, medium: .50, hard: .20 },
        division1: { easy: .10, medium: .40, hard: .50 },
        premier: { easy: 0, medium: .20, hard: .80 }
    }[leagueId];
}

function pickLeagueQuestions(pool, count, weights) {
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

async function startLeagueMatch(state, match) {
    resetCategoriesDiv();
    categoriesDiv.innerHTML =
        '<div style="text-align:center;padding:60px;font-weight:900">' +
        'در حال بارگذاری سوالات...</div>';

    const topics = await getValidLeagueTopics();
    if (topics.length < 3) {
        showLeagueMessage("خطا", "حداقل سه موضوع دارای سوال لازم است", "بازگشت", showLeagueScreen);
        return;
    }

    const shuffled = [...topics].sort(() => Math.random() - .5);
    const selected = shuffled.slice(0, 3);
    const weights = leagueDifficultyWeights(state.leagueId);

    const questions = [];
    selected.forEach(t => pickLeagueQuestions(t.questions, 3, weights)
        .forEach(q => questions.push({ ...q, topicName: t.cat.title })));

    runLeagueQuiz(state, match, questions.slice(0, 9));
}

function createLeagueTimer(totalSeconds, onEnd) {
    clearLeagueTimer();
    const wrap = document.createElement("div");
    wrap.style.cssText =
        "width:70px;height:70px;border-radius:50%;display:grid;" +
        "place-items:center;background:#fff;border:7px solid #10b981;" +
        "font-weight:900;font-size:20px;color:#0f172a;";

    let remaining = totalSeconds;
    wrap.textContent = toPersianNumber(remaining);

    leagueTimer = setInterval(function () {
        remaining--;
        wrap.textContent = toPersianNumber(Math.max(0, remaining));
        wrap.style.borderColor = remaining <= 4 ? "#ef4444" :
                                 remaining <= 8 ? "#f59e0b" : "#10b981";
        if (remaining <= 0) { clearLeagueTimer(); onEnd(); }
    }, 1000);

    return wrap;
}

function runLeagueQuiz(state, match, questions) {
    let index = 0, score = 0;

    function next() {
        clearLeagueTimer();
        resetCategoriesDiv();

        if (index >= questions.length) {
            submitLeagueResult(state, match, score);
            return;
        }

        const q = questions[index];
        let answered = false;
        const buttons = [];

        const top = document.createElement("div");
        top.style.cssText = "display:flex;align-items:center;gap:12px;margin-bottom:16px";

        const timerEl = createLeagueTimer(LEAGUE_QUESTION_SECONDS, function () {
            if (answered) return;
            answered = true;
            buttons.forEach(b => b.disabled = true);
            if (buttons[q.correct]) buttons[q.correct].classList.add("correct");
            setTimeout(() => { index++; next(); }, 1000);
        });
        top.appendChild(timerEl);

        const info = document.createElement("div");
        info.innerHTML =
            '<b>' + escapeHtml(q.topicName) + '</b>' +
            '<div style="margin-top:5px;color:#64748b">سوال ' +
            toPersianNumber(index + 1) + ' از ' + toPersianNumber(questions.length) + '</div>';
        top.appendChild(info);
        categoriesDiv.appendChild(top);

        const box = document.createElement("div");
        box.style.cssText =
            "background:white;border:3px solid #3b82f6;border-radius:18px;" +
            "padding:18px;margin-bottom:14px;font-size:16px;font-weight:900;" +
            "text-align:center;line-height:1.7;";
        box.textContent = cleanQuestionText(q.question);
        categoriesDiv.appendChild(box);

        q.answers.forEach(function (answer, answerIndex) {
            const btn = document.createElement("button");
            btn.className = "category";
            btn.textContent = answer;
            btn.style.cssText = "min-height:auto;padding:14px 18px;font-size:15px;font-weight:900;margin-bottom:8px;";
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

async function submitLeagueResult(state, match, score) {
    resetCategoriesDiv();
    categoriesDiv.innerHTML =
        '<div style="text-align:center;padding:60px;font-weight:900">' +
        'در حال ثبت نتیجه...</div>';

    const user = Users.loadCurrent();
    if (!user) {
        showLeagueMessage("خطا", "کاربر یافت نشد", "بازگشت", showHomeScreen);
        return;
    }

    if (typeof score !== "number" || score < 0 || score > 9) {
        showLeagueMessage("خطا", "امتیاز نامعتبر", "بازگشت", showLeagueScreen);
        return;
    }

    try {
        await LeagueAPI.submitScore(user.username, match.id, score);
        showLeagueMessage(
            "✅ نتیجه ثبت شد",
            "تعداد پاسخ صحیح شما: " + toPersianNumber(score) + " از ۹",
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

/* ============================================
   🏆 Finalise Season
   ============================================ */

async function finaliseLeagueSeason(user, state) {
    try {
        const result = await LeagueAPI.finalise();

        if (result.already) {
            showLeagueMessage("پایان لیگ", "این فصل قبلاً بسته شده.<br>لیگ جدید به‌زودی شروع می‌شه.",
                "بازگشت به خانه", showHomeScreen);
            return;
        }

        const league = LEAGUES[state.leagueId];
        const idx = LEAGUE_ORDER.indexOf(state.leagueId);
        const nextIdx = LEAGUE_ORDER.indexOf(result.nextLeagueId);

        let change = "ماندن در " + league.name;
        if (nextIdx > idx) change = "⬆️ صعود به " + LEAGUES[result.nextLeagueId].name;
        else if (nextIdx < idx) change = "⬇️ سقوط به " + LEAGUES[result.nextLeagueId].name;

        if (result.reward > 0) {
            await Shop.addCoins(result.reward, "league_champion_" + state.seasonId);
        }

        const fresh = Users.loadCurrent();
        const honors = Array.isArray(fresh.honors) ? [...fresh.honors] : [];
        const honorId = "honor_" + state.seasonId + "_" + state.leagueId;
        const alreadyRewarded = honors.some(h => h.id === honorId);

        if (result.rank === 1 && !alreadyRewarded) {
            honors.push({
                id: honorId,
                type: "league_champion",
                title: "قهرمان " + league.name,
                leagueId: state.leagueId,
                seasonId: state.seasonId,
                achievedAt: Date.now(),
                trophy: "🏆"
            });
        }

        await Users.updateCurrent({
            leagueId: result.nextLeagueId,
            honors: honors,
            leaguePaidWeek: null,
            leaguePaidAmount: 0
        });

        showSeasonResult(
            result.rank, result.total, league, change, result.reward,
            result.rank === 1 && !alreadyRewarded
        );
    } catch (e) {
        showLeagueMessage("خطا", e.message, "بازگشت", showHomeScreen);
    }
}

function showSeasonResult(rank, total, league, change, reward, champion) {
    resetCategoriesDiv();
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
        toPersianNumber(rank) + ' از ' + toPersianNumber(total) + '</div>' +
        '<div style="margin-top:10px">' + change + '</div>' +
        (reward
            ? '<div style="margin-top:16px;padding:12px;background:#fff3;' +
              'border-radius:14px;font-weight:900">جایزه: 🪙 ' +
              toPersianNumber(reward) + '</div>'
            : "") +
        (champion
            ? '<div style="margin-top:10px;font-weight:800">' +
              'جام در صفحه افتخارات ثبت شد</div>'
            : "");

    const btn = document.createElement("button");
    btn.className = "category next";
    btn.style.marginTop = "20px";
    btn.textContent = "بازگشت به خانه";
    btn.onclick = showHomeScreen;
    card.appendChild(btn);

    categoriesDiv.appendChild(card);
}

/* ============================================
   خطا
   ============================================ */

function showError(message) {
    resetCategoriesDiv();
    const error = document.createElement("h3");
    error.textContent = message;
    error.style.cssText = "text-align:center;margin-top:40px;";
    categoriesDiv.appendChild(error);
    const back = document.createElement("button");
    back.textContent = "بازگشت";
    back.className = "category";
    back.style.marginTop = "16px";
    back.onclick = showGameModeScreen;
    categoriesDiv.appendChild(back);
}

/* ============================================
   🚪 خروج از اپ
   ============================================ */

function performAppExit() {
    isExitingApp = true;

    try { if (typeof Music !== "undefined" && Music.stop) Music.stop(); } catch (e) {}
    try { User.hideTopBar(); User.hideBottomBar(); } catch (e) {}

    function stillVisible() {
        return document.visibilityState === "visible";
    }

    function tryNativeExit() {
        try {
            if (typeof window.Capacitor !== "undefined" &&
                window.Capacitor.Plugins &&
                window.Capacitor.Plugins.App &&
                typeof window.Capacitor.Plugins.App.exitApp === "function") {
                window.Capacitor.Plugins.App.exitApp();
                return true;
            }
        } catch (e) {}
        try {
            if (typeof navigator !== "undefined" && navigator.app &&
                typeof navigator.app.exitApp === "function") {
                navigator.app.exitApp();
                return true;
            }
        } catch (e) {}
        try {
            if (window.Android && typeof window.Android.exitApp === "function") {
                window.Android.exitApp();
                return true;
            }
        } catch (e) {}
        try {
            if (typeof window.close === "function") window.close();
        } catch (e) {}
        return false;
    }

    function showClosedScreen() {
        isExitingApp = false;
        try {
            document.body.innerHTML =
                '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;' +
                'background:linear-gradient(180deg,#0f172a,#1e3a8a);padding:24px;font-family:Tahoma,Arial,sans-serif;direction:rtl;">' +
                '<div style="max-width:360px;width:100%;background:#fff;border-radius:24px;padding:28px 22px;text-align:center;' +
                'box-shadow:0 12px 40px rgba(0,0,0,0.35);">' +
                '<div style="font-size:56px;margin-bottom:12px;">👋</div>' +
                '<div style="font-size:22px;font-weight:900;color:#0f172a;margin-bottom:10px;">خداحافظ</div>' +
                '<div style="font-size:14px;font-weight:700;color:#64748b;line-height:1.9;margin-bottom:18px;">' +
                'برنامه بسته شد. پیشرفتت ذخیره شده.<br>این تب یا پنجره را ببند.</div>' +
                '<button type="button" id="exitCloseTabBtn" style="width:100%;padding:14px;border-radius:16px;border:3px solid #93c5fd;' +
                'background:linear-gradient(180deg,#3b82f6,#1d4ed8);color:#fff;font-size:15px;font-weight:900;' +
                'font-family:inherit;cursor:pointer;touch-action:manipulation;">بستن</button>' +
                '</div></div>';
            const btn = document.getElementById("exitCloseTabBtn");
            if (btn) {
                btn.onclick = function () {
                    tryNativeExit();
                    try { window.close(); } catch (e) {}
                    try { window.location.href = "about:blank"; } catch (e) {}
                };
            }
        } catch (e) {
            console.error(e);
        }
    }

    tryNativeExit();

    setTimeout(function () {
        if (stillVisible()) {
            showClosedScreen();
        } else {
            isExitingApp = false;
        }
    }, 250);
}

function setupBackButtonGuard() {
    let backPressCount = 0;
    let backTimer = null;
    let exitModalOpen = false;

    try { history.pushState({ guard: true }, "", location.href); } catch (e) {}

    window.addEventListener("popstate", function () {
        if (isExitingApp) return;
        try { history.pushState({ guard: true }, "", location.href); } catch (e) {}

        const quizExitBtn = document.querySelector(".exit-btn");
        if (quizExitBtn) {
            quizExitBtn.click();
            backPressCount = 0;
            exitModalOpen = false;
            if (backTimer) { clearTimeout(backTimer); backTimer = null; }
            return;
        }

        if (document.getElementById("appExitModal")) {
            return;
        }

        const user = Users.loadCurrent();
        if (!user) return;

        backPressCount++;

        if (backPressCount === 1 || !exitModalOpen) {
            exitModalOpen = true;
            showExitAppModal(function (shouldExit) {
                exitModalOpen = false;
                backPressCount = 0;
                if (backTimer) { clearTimeout(backTimer); backTimer = null; }
            });
            if (backTimer) clearTimeout(backTimer);
            backTimer = setTimeout(function () {
                backPressCount = 0;
                backTimer = null;
            }, 4000);
        } else if (backPressCount >= 2) {
            if (backTimer) { clearTimeout(backTimer); backTimer = null; }
            backPressCount = 0;
            exitModalOpen = false;
            const existing = document.getElementById("appExitModal");
            if (existing) existing.remove();
            performAppExit();
        }
    });
}

/* ============================================
   راه‌اندازی
   ============================================ */

function init() {
    setupMusicOnClick();
    try { if (typeof Music !== "undefined" && Music.init) Music.init(); } catch (e) {}
    setupBackButtonGuard();

    Users.repairUsernameIfMissing();
    try { Subscription.cleanup(); } catch (e) {}

    // sync از سرور
    (async function syncFromServer() {
        const user = Users.loadCurrent();
        if (!user) return;
        try {
            const data = await supabaseFetch("user-get", {
                body: JSON.stringify({ phone: user.phone })
            });
            if (data && data.ok && data.user) {
                const merged = Users._mergeWithLocal(data.user);
                Users.saveCurrent(merged);
            }
        } catch (e) {
            console.warn("آفلاین — از داده محلی استفاده می‌شود");
        }
    })();

    const currentUser = Users.loadCurrent();
    if (currentUser) {
        const avatarIsValid = isValidAvatar(currentUser.avatar, currentUser);

        if (!currentUser.username || currentUser.username.trim().length === 0) {
            showSetUsernameModal(function () {
                if (!avatarIsValid) showAvatarScreen();
                else showHomeScreen();
            }, false);
            return;
        }
        if (!avatarIsValid) {
            Users.updateCurrent({ avatar: AVATARS[0] });
            showAvatarScreen();
        } else {
            showHomeScreen();
        }
    } else {
        showLoginScreen();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 100); });
} else {
    setTimeout(init, 100);
}
