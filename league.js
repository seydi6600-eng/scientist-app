/* ============================================
   league.js — فرانت‌اند لیگ (نسخه ۱.۱ اصلاح‌شده)
   ============================================ */

// ─── تنظیمات ───
const LEAGUE_API = "/league";

const LEAGUE_NAMES = {
    division3: { name: "لیگ دسته ۳", emoji: "🥉", color: "#cd7f32", shadow: "#92400e" },
    division2: { name: "لیگ دسته ۲", emoji: "🥈", color: "#94a3b8", shadow: "#475569" },
    division1: { name: "لیگ دسته ۱", emoji: "🥇", color: "#fbbf24", shadow: "#b45309" },
    premier:   { name: "لیگ برتر",   emoji: "👑", color: "#a855f7", shadow: "#6b21a8" }
};

// ─── State ───
let leaguePollTimer = null;
let leagueState = null;
let leagueRendering = false; // ✅ جلوگیری از رندر تکراری

// ─── Fallback برای توابعی که از app.js میان ───
function _safeEscapeHtml(text) {
    if (typeof escapeHtml === "function") return escapeHtml(text);
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function _safeToPersianNumber(num) {
    if (typeof toPersianNumber === "function") return toPersianNumber(num);
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(num).replace(/\d/g, d => persian[d]).replace(/,/g, "٬");
}

function _safeGetAvatarHTML(avatarId, size) {
    if (typeof getAvatarHTML === "function") return getAvatarHTML(avatarId, size);
    return "👤";
}

// ─── API Helper ───
async function leagueRequest(path, options = {}) {
    const token = (typeof Auth !== "undefined" && Auth.getToken) ? Auth.getToken() : null;
    const method = options.method || "GET";
    
    const headers = {
        "Content-Type": "application/json"
    };
    if (token) headers["Authorization"] = "Bearer " + token;
    
    const fetchOptions = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
        fetchOptions.body = options.body ? JSON.stringify(options.body) : JSON.stringify({});
    }
    
    let response;
    try {
        response = await fetch(LEAGUE_API + path, fetchOptions);
    } catch (netErr) {
        return { ok: false, error: "خطای اتصال به سرور" };
    }
    
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch (_) {
        data = { ok: false, error: "پاسخ نامعتبر از سرور" };
    }
    
    if (!response.ok && !data.error) {
        data.error = "خطای سرور (" + response.status + ")";
    }
    return data;
}

// ─── پاک کردن تایمرها ───
function clearLeagueTimer() {
    if (leaguePollTimer) { clearInterval(leaguePollTimer); leaguePollTimer = null; }
}
function clearLeaguePoll() {
    if (leaguePollTimer) { clearInterval(leaguePollTimer); leaguePollTimer = null; }
}

// ─── تابع اصلی که از app.js فراخوانی می‌شود ───
async function showLeagueMain() {
    clearLeagueTimer();
    leagueRendering = false;
    
    // ✅ چک امنیتی برای توابع وابسته
    if (typeof resetCategoriesDiv !== "function" ||
        typeof User === "undefined" ||
        typeof Users === "undefined") {
        console.error("league.js: توابع وابسته به app.js یافت نشد");
        return;
    }
    
    resetCategoriesDiv();
    categoriesDiv.classList.remove("no-scroll");
    categoriesDiv.style.overflow = "auto";
    User.showBottomBar();
    setActiveTab("league");
    playMusicMain();
    
    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }
    User.updateTopBar();
    
    // بررسی سطح کاربر
    if ((user.level || 1) < 10) {
        showLeagueLevelRequired(user.level || 1);
        return;
    }
    
    // نمایش لودینگ
    showLeagueLoading();
    
    // دریافت وضعیت فعلی
    const stateRes = await leagueRequest("/state");
    
    if (!stateRes.ok) {
        showLeagueError(stateRes.error || "خطا در دریافت وضعیت لیگ");
        return;
    }
    
    // اگر عضو گروه است
    if (stateRes.state) {
        leagueState = stateRes.state;
        renderLeagueGroup(stateRes.state);
        return;
    }
    
    // اگر عضو نیست — نمایش صفحه ثبت‌نام
    const statusRes = await leagueRequest("/registration-status");
    if (!statusRes.ok) {
        showLeagueError(statusRes.error || "خطا در دریافت وضعیت ثبت‌نام");
        return;
    }
    
    if (statusRes.inQueue) {
        renderLeagueQueue(statusRes);
        startQueuePolling();
    } else {
        renderLeagueRegister();
    }
}

// ─── نمایش لودینگ ───
function showLeagueLoading() {
    categoriesDiv.innerHTML = "";
    const box = document.createElement("div");
    box.style.cssText =
        "max-width:520px;margin:60px auto;padding:40px 20px;text-align:center;";
    box.innerHTML =
        '<div style="font-size:70px;animation:pulse 1.5s ease infinite;">🏆</div>' +
        '<div style="font-size:18px;font-weight:900;color:#1e40af;margin-top:16px;">' +
        'در حال بارگذاری لیگ...</div>';
    categoriesDiv.appendChild(box);
}

// ─── نمایش خطا ───
function showLeagueError(message) {
    resetCategoriesDiv();
    const box = document.createElement("div");
    box.style.cssText =
        "max-width:520px;margin:40px auto;padding:24px;text-align:center;" +
        "background:#fee2e2;border:3px solid #dc2626;border-radius:20px;";
    box.innerHTML =
        '<div style="font-size:60px;margin-bottom:12px;">⚠️</div>' +
        '<div style="font-size:16px;font-weight:900;color:#991b1b;margin-bottom:16px;">' +
        _safeEscapeHtml(message) + '</div>';
    
    // دکمه تلاش دوباره
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "🔄 تلاش دوباره";
    retryBtn.style.cssText =
        "width:100%;padding:12px 24px;margin-bottom:10px;border-radius:14px;" +
        "background:linear-gradient(180deg,#3b82f6,#1e40af);" +
        "color:white;border:3px solid #60a5fa;" +
        "font-family:inherit;font-size:14px;font-weight:900;" +
        "cursor:pointer;box-shadow:0 5px 0 #1e3a8a;";
    retryBtn.onclick = function () { showLeagueMain(); };
    box.appendChild(retryBtn);
    
    const backBtn = document.createElement("button");
    backBtn.textContent = "🏠 بازگشت به خانه";
    backBtn.style.cssText =
        "width:100%;padding:12px 24px;border-radius:14px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-family:inherit;font-size:14px;font-weight:900;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);
    
    categoriesDiv.appendChild(box);
}

// ─── نیاز به سطح ۱۰ ───
function showLeagueLevelRequired(currentLevel) {
    resetCategoriesDiv();
    const box = document.createElement("div");
    box.style.cssText =
        "max-width:520px;margin:40px auto;padding:30px 24px;text-align:center;";
    
    const card = document.createElement("div");
    card.style.cssText =
        "padding:32px 24px;border-radius:28px;" +
        "background:linear-gradient(135deg,#7c3aed,#a855f7,#c084fc);" +
        "color:white;border:4px solid #c4b5fd;" +
        "box-shadow:0 10px 0 #5b21b6,0 20px 60px rgba(124,58,237,0.4);";
    
    const pct = Math.min(100, (currentLevel / 10) * 100);
    
    card.innerHTML =
        '<div style="font-size:80px;line-height:1;margin-bottom:12px;">🔒</div>' +
        '<div style="font-size:24px;font-weight:900;margin-bottom:8px;">لیگ هنوز باز نشده!</div>' +
        '<div style="font-size:14px;opacity:0.95;line-height:1.9;margin-bottom:20px;">' +
        'برای ورود به لیگ هفتگی، باید به سطح <b>' + _safeToPersianNumber(10) + '</b> برسی.' +
        '</div>' +
        '<div style="width:100%;height:16px;background:rgba(0,0,0,0.3);border-radius:10px;overflow:hidden;margin-bottom:8px;">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#fbbf24,#f59e0b,#fde68a);border-radius:10px;transition:width 0.6s ease;"></div>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:900;margin-bottom:24px;">' +
        'سطح فعلی: ' + _safeToPersianNumber(currentLevel) + ' از ' + _safeToPersianNumber(10) +
        '</div>' +
        '<div style="font-size:12px;opacity:0.85;font-weight:700;">' +
        'فقط ' + _safeToPersianNumber(10 - currentLevel) + ' سطح دیگه مونده! 💪</div>';
    
    box.appendChild(card);
    
    const backBtn = document.createElement("button");
    backBtn.textContent = "🏠 بازگشت به خانه";
    backBtn.style.cssText =
        "width:100%;padding:16px;margin-top:16px;border-radius:16px;" +
        "background:linear-gradient(180deg,#22c55e,#16a34a);" +
        "color:white;border:3px solid #4ade80;" +
        "font-family:inherit;font-size:15px;font-weight:900;" +
        "cursor:pointer;box-shadow:0 6px 0 #14532d;";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);
    
    categoriesDiv.appendChild(box);
}

// ─── صفحه ثبت‌نام ───
function renderLeagueRegister() {
    resetCategoriesDiv();
    categoriesDiv.innerHTML = "";
    categoriesDiv.style.overflow = "auto";
    User.showBottomBar();
    
    const box = document.createElement("div");
    box.style.cssText = "max-width:520px;margin:0 auto;padding:20px;";
    
    // هدر
    const header = document.createElement("div");
    header.style.cssText =
        "padding:28px 22px;border-radius:26px;text-align:center;color:white;" +
        "background:linear-gradient(135deg,#1e40af,#3b82f6,#8b5cf6);" +
        "box-shadow:0 10px 30px rgba(30,64,175,0.4);margin-bottom:18px;";
    header.innerHTML =
        '<div style="font-size:70px;margin-bottom:10px;">🏆</div>' +
        '<div style="font-size:24px;font-weight:900;">لیگ هفتگی دانشمند</div>' +
        '<div style="font-size:13px;opacity:0.95;margin-top:8px;font-weight:700;line-height:1.8;">' +
        'هر هفته با ۱۰ بازیکن دیگه رقابت کن<br>و به لیگ‌های بالاتر صعود کن!</div>';
    box.appendChild(header);
    
    // انتخاب لیگ
    const selectTitle = document.createElement("div");
    selectTitle.textContent = "🎯 لیگ خودت رو انتخاب کن";
    selectTitle.style.cssText =
        "font-size:15px;font-weight:900;color:#1e40af;text-align:center;margin:20px 0 12px;";
    box.appendChild(selectTitle);
    
    const leagues = [
        { id: "division3", name: "لیگ دسته ۳", emoji: "🥉", price: 100, desc: "شروع از پایین‌ترین سطح",
          gradient: "linear-gradient(135deg,#92400e,#cd7f32,#fbbf24)", borderColor: "#fcd34d", shadowColor: "#78350f" },
        { id: "division2", name: "لیگ دسته ۲", emoji: "🥈", price: 200, desc: "برای بازیکنان متوسط",
          gradient: "linear-gradient(135deg,#475569,#94a3b8,#cbd5e1)", borderColor: "#e2e8f0", shadowColor: "#1e293b" },
        { id: "division1", name: "لیگ دسته ۱", emoji: "🥇", price: 300, desc: "برای حرفه‌ای‌ها",
          gradient: "linear-gradient(135deg,#b45309,#fbbf24,#fde68a)", borderColor: "#fef3c7", shadowColor: "#78350f" },
        { id: "premier",   name: "لیگ برتر",   emoji: "👑", price: 500, desc: "بالاترین سطح رقابت",
          gradient: "linear-gradient(135deg,#6b21a8,#a855f7,#c084fc)", borderColor: "#e9d5ff", shadowColor: "#4c1d95" }
    ];
    
    const user = Users.loadCurrent();
    const userCoins = user ? (user.coins || 0) : 0;
    
    leagues.forEach(function (lg) {
        const canAfford = userCoins >= lg.price;
        
        const card = document.createElement("button");
        card.style.cssText =
            "position:relative;width:100%;padding:16px 18px;margin-bottom:12px;" +
            "background:" + lg.gradient + ";" +
            "border:3px solid " + lg.borderColor + ";" +
            "border-radius:20px;cursor:pointer;overflow:hidden;" +
            "font-family:inherit;text-align:right;" +
            "box-shadow:0 6px 0 " + lg.shadowColor + ";" +
            "display:flex;align-items:center;gap:14px;" +
            "opacity:" + (canAfford ? "1" : "0.65") + ";";
        
        const emoji = document.createElement("div");
        emoji.textContent = lg.emoji;
        emoji.style.cssText = "font-size:44px;line-height:1;flex-shrink:0;";
        card.appendChild(emoji);
        
        const info = document.createElement("div");
        info.style.cssText = "flex:1;";
        info.innerHTML =
            '<div style="font-size:17px;font-weight:900;color:white;text-shadow:0 2px 4px rgba(0,0,0,0.4);margin-bottom:4px;">' + lg.name + '</div>' +
            '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:6px;">' + lg.desc + '</div>' +
            '<div style="display:inline-block;font-size:12px;font-weight:900;color:white;background:rgba(0,0,0,0.25);padding:4px 10px;border-radius:10px;">' +
            '🪙 ' + _safeToPersianNumber(lg.price) + ' سکه</div>';
        card.appendChild(info);
        
        card.onclick = function () {
            if (!canAfford) {
                showInfoModal({
                    emoji: "💰", title: "سکه کافی نداری!",
                    message: "برای ورود به " + lg.name + " به " + _safeToPersianNumber(lg.price) + " سکه نیاز داری.\n" +
                        "موجودی فعلی: " + _safeToPersianNumber(userCoins) + " سکه",
                    color: "#dc2626", shadow: "#7f1d1d"
                });
                return;
            }
            showConfirmModal({
                emoji: "🏆", title: "تأیید ورود به " + lg.name,
                message: "هزینه ورود: " + _safeToPersianNumber(lg.price) + " سکه\n" +
                    "موجودی بعد از پرداخت: " + _safeToPersianNumber(userCoins - lg.price) + " سکه",
                color: "#3b82f6", shadow: "#1e40af",
                confirmText: "✅ ورود به لیگ", cancelText: "لغو",
                onConfirm: function () { registerInLeague(lg.id, lg.price); }
            });
        };
        
        box.appendChild(card);
    });
    
    // توضیحات
    const tip = document.createElement("div");
    tip.style.cssText =
        "padding:14px 16px;margin-top:10px;border-radius:16px;" +
        "background:linear-gradient(135deg,#dbeafe,#bfdbfe);" +
        "border:2px dashed #3b82f6;text-align:center;" +
        "font-size:12px;font-weight:800;color:#1e40af;line-height:1.9;";
    tip.innerHTML =
        '💡 پس از ثبت‌نام، تا رسیدن به <b>' + _safeToPersianNumber(80) + ' نفر</b> در صف می‌مونی.<br>' +
        'وقتی ۸۰ نفر کامل شد، گروه‌بندی انجام می‌شه و مسابقات شروع می‌شن.';
    box.appendChild(tip);
    
    categoriesDiv.appendChild(box);
}

// ─── ثبت‌نام در لیگ ───
async function registerInLeague(leagueId, price) {
    showLeagueLoading();
    
    const user = Users.loadCurrent();
    if (!user || user.coins < price) {
        showLeagueError("سکه کافی نداری");
        return;
    }
    
    // ✅ اول درخواست سرور، بعد پرداخت (یا برعکس با rollback دقیق)
    const res = await leagueRequest("/register", {
        method: "POST",
        body: { leagueId: leagueId, paidAmount: price }
    });
    
    if (!res.ok) {
        showLeagueError(res.error || "خطا در ثبت‌نام");
        return;
    }
    
    // حالا پرداخت کن
    const paid = await Shop.addCoins(-price, "league_entry_" + leagueId);
    if (!paid) {
        // اگه پرداخت نشد، از سرور بخواه لغو کنه
        await leagueRequest("/cancel", { method: "POST" });
        showLeagueError("خطا در پرداخت");
        return;
    }
    
    if (res.status === "bootstrapped") {
        showLeagueSuccess("🎉 گروه‌بندی انجام شد!");
        setTimeout(function () { showLeagueMain(); }, 1500);
        return;
    }
    
    // در صف انتظار
    renderLeagueQueue({
        inQueue: true,
        registered: res.registered || 1,
        needed: res.needed || 80
    });
    startQueuePolling();
}

// ─── نمایش صف انتظار ───
function renderLeagueQueue(status) {
    resetCategoriesDiv();
    categoriesDiv.innerHTML = "";
    categoriesDiv.style.overflow = "auto";
    User.showBottomBar();
    
    const box = document.createElement("div");
    box.style.cssText = "max-width:520px;margin:0 auto;padding:20px;";
    
    const registered = status.registered || 0;
    const needed = status.needed || 80;
    const pct = Math.min(100, (registered / needed) * 100);
    
    const card = document.createElement("div");
    card.style.cssText =
        "padding:32px 24px;border-radius:28px;text-align:center;color:white;" +
        "background:linear-gradient(135deg,#1e40af,#3b82f6,#06b6d4);" +
        "box-shadow:0 10px 0 #1e3a8a,0 20px 60px rgba(30,64,175,0.4);";
    
    card.innerHTML =
        '<div style="font-size:80px;margin-bottom:12px;animation:pulse 2s ease infinite;">⏳</div>' +
        '<div style="font-size:22px;font-weight:900;margin-bottom:8px;">در صف انتظار</div>' +
        '<div style="font-size:13px;opacity:0.95;margin-bottom:24px;font-weight:700;line-height:1.8;">' +
        'وقتی ۸۰ نفر کامل شن، گروه‌بندی انجام می‌شه</div>' +
        
        '<div style="width:100%;height:20px;background:rgba(0,0,0,0.3);border-radius:12px;overflow:hidden;margin-bottom:10px;">' +
        '<div id="leagueQueueBar" style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#fbbf24,#f59e0b,#fde68a);border-radius:12px;transition:width 0.6s ease;"></div>' +
        '</div>' +
        
        '<div style="font-size:18px;font-weight:900;">' +
        '<span id="leagueQueueCount">' + _safeToPersianNumber(registered) + '</span>' +
        ' از ' + _safeToPersianNumber(needed) + ' نفر' +
        '</div>' +
        
        '<div style="font-size:12px;opacity:0.85;margin-top:8px;font-weight:700;">' +
        'هنوز ' + _safeToPersianNumber(needed - registered) + ' نفر مونده</div>';
    
    box.appendChild(card);
    
    // دکمه لغو
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌ لغو ثبت‌نام";
    cancelBtn.style.cssText =
        "width:100%;padding:16px;margin-top:16px;border-radius:16px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-family:inherit;font-size:15px;font-weight:900;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    cancelBtn.onclick = async function () {
        clearLeagueTimer();
        showConfirmModal({
            emoji: "❌", title: "لغو ثبت‌نام",
            message: "مطمئنی می‌خوای ثبت‌نامت رو لغو کنی؟\nسکه‌هات برگردونده می‌شه.",
            color: "#ef4444", shadow: "#7f1d1d",
            confirmText: "لغو کن", cancelText: "بمون",
            onConfirm: async function () {
                const res = await leagueRequest("/cancel", { method: "POST" });
                if (res.ok && res.refund) {
                    await Shop.addCoins(res.refund, "league_cancel_refund");
                }
                showLeagueMain();
            }
        });
    };
    box.appendChild(cancelBtn);
    
    categoriesDiv.appendChild(box);
}

// ─── شروع polling صف (هر ۱۰ ثانیه) ───
function startQueuePolling() {
    clearLeagueTimer();
    leaguePollTimer = setInterval(async function () {
        const res = await leagueRequest("/registration-status");
        if (!res.ok) return;
        
        const bar = document.getElementById("leagueQueueBar");
        const count = document.getElementById("leagueQueueCount");
        
        if (bar && res.registered !== undefined && res.needed) {
            const pct = Math.min(100, (res.registered / res.needed) * 100);
            bar.style.width = pct + "%";
        }
        if (count && res.registered !== undefined) {
            count.textContent = _safeToPersianNumber(res.registered);
        }
        
        // اگر از صف خارج شد و عضو گروه شد
        if (!res.inQueue) {
            clearLeagueTimer();
            showLeagueMain();
        }
    }, 10000); // ✅ ۱۰ ثانیه به جای ۵
}

// ─── نمایش گروه ───
function renderLeagueGroup(state) {
    clearLeagueTimer();
    resetCategoriesDiv();
    categoriesDiv.innerHTML = "";
    categoriesDiv.style.overflow = "auto";
    User.showBottomBar();
    
    const user = Users.loadCurrent();
    const myPhone = user ? user.phone : null;
    const leagueId = state.leagueId;
    const league = LEAGUE_NAMES[leagueId] || { name: "لیگ", emoji: "🏆", color: "#3b82f6", shadow: "#1e40af" };
    
    const players = state.group.players || [];
    const matches = state.group.matches || [];
    
    // مرتب‌سازی اعضا بر اساس امتیاز
    const sortedPlayers = players.slice().sort(function (a, b) {
        return (b.points || 0) - (a.points || 0);
    });
    
    const box = document.createElement("div");
    box.style.cssText = "max-width:520px;margin:0 auto;padding:20px;";
    
    // هدر لیگ
    const header = document.createElement("div");
    header.style.cssText =
        "padding:24px 20px;border-radius:24px;text-align:center;color:white;" +
        "background:linear-gradient(135deg," + league.color + "," + league.shadow + ");" +
        "box-shadow:0 8px 0 " + league.shadow + ";margin-bottom:16px;";
    header.innerHTML =
        '<div style="font-size:60px;margin-bottom:8px;">' + league.emoji + '</div>' +
        '<div style="font-size:22px;font-weight:900;">' + league.name + '</div>' +
        '<div style="font-size:13px;opacity:0.95;margin-top:6px;font-weight:700;">' +
        'گروه ' + _safeToPersianNumber(state.group.number) + ' — ' + _safeToPersianNumber(players.length) + ' بازیکن' +
        '</div>';
    box.appendChild(header);
    
    // جدول امتیازات
    const tableTitle = document.createElement("div");
    tableTitle.textContent = "📊 جدول امتیازات";
    tableTitle.style.cssText =
        "font-size:15px;font-weight:900;color:#1e40af;margin:18px 0 10px;";
    box.appendChild(tableTitle);
    
    const table = document.createElement("div");
    table.style.cssText =
        "background:white;border:3px solid #3b82f6;border-radius:18px;" +
        "padding:12px;box-shadow:0 5px 0 #1e40af;";
    
    sortedPlayers.forEach(function (p, i) {
        const isMe = p.phone === myPhone;
        const row = document.createElement("div");
        row.style.cssText =
            "display:flex;align-items:center;gap:10px;padding:10px 8px;" +
            "border-bottom:" + (i < sortedPlayers.length - 1 ? "1px solid #e2e8f0" : "none") + ";" +
            (isMe ? "background:#dbeafe;border-radius:10px;" : "");
        
        // رتبه
        const rank = document.createElement("div");
        rank.textContent = _safeToPersianNumber(i + 1);
        rank.style.cssText =
            "width:30px;height:30px;border-radius:50%;" +
            "display:flex;align-items:center;justify-content:center;" +
            "font-size:13px;font-weight:900;color:white;" +
            "background:" + (i === 0 ? "#fbbf24" : (i === 1 ? "#94a3b8" : (i === 2 ? "#cd7f32" : "#64748b"))) + ";";
        row.appendChild(rank);
        
        // آواتار
        const avatar = document.createElement("div");
        avatar.style.cssText =
            "width:36px;height:36px;border-radius:50%;" +
            "display:flex;align-items:center;justify-content:center;" +
            "font-size:22px;background:#f1f5f9;overflow:hidden;";
        avatar.innerHTML = _safeGetAvatarHTML(p.avatar, 34);
        row.appendChild(avatar);
        
        // نام
        const name = document.createElement("div");
        name.textContent = p.username || "کاربر";
        name.style.cssText =
            "flex:1;font-size:13px;font-weight:900;color:#1e293b;" +
            "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        if (isMe) name.style.color = "#1e40af";
        row.appendChild(name);
        
        // امتیاز
        const points = document.createElement("div");
        points.textContent = _safeToPersianNumber(p.points || 0);
        points.style.cssText =
            "font-size:15px;font-weight:900;color:#f59e0b;" +
            "background:#fef3c7;padding:4px 10px;border-radius:10px;";
        row.appendChild(points);
        
        table.appendChild(row);
    });
    
    box.appendChild(table);
    
    // مسابقات
    const matchesTitle = document.createElement("div");
    matchesTitle.textContent = "⚔️ مسابقات هفته";
    matchesTitle.style.cssText =
        "font-size:15px;font-weight:900;color:#1e40af;margin:20px 0 10px;";
    box.appendChild(matchesTitle);
    
    if (matches.length === 0) {
        const noMatches = document.createElement("div");
        noMatches.textContent = "هنوز مسابقه‌ای برنامه‌ریزی نشده";
        noMatches.style.cssText =
            "text-align:center;padding:20px;color:#64748b;font-weight:700;" +
            "background:#f1f5f9;border-radius:14px;";
        box.appendChild(noMatches);
    } else {
        matches.forEach(function (m) {
            const isMyMatch = m.homeId === "user_" + myPhone || m.awayId === "user_" + myPhone;
            
            const matchCard = document.createElement("div");
            matchCard.style.cssText =
                "padding:14px;margin-bottom:10px;background:white;" +
                "border:3px solid " + (isMyMatch ? "#f59e0b" : "#cbd5e1") + ";" +
                "border-radius:16px;" +
                "box-shadow:0 4px 0 " + (isMyMatch ? "#b45309" : "#94a3b8") + ";";
            
            const statusMap = {
                scheduled: { text: "⏳ در انتظار", color: "#f59e0b" },
                completed: { text: "✅ انجام شده", color: "#10b981" },
                forfeit: { text: "⚠️ انصراف", color: "#dc2626" }
            };
            const st = statusMap[m.status] || { text: m.status, color: "#64748b" };
            
            matchCard.innerHTML =
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
                '<span style="font-size:11px;font-weight:900;color:#64748b;">دور ' + _safeToPersianNumber(m.round) + '</span>' +
                '<span style="font-size:11px;font-weight:900;color:' + st.color + ';background:#f1f5f9;padding:2px 8px;border-radius:8px;">' + st.text + '</span>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;">' +
                '<div style="text-align:center;">' +
                '<div style="font-size:11px;font-weight:900;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _safeEscapeHtml(m.homeName) + '</div>' +
                '<div style="font-size:18px;font-weight:900;color:#3b82f6;">' + (m.homeScore !== null && m.homeScore !== undefined ? _safeToPersianNumber(m.homeScore) : "-") + '</div>' +
                '</div>' +
                '<div style="font-size:16px;">⚔️</div>' +
                '<div style="text-align:center;">' +
                '<div style="font-size:11px;font-weight:900;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _safeEscapeHtml(m.awayName) + '</div>' +
                '<div style="font-size:18px;font-weight:900;color:#dc2626;">' + (m.awayScore !== null && m.awayScore !== undefined ? _safeToPersianNumber(m.awayScore) : "-") + '</div>' +
                '</div>' +
                '</div>';
            
            // دکمه ثبت امتیاز
            const mySubmission = (m.homeId === "user_" + myPhone) ? m.homeSubmitted : m.awaySubmitted;
            const isCompleted = m.status === "completed" || m.status === "forfeit";
            
            if (isMyMatch && !mySubmission && !isCompleted) {
                const playBtn = document.createElement("button");
                playBtn.textContent = "🎮 ثبت امتیاز";
                playBtn.style.cssText =
                    "width:100%;padding:10px;margin-top:10px;border-radius:12px;" +
                    "background:linear-gradient(180deg,#22c55e,#16a34a);" +
                    "color:white;border:3px solid #4ade80;" +
                    "font-family:inherit;font-size:13px;font-weight:900;" +
                    "cursor:pointer;box-shadow:0 4px 0 #14532d;";
                playBtn.onclick = function () { showSubmitScoreModal(m); };
                matchCard.appendChild(playBtn);
            }
            
            box.appendChild(matchCard);
        });
    }
    
    // دکمه بازگشت
    const backBtn = document.createElement("button");
    backBtn.textContent = "🏠 بازگشت به خانه";
    backBtn.style.cssText =
        "width:100%;padding:16px;margin-top:16px;border-radius:16px;" +
        "background:linear-gradient(180deg,#94a3b8,#64748b);" +
        "color:white;border:3px solid #cbd5e1;" +
        "font-family:inherit;font-size:15px;font-weight:900;" +
        "cursor:pointer;box-shadow:0 5px 0 #334155;";
    backBtn.onclick = showHomeScreen;
    box.appendChild(backBtn);
    
    categoriesDiv.appendChild(box);
}

// ─── مودال ثبت امتیاز ───
function showSubmitScoreModal(match) {
    if (document.getElementById("leagueScoreModal")) return;
    
    const modal = document.createElement("div");
    modal.id = "leagueScoreModal";
    modal.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.9);" +
        "backdrop-filter:blur(12px);display:flex;align-items:center;" +
        "justify-content:center;padding:20px;";
    
    const card = document.createElement("div");
    card.style.cssText =
        "width:100%;max-width:400px;background:linear-gradient(180deg,#ffffff,#f0f4ff);" +
        "border:4px solid #3b82f6;border-radius:28px;padding:30px 24px;" +
        "text-align:center;box-shadow:0 20px 0 #1e40af,0 30px 80px rgba(30,64,175,0.5);";
    
    card.innerHTML =
        '<div style="font-size:60px;margin-bottom:12px;">🎮</div>' +
        '<div style="font-size:20px;font-weight:900;color:#1e293b;margin-bottom:8px;">ثبت امتیاز مسابقه</div>' +
        '<div style="font-size:13px;color:#64748b;margin-bottom:20px;font-weight:700;">' +
        'امتیاز خودت رو بین ۰ تا ۹ وارد کن' +
        '</div>';
    
    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.min = "0";
    input.max = "9";
    input.placeholder = "۰";
    input.style.cssText =
        "width:100%;padding:16px;margin-bottom:16px;border:3px solid #3b82f6;" +
        "border-radius:14px;font-family:inherit;font-size:24px;font-weight:900;" +
        "text-align:center;background:white;color:#1e293b;outline:none;" +
        "box-sizing:border-box;direction:ltr;";
    card.appendChild(input);
    
    const errorMsg = document.createElement("div");
    errorMsg.style.cssText = "font-size:12px;font-weight:900;color:#dc2626;min-height:16px;margin-bottom:10px;";
    card.appendChild(errorMsg);
    
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "✅ ثبت امتیاز";
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
    
    saveBtn.onclick = async function () {
        const raw = input.value.trim();
        const score = parseInt(raw, 10);
        if (raw === "" || isNaN(score) || score < 0 || score > 9) {
            errorMsg.textContent = "❌ امتیاز باید بین ۰ تا ۹ باشه";
            return;
        }
        
        saveBtn.disabled = true;
        saveBtn.style.opacity = "0.6";
        saveBtn.textContent = "⏳ در حال ثبت...";
        
        const res = await leagueRequest("/matches/" + match.id + "/score", {
            method: "POST",
            body: { score: score }
        });
        
        if (!res.ok) {
            errorMsg.textContent = "❌ " + (res.error || "خطا در ثبت");
            saveBtn.disabled = false;
            saveBtn.style.opacity = "1";
            saveBtn.textContent = "✅ ثبت امتیاز";
            return;
        }
        
        modal.remove();
        showInfoModal({
            emoji: "✅", title: "امتیاز ثبت شد!",
            message: "امتیاز تو: " + _safeToPersianNumber(score),
            color: "#22c55e", shadow: "#14532d",
            onClose: showLeagueMain
        });
    };
    
    modal.appendChild(card);
    document.body.appendChild(modal);
    
    setTimeout(function () { input.focus(); }, 200);
}

// ─── نمایش موفقیت ───
function showLeagueSuccess(message) {
    resetCategoriesDiv();
    const box = document.createElement("div");
    box.style.cssText =
        "max-width:520px;margin:60px auto;padding:40px 20px;text-align:center;";
    box.innerHTML =
        '<div style="font-size:80px;margin-bottom:16px;">🎉</div>' +
        '<div style="font-size:22px;font-weight:900;color:#1e293b;">' + _safeEscapeHtml(message) + '</div>';
    categoriesDiv.appendChild(box);
}

// ─── صادرات برای استفاده در app.js ───
if (typeof window !== "undefined") {
    window.showLeagueMain = showLeagueMain;
    window.clearLeagueTimer = clearLeagueTimer;
    window.clearLeaguePoll = clearLeaguePoll;
      }
