// @ts-nocheck
/* ============================================
   🛒 فروشگاه — v1.1 (اصلاح‌شده)
   ============================================ */

// ─── Fallback برای توابعی که از app.js میان ───
function _shopEscapeHtml(text) {
    if (typeof escapeHtml === "function") return escapeHtml(text);
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function _shopToPersianNumber(num) {
    if (typeof toPersianNumber === "function") return toPersianNumber(num);
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(num).replace(/\d/g, d => persian[d]).replace(/,/g, "٬");
}

const SHOP_ITEMS = [
    {
        id: "removeTwo",
        icon: "⏭",
        title: "حذف دو گزینه",
        desc: "توی مسابقه دو جواب غلط حذف می‌شه",
        price: 100
    },
    {
        id: "extraTime",
        icon: "⏰",
        title: "+۱۰ ثانیه",
        desc: "توی مسابقه ۱۰ ثانیه به تایمر اضافه می‌شه",
        price: 50
    },
    {
        id: "rename",
        icon: "✏️",
        title: "تغییر نام کاربری",
        desc: "می‌تونی نام کاربریت رو عوض کنی",
        price: 500
    },
    {
        id: "vipAvatar",
        icon: "🎨",
        title: "آواتار ویژه",
        desc: "آواتارهای حرفه‌ای بازی",
        price: 500
    }
];

const COIN_PACKAGES = [
    {
        id: "coins_500",
        icon: "🪙",
        title: "۵۰۰ سکه",
        desc: "بسته کوچیک",
        coins: 500,
        price: 10000,
        tag: ""
    },
    {
        id: "coins_1000",
        icon: "💰",
        title: "۱۰۰۰ سکه",
        desc: "بسته متوسط",
        coins: 1000,
        price: 18000,
        tag: "🎁 ۱۰٪ ارزون‌تر"
    },
    {
        id: "coins_3000",
        icon: "💎",
        title: "۳۰۰۰ سکه",
        desc: "بسته بزرگ",
        coins: 3000,
        price: 48000,
        tag: "⭐ پرطرفدار"
    },
    {
        id: "coins_5000",
        icon: "👑",
        title: "۵۰۰۰ سکه",
        desc: "بسته ویژه",
        coins: 5000,
        price: 75000,
        tag: "🔥 بهترین ارزش"
    }
];

/* ============================================
   صفحه فروشگاه
   ============================================ */
function showShopScreen() {
    // ✅ چک امنیتی
    if (typeof categoriesDiv === "undefined" ||
        typeof User === "undefined" ||
        typeof Users === "undefined") {
        console.error("shop.js: توابع وابسته به app.js یافت نشد");
        return;
    }

    categoriesDiv.innerHTML = "";
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("shop");
    if (typeof Music !== "undefined" && Music.playMain) Music.playMain();

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    User.updateTopBar();
    if (typeof Hearts !== "undefined") Hearts.updateDisplay();

    /* ---------- هدر ---------- */
    const header = document.createElement("div");
    header.className = "shop-header";
    header.innerHTML =
        '<div class="shop-title">🛒 فروشگاه</div>' +
        '<div class="shop-coins">🪙 ' + _shopToPersianNumber(user.coins) + ' سکه</div>';
    categoriesDiv.appendChild(header);

    /* ============================================
       💰 بخش خرید سکه
       ============================================ */
    const coinsTitle = document.createElement("h3");
    coinsTitle.textContent = "💰 خرید سکه";
    coinsTitle.style.cssText =
        "margin: 20px 0 12px; font-size: 16px; " +
        "font-weight: 900; color: #d97706; text-align: center; " +
        "text-shadow: 0 1px 0 rgba(255,255,255,0.8);";
    categoriesDiv.appendChild(coinsTitle);

    const coinsGrid = document.createElement("div");
    coinsGrid.style.cssText =
        "display: grid; grid-template-columns: 1fr 1fr; " +
        "gap: 10px; margin-bottom: 20px;";

    COIN_PACKAGES.forEach(function (pkg) {
        const card = document.createElement("button");
        card.style.cssText =
            "position: relative; " +
            "padding: 16px 10px 14px; " +
            "background: linear-gradient(180deg, #fef3c7, #fde68a); " +
            "border: 3px solid #fbbf24; " +
            "border-radius: 18px; " +
            "box-shadow: 0 5px 0 #92400e, 0 8px 20px rgba(251,191,36,0.3); " +
            "cursor: pointer; " +
            "font-family: inherit; " +
            "transition: transform 0.15s ease; " +
            "display: flex; " +
            "flex-direction: column; " +
            "align-items: center; " +
            "gap: 4px; " +
            "overflow: hidden;";

        if (pkg.tag) {
            const tag = document.createElement("div");
            tag.textContent = pkg.tag;
            tag.style.cssText =
                "position: absolute; top: 0; right: 0; " +
                "background: linear-gradient(180deg, #ef4444, #b91c1c); " +
                "color: white; " +
                "font-size: 9px; font-weight: 900; " +
                "padding: 3px 10px; " +
                "border-radius: 0 15px 0 12px; " +
                "text-shadow: 0 1px 2px rgba(0,0,0,0.3); " +
                "box-shadow: 0 2px 6px rgba(239,68,68,0.4);";
            card.appendChild(tag);
        }

        const iconEl = document.createElement("div");
        iconEl.textContent = pkg.icon;
        iconEl.style.cssText =
            "font-size: 40px; line-height: 1; " +
            "filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2)); " +
            "margin-bottom: 2px;";
        card.appendChild(iconEl);

        const titleEl = document.createElement("div");
        titleEl.textContent = pkg.title;
        titleEl.style.cssText =
            "font-size: 15px; font-weight: 900; color: #92400e; " +
            "text-shadow: 0 1px 0 rgba(255,255,255,0.6);";
        card.appendChild(titleEl);

        const descEl = document.createElement("div");
        descEl.textContent = pkg.desc;
        descEl.style.cssText =
            "font-size: 10px; font-weight: 700; color: #a16207; " +
            "opacity: 0.85;";
        card.appendChild(descEl);

        const priceEl = document.createElement("div");
        priceEl.textContent = _shopToPersianNumber(pkg.price.toLocaleString()) + " تومان";
        priceEl.style.cssText =
            "margin-top: 6px; " +
            "padding: 4px 10px; " +
            "background: linear-gradient(180deg, #22c55e, #16a34a); " +
            "color: white; " +
            "font-size: 11px; font-weight: 900; " +
            "border-radius: 12px; " +
            "box-shadow: 0 2px 0 #14532d; " +
            "text-shadow: 0 1px 2px rgba(0,0,0,0.3);";
        card.appendChild(priceEl);

        card.onclick = function () { handleCoinPurchase(pkg); };

        coinsGrid.appendChild(card);
    });

    categoriesDiv.appendChild(coinsGrid);

    /* ---------- توضیحات ---------- */
    const coinInfoBox = document.createElement("div");
    coinInfoBox.style.cssText =
        "padding: 12px 14px; margin-bottom: 24px; " +
        "background: linear-gradient(180deg, #fef9c3, #fef3c7); " +
        "border: 2px solid #fbbf24; " +
        "border-radius: 14px; " +
        "font-size: 12px; font-weight: 700; " +
        "color: #92400e; line-height: 1.7; text-align: center;";
    coinInfoBox.innerHTML =
        '💡 <b>سکه‌ها کجا خرج می‌شن؟</b><br>' +
        '🎯 خرید آیتم‌های مسابقه (حذف گزینه، زمان اضافه)<br>' +
        '❤️ خرید قلب برای ادامه بازی<br>' +
        '🎨 خرید آواتارهای ویژه<br>' +
        '✏️ تغییر نام کاربری';
    categoriesDiv.appendChild(coinInfoBox);

    /* ============================================
       🎁 بخش آیتم‌های فروشگاه
       ============================================ */
    const itemsTitle = document.createElement("h3");
    itemsTitle.textContent = "🎁 آیتم‌های ویژه";
    itemsTitle.style.cssText =
        "margin: 20px 0 12px; font-size: 16px; " +
        "font-weight: 900; color: #7c3aed; text-align: center; " +
        "text-shadow: 0 1px 0 rgba(255,255,255,0.8);";
    categoriesDiv.appendChild(itemsTitle);

    const grid = document.createElement("div");
    grid.className = "shop-items-grid";

    SHOP_ITEMS.forEach(function(item) {
        const card = document.createElement("div");
        card.className = "shop-item";

        let countText = "";
        let ownedClass = "";
        let btnText = "خرید";
        let btnClass = "";
        let btnDisabled = false;

        if (item.id === "vipAvatar") {
            const owned = (user.vipAvatars || []).length;
            if (owned > 0) {
                countText = '<div class="shop-item-count">✅ ' + _shopToPersianNumber(owned) + ' آواتار داری</div>';
                ownedClass = "owned";
                btnText = "مشاهده";
                btnClass = "owned";
            }
        } else if (item.id === "rename") {
            countText = '<div class="shop-item-count">با هر خرید ۱ بار</div>';
        } else {
            const count = (user.items && user.items[item.id]) || 0;
            if (count > 0) {
                countText = '<div class="shop-item-count">📦 موجودی: ' + _shopToPersianNumber(count) + '</div>';
            }
        }

        if (user.coins < item.price && item.id !== "vipAvatar") {
            btnDisabled = true;
        }

        card.className = "shop-item " + ownedClass;
        card.innerHTML =
            '<div class="shop-item-icon">' + item.icon + '</div>' +
            '<div class="shop-item-info">' +
                '<div class="shop-item-title">' + item.title + '</div>' +
                '<div class="shop-item-desc">' + item.desc + '</div>' +
                countText +
            '</div>' +
            '<div class="shop-item-price">' +
                '<div class="shop-price-value">🪙 ' + _shopToPersianNumber(item.price) + '</div>' +
                '<button class="shop-buy-btn ' + btnClass + '" data-item-id="' + item.id + '"' +
                    (btnDisabled ? ' disabled' : '') + '>' + btnText + '</button>' +
            '</div>';

        grid.appendChild(card);
    });

    categoriesDiv.appendChild(grid);

    /* ---------- راهنما ---------- */
    const infoBox = document.createElement("div");
    infoBox.style.cssText =
        "margin-top:16px; padding:14px; background: white; border: 2px solid #e2e8f0; " +
        "border-radius: 14px; font-size: 12px; font-weight: 700; color: #64748b; line-height: 1.8;";
    infoBox.innerHTML =
        '💡 <b>راهنمای خرید آیتم:</b><br>' +
        '⏭ حذف دو گزینه: توی مسابقه استفاده می‌شه<br>' +
        '⏰ +۱۰ ثانیه: توی مسابقه استفاده می‌شه<br>' +
        '✏️ تغییر نام: همون لحظه اعمال می‌شه<br>' +
        '🎨 آواتار ویژه: از صفحه آواتارهای ویژه';
    categoriesDiv.appendChild(infoBox);

    grid.querySelectorAll("[data-item-id]").forEach(function(btn) {
        btn.onclick = function() {
            handleShopBuy(btn.dataset.itemId);
        };
    });
}

/* ============================================
   خرید سکه
   ============================================ */
function handleCoinPurchase(pkg) {
    const user = Users.loadCurrent();
    if (!user) return;

    if (typeof showConfirmModal === "function") {
        showConfirmModal({
            emoji: "💰",
            title: "خرید " + pkg.title,
            message:
                "مبلغ: " + _shopToPersianNumber(pkg.price.toLocaleString()) + " تومان\n" +
                "دریافتی: " + _shopToPersianNumber(pkg.coins) + " سکه\n\n" +
                "آیا مطمئنید؟",
            color: "#f59e0b", shadow: "#b45309",
            confirmText: "🏦 پرداخت", cancelText: "لغو",
            onConfirm: function () { 
                // اتصال به کافه‌بازار
                if (window.AndroidBazaar && typeof window.AndroidBazaar.startPurchase === "function") {
                    window.AndroidBazaar.startPurchase(pkg.id);
                } else {
                    showInfoModal({
                        emoji: "⚠️", title: "خطا",
                        message: "پلاگین پرداخت بازار یافت نشد. لطفاً از طریق بازار نصب کنید.",
                        color: "#dc2626", shadow: "#7f1d1d"
                    });
                }
            }
        });
    } else {
        if (confirm("خرید " + pkg.title + "؟")) {
            if (window.AndroidBazaar && typeof window.AndroidBazaar.startPurchase === "function") {
                window.AndroidBazaar.startPurchase(pkg.id);
            } else {
                alert("خطا: پلاگین پرداخت بازار یافت نشد.");
            }
        }
    }
}

/* ============================================
   نمایش موفقیت پرداخت
   ============================================ */
async function showPaymentSuccess(pkg) {
    // ✅ اول سکه‌ها رو اضافه کن (await)
    const ok = await Shop.addCoins(pkg.coins, "coin_purchase_" + pkg.id);
    if (!ok) {
        showInfoModal({
            emoji: "⚠️",
            title: "خطا",
            message: "سکه‌ها اضافه نشد. دوباره امتحان کن.",
            color: "#dc2626", shadow: "#7f1d1d"
        });
        return;
    }

    const newBalance = Users.loadCurrent().coins;

    const successModal = document.createElement("div");
    successModal.style.cssText =
        "position: fixed; inset: 0; " +
        "background: rgba(0,0,0,0.85); " +
        "backdrop-filter: blur(8px); " +
        "z-index: 9999; " +
        "display: flex; align-items: center; justify-content: center; " +
        "padding: 20px;";

    const successCard = document.createElement("div");
    successCard.style.cssText =
        "max-width: 380px; width: 100%; " +
        "background: white; " +
        "border: 4px solid #22c55e; " +
        "border-radius: 26px; " +
        "padding: 30px 24px; " +
        "text-align: center; " +
        "box-shadow: 0 20px 60px rgba(0,0,0,0.5); " +
        "animation: modalBounceIn 0.4s ease;";

    successCard.innerHTML =
        '<div style="font-size: 70px; margin-bottom: 12px;">✅</div>' +
        '<div style="font-size: 20px; font-weight: 900; color: #16a34a; margin-bottom: 10px;">' +
            'پرداخت موفق!' +
        '</div>' +
        '<div style="font-size: 14px; font-weight: 700; color: #64748b; margin-bottom: 20px;">' +
            _shopToPersianNumber(pkg.coins) + ' سکه به حسابت اضافه شد' +
        '</div>' +
        '<div style="padding: 14px; background: linear-gradient(180deg, #fef3c7, #fde68a); border: 3px solid #fbbf24; border-radius: 16px; margin-bottom: 18px;">' +
            '<div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 4px;">موجودی جدید</div>' +
            '<div style="font-size: 28px; font-weight: 900; color: #d97706;">' +
                '🪙 ' + _shopToPersianNumber(newBalance) +
            '</div>' +
        '</div>' +
        '<button id="successOkBtn" style="' +
            'width: 100%; padding: 14px; ' +
            'background: linear-gradient(180deg, #22c55e, #16a34a); ' +
            'color: white; border: 3px solid #4ade80; ' +
            'border-radius: 16px; ' +
            'font-size: 15px; font-weight: 900; ' +
            'font-family: inherit; cursor: pointer; ' +
            'box-shadow: 0 5px 0 #14532d; ' +
            'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' +
        '">👌 عالیه!</button>';

    successModal.appendChild(successCard);
    document.body.appendChild(successModal);

    User.updateTopBar();

    successCard.querySelector("#successOkBtn").onclick = function () {
        successModal.remove();
        showShopScreen();
    };
}

/* ============================================
   خرید آیتم
   ============================================ */
async function handleShopBuy(itemId) {
    const user = Users.loadCurrent();
    if (!user) return;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (itemId === "vipAvatar") {
        showVipAvatarShop();
        return;
    }

    if (user.coins < item.price) {
        showInfoModal({
            emoji: "💰",
            title: "سکه کافی نداری!",
            message:
                "نیاز: " + _shopToPersianNumber(item.price) + " سکه\n" +
                "موجودی: " + _shopToPersianNumber(user.coins) + " سکه",
            color: "#dc2626", shadow: "#7f1d1d"
        });
        return;
    }

    const confirmed = await new Promise(function (resolve) {
        if (typeof showConfirmModal === "function") {
            showConfirmModal({
                emoji: item.icon,
                title: "خرید " + item.title,
                message: "قیمت: " + _shopToPersianNumber(item.price) + " سکه\n\nآیا مطمئنی؟",
                color: "#3b82f6", shadow: "#1e40af",
                confirmText: "🛒 خرید", cancelText: "لغو",
                onConfirm: function () { resolve(true); }
            });
            // اگه کاربر لغو کرد، بعد از بسته شدن modal resolve(false)
            setTimeout(function () {
                if (!document.getElementById("confirmModal")) resolve(false);
            }, 100);
        } else {
            resolve(confirm("خرید «" + item.title + "» به قیمت " + _shopToPersianNumber(item.price) + " سکه؟"));
        }
    });

    if (!confirmed) return;

    if (itemId === "rename") {
        showRenameScreen(item.price);
        return;
    }

    // ✅ اول سکه رو کم کن، بعد آیتم رو اضافه کن
    const paid = await Shop.addCoins(-item.price, "shop_buy_" + itemId);
    if (!paid) {
        showInfoModal({
            emoji: "⚠️", title: "خطا", message: "پرداخت انجام نشد",
            color: "#dc2626", shadow: "#7f1d1d"
        });
        return;
    }

    const items = Object.assign(
        { removeTwo: 0, extraTime: 0, rename: 0 },
        user.items || {}
    );
    items[itemId] = (items[itemId] || 0) + 1;
    Users.updateCurrent({ items: items });

    showInfoModal({
        emoji: "✅",
        title: item.title + " خریده شد!",
        message: "موجودی جدید: " + _shopToPersianNumber(items[itemId]),
        color: "#22c55e", shadow: "#14532d",
        onClose: showShopScreen
    });
}

/* ============================================
   🎨 گالری آواتارهای ویژه
   ============================================ */
function showVipAvatarShop() {
    // ✅ اگه showVipAvatarScreen توی app.js هست، ازش استفاده کن
    if (typeof showVipAvatarScreen === "function") {
        showVipAvatarScreen();
        return;
    }

    // در غیر این صورت، نسخه‌ی محلی
    _showVipAvatarShopLocal();
}

function _showVipAvatarShopLocal() {
    categoriesDiv.innerHTML = "";

    const user = Users.loadCurrent();
    if (!user) return;

    const owned = (user.vipAvatars || []).length;
    const total = (typeof VIP_AVATARS !== "undefined") ? VIP_AVATARS.length : 0;

    if (typeof VIP_AVATARS === "undefined" || total === 0) {
        showInfoModal({
            emoji: "⚠️", title: "خطا", message: "آواتارهای ویژه تعریف نشدن",
            color: "#dc2626", shadow: "#7f1d1d"
        });
        return;
    }

    /* ---------- هدر ---------- */
    const header = document.createElement("div");
    header.style.cssText =
        "background: linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b); " +
        "border: 4px solid #fbbf24; border-radius: 24px; " +
        "padding: 20px 16px; text-align: center; color: white; " +
        "box-shadow: 0 8px 0 #4c1d95, 0 15px 40px rgba(124,58,237,0.4); " +
        "margin-bottom: 20px; position: relative; overflow: hidden;";

    const progressPct = total > 0 ? (owned / total) * 100 : 0;
    header.innerHTML =
        '<div style="font-size: 44px; margin-bottom: 6px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🎨</div>' +
        '<div style="font-size: 22px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">آواتارهای ویژه</div>' +
        '<div style="font-size: 12px; font-weight: 700; margin-top: 4px; color: rgba(255,255,255,0.95);">' +
            _shopToPersianNumber(total) + ' آواتار حرفه‌ای</div>' +
        '<div style="margin-top: 14px; padding: 10px 14px; background: rgba(0,0,0,0.3); border-radius: 14px;">' +
            '<div style="display:flex; justify-content:space-between; font-size: 11px; font-weight: 900; color: white; margin-bottom: 6px;">' +
                '<span>🛍 خریداری‌شده</span>' +
                '<span>' + _shopToPersianNumber(owned) + ' / ' + _shopToPersianNumber(total) + '</span>' +
            '</div>' +
            '<div style="height: 8px; background: rgba(0,0,0,0.4); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.3);">' +
                '<div style="height: 100%; width: ' + progressPct + '%; background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); background-size: 200% 100%; border-radius: 10px; animation: onlineEnergyFlow 2s linear infinite;"></div>' +
            '</div>' +
        '</div>';
    categoriesDiv.appendChild(header);

    /* ---------- گرید آواتارها ---------- */
    const cols = total <= 2 ? 2 : (total <= 4 ? 2 : 3);
    const grid = document.createElement("div");
    grid.style.cssText =
        "display: grid; grid-template-columns: repeat(" + cols + ", 1fr); " +
        "gap: 14px; margin-bottom: 20px;";

    VIP_AVATARS.forEach(function(vip) {
        const isOwned = (user.vipAvatars || []).indexOf(vip.id) !== -1;
        const isSelected = user.avatar === vip.id;

        const btn = document.createElement("button");
        btn.style.cssText =
            "position: relative; padding: 0; aspect-ratio: 1; " +
            "background: linear-gradient(180deg, #ffffff, #f1f5f9); " +
            "border: 4px solid " +
                (isSelected ? "#fbbf24" : (isOwned ? "#10b981" : "#cbd5e1")) + "; " +
            "border-radius: 22px; cursor: pointer; overflow: hidden; " +
            "transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); " +
            "box-shadow: " +
                (isSelected ?
                    "0 7px 0 #b45309, 0 0 30px rgba(251,191,36,0.7)" :
                    (isOwned ?
                        "0 6px 0 #047857, 0 8px 20px rgba(16,185,129,0.3)" :
                        "0 6px 0 #94a3b8, 0 8px 20px rgba(0,0,0,0.1)")) + ";";

        const img = document.createElement("img");
        img.src = vip.url;
        img.style.cssText =
            "width: 100%; height: 100%; object-fit: cover; display: block;";
        img.alt = "آواتار";
        img.onerror = function() {
            img.style.display = "none";
            btn.style.background = "linear-gradient(180deg, #fef3c7, #fde68a)";
            const errIcon = document.createElement("div");
            errIcon.style.cssText =
                "position: absolute; inset: 0; display: flex; " +
                "align-items: center; justify-content: center; font-size: 48px;";
            errIcon.textContent = "🖼️";
            btn.appendChild(errIcon);
        };
        btn.appendChild(img);

        if (isSelected) {
            const checkBadge = document.createElement("div");
            checkBadge.style.cssText =
                "position: absolute; top: 8px; right: 8px; " +
                "width: 32px; height: 32px; border-radius: 50%; " +
                "background: linear-gradient(180deg, #fbbf24, #d97706); " +
                "border: 3px solid white; " +
                "display: flex; align-items: center; justify-content: center; " +
                "font-size: 18px; color: white; font-weight: 900; " +
                "z-index: 3; box-shadow: 0 3px 10px rgba(251,191,36,0.7); " +
                "animation: pulse 1.5s ease infinite;";
            checkBadge.textContent = "✓";
            btn.appendChild(checkBadge);
        }

        if (isOwned && !isSelected) {
            const ownedBadge = document.createElement("div");
            ownedBadge.style.cssText =
                "position: absolute; top: 8px; right: 8px; " +
                "padding: 4px 10px; " +
                "background: linear-gradient(180deg, #22c55e, #16a34a); " +
                "color: white; font-size: 11px; font-weight: 900; " +
                "border-radius: 10px; border: 2px solid white; " +
                "z-index: 3; text-shadow: 0 1px 2px rgba(0,0,0,0.3);";
            ownedBadge.textContent = "✓ داری";
            btn.appendChild(ownedBadge);
        }

        if (!isOwned) {
            const priceBadge = document.createElement("div");
            priceBadge.style.cssText =
                "position: absolute; bottom: 0; left: 0; right: 0; " +
                "background: linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.85)); " +
                "color: white; padding: 10px 8px; " +
                "font-size: 14px; font-weight: 900; " +
                "text-align: center; z-index: 3; " +
                "text-shadow: 0 1px 3px rgba(0,0,0,0.8); " +
                "backdrop-filter: blur(4px);";
            priceBadge.textContent = "🪙 " + _shopToPersianNumber(vip.price);
            btn.appendChild(priceBadge);
        }

        btn.onclick = async function() {
            const freshUser = Users.loadCurrent();
            if (!freshUser) return;
            const freshOwned = (freshUser.vipAvatars || []).indexOf(vip.id) !== -1;

            if (freshOwned) {
                Users.updateCurrent({ avatar: vip.id });
                showInfoModal({
                    emoji: "✅", title: "آواتار انتخاب شد!",
                    message: "حالا آواتار ویژه‌ت فعاله",
                    color: "#f59e0b", shadow: "#b45309",
                    onClose: showVipAvatarShop
                });
                return;
            }

            if (freshUser.coins < vip.price) {
                showInfoModal({
                    emoji: "💰", title: "سکه کافی نداری!",
                    message: "نیاز: " + _shopToPersianNumber(vip.price) + " سکه\n" +
                        "موجودی: " + _shopToPersianNumber(freshUser.coins) + " سکه",
                    color: "#dc2626", shadow: "#7f1d1d"
                });
                return;
            }

            // ✅ تأیید با showConfirmModal
            if (typeof showConfirmModal === "function") {
                showConfirmModal({
                    emoji: "🎨", title: "خرید آواتار ویژه",
                    message: "قیمت: " + _shopToPersianNumber(vip.price) + " سکه\n\nبعد از خرید، این آواتار به کلکسیونت اضافه می‌شه.",
                    color: "#f59e0b", shadow: "#b45309",
                    confirmText: "🛒 خرید", cancelText: "لغو",
                    onConfirm: function () { _buyVipAvatar(vip); }
                });
            } else {
                if (confirm("🎨 خرید این آواتار ویژه؟\n\nقیمت: " + _shopToPersianNumber(vip.price) + " سکه")) {
                    _buyVipAvatar(vip);
                }
            }
        };

        grid.appendChild(btn);
    });

    categoriesDiv.appendChild(grid);

    /* ---------- راهنما ---------- */
    const hint = document.createElement("div");
    hint.style.cssText =
        "padding: 12px 16px; margin-bottom: 16px; " +
        "background: linear-gradient(180deg, #fef9c3, #fef3c7); " +
        "border: 2px solid #fbbf24; border-radius: 14px; " +
        "font-size: 12px; font-weight: 700; color: #92400e; " +
        "line-height: 1.8; text-align: center;";
    hint.innerHTML =
        '💡 <b>راهنما:</b><br>' +
        '🪙 روی هر آواتار بزن تا بخری<br>' +
        '✅ آواتارهای خریداری‌شده همیشه قابل انتخابن<br>' +
        '🎯 آواتار انتخابی روی پروفایلت نمایش داده می‌شه';
    categoriesDiv.appendChild(hint);

    /* ---------- دکمه بازگشت ---------- */
    const backBtn = document.createElement("button");
    backBtn.style.cssText =
        "width: 100%; padding: 14px; " +
        "background: linear-gradient(180deg, #8b5cf6, #6d28d9); " +
        "color: white; border: 3px solid #a78bfa; " +
        "border-radius: 16px; " +
        "font-size: 15px; font-weight: 900; " +
        "font-family: inherit; cursor: pointer; " +
        "box-shadow: 0 5px 0 #4c1d95; " +
        "text-shadow: 0 1px 2px rgba(0,0,0,0.3);";
    backBtn.textContent = "← بازگشت به فروشگاه";
    backBtn.onclick = showShopScreen;
    categoriesDiv.appendChild(backBtn);
}

// ✅ خرید VIP با rollback
async function _buyVipAvatar(vip) {
    const paid = await Shop.addCoins(-vip.price, "vip_avatar_" + vip.id);
    if (!paid) {
        showInfoModal({
            emoji: "⚠️", title: "خطا", message: "پرداخت انجام نشد",
            color: "#dc2626", shadow: "#7f1d1d"
        });
        return;
    }

    const current = Users.loadCurrent();
    const owned = (current.vipAvatars || []).slice();
    if (owned.indexOf(vip.id) === -1) owned.push(vip.id);

    // backup
    const vipBackupKey = "vip_owned_" + current.phone;
    const globalOwned = Storage.load(vipBackupKey, []);
    if (globalOwned.indexOf(vip.id) === -1) {
        globalOwned.push(vip.id);
        Storage.save(vipBackupKey, globalOwned);
    }

    Users.updateCurrent({ vipAvatars: owned, avatar: vip.id });

    showInfoModal({
        emoji: "🎉", title: "آواتار ویژه خریداری شد!",
        message: "حالا آواتار ویژه‌ت فعاله",
        color: "#f59e0b", shadow: "#b45309",
        buttonText: "عالیه! 🎉",
        onClose: showVipAvatarShop
    });
}

/* ============================================
   تغییر نام کاربری — یکپارچه با app.js
   ============================================ */
function showRenameScreen(price) {
    // ✅ از تابع showSetUsernameModal در app.js استفاده کن
    if (typeof showSetUsernameModal === "function") {
        const user = Users.loadCurrent();
        if (!user) return;

        const cost = price || (typeof USERNAME_CHANGE_COST !== "undefined" ? USERNAME_CHANGE_COST : 500);
        if (user.coins < cost) {
            showInfoModal({
                emoji: "💰", title: "سکه کافی نداری!",
                message: "برای تغییر نام کاربری به " + _shopToPersianNumber(cost) + " سکه نیاز داری.",
                color: "#dc2626", shadow: "#7f1d1d"
            });
            return;
        }

        showConfirmModal({
            emoji: "✏️", title: "تغییر نام کاربری",
            message: "هزینه تغییر: " + _shopToPersianNumber(cost) + " سکه\nمطمئنی؟",
            color: "#06b6d4", shadow: "#0e7490",
            confirmText: "✅ بله، ادامه", cancelText: "لغو",
            onConfirm: function () {
                showSetUsernameModal(function (newName) {
                    showInfoModal({
                        emoji: "✅", title: "نام کاربری تغییر کرد!",
                        message: "نام جدید: " + newName,
                        color: "#22c55e", shadow: "#14532d",
                        onClose: showShopScreen
                    });
                }, true);
            }
        });
        return;
    }

    // نسخه‌ی محلی (اگه app.js نبود)
    _showRenameScreenLocal(price);
}

function _showRenameScreenLocal(price) {
    categoriesDiv.innerHTML = "";

    const user = Users.loadCurrent();
    if (!user) return;

    if (!price) {
        const renameItem = SHOP_ITEMS.find(i => i.id === "rename");
        price = renameItem ? renameItem.price : 500;
    }

    const modal = document.createElement("div");
    modal.className = "rename-modal-content";

    modal.innerHTML =
        '<div class="rename-icon">✏️</div>' +
        '<div class="rename-title">تغییر نام کاربری</div>' +
        '<div class="rename-subtitle">نام جدید رو وارد کن — هزینه: 🪙 ' + _shopToPersianNumber(price) + '</div>' +
        '<input type="text" class="rename-input" id="renameInput" placeholder="نام جدید" value="' + _shopEscapeHtml(user.username) + '" maxlength="15">' +
        '<div class="rename-buttons">' +
            '<button class="rename-btn confirm" id="renameConfirm">✅ تأیید و پرداخت</button>' +
            '<button class="rename-btn cancel" id="renameCancel">❌ لغو</button>' +
        '</div>';

    categoriesDiv.appendChild(modal);

    document.getElementById("renameConfirm").onclick = async function() {
        const newName = document.getElementById("renameInput").value.trim();

        // ✅ استفاده از checkUsernameLive در app.js
        let check;
        if (typeof checkUsernameLive === "function") {
            check = checkUsernameLive(newName);
        } else {
            if (!newName || newName.length < 3) {
                check = { ok: false, error: "حداقل ۳ کاراکتر" };
            } else if (newName.length > 15) {
                check = { ok: false, error: "حداکثر ۱۵ کاراکتر" };
            } else if (!/^[a-zA-Z0-9_\u0600-\u06FF\u200c]+$/.test(newName)) {
                check = { ok: false, error: "فقط حروف، عدد و _" };
            } else {
                check = { ok: true };
            }
        }

        if (!check.ok) {
            showInfoModal({
                emoji: "❌", title: "نامعتبر", message: check.error,
                color: "#dc2626", shadow: "#7f1d1d"
            });
            return;
        }

        if (newName === user.username) {
            showInfoModal({
                emoji: "⚠️", title: "توجه", message: "نام کاربری همون قبلیه!",
                color: "#f59e0b", shadow: "#b45309"
            });
            return;
        }

        const existing = Users.findByUsername(newName);
        if (existing && existing.phone !== user.phone) {
            showInfoModal({
                emoji: "❌", title: "تکراری",
                message: "این نام کاربری قبلاً گرفته شده!",
                color: "#dc2626", shadow: "#7f1d1d"
            });
            return;
        }

        const freshUser = Users.loadCurrent();
        if (!freshUser || freshUser.coins < price) {
            showInfoModal({
                emoji: "💰", title: "سکه کافی نداری!",
                message: "نیاز: " + _shopToPersianNumber(price) + " سکه\n" +
                    "موجودی: " + _shopToPersianNumber(freshUser ? freshUser.coins : 0) + " سکه",
                color: "#dc2626", shadow: "#7f1d1d"
            });
            return;
        }

        const paid = await Shop.addCoins(-price, "username_change");
        if (!paid) {
            showInfoModal({
                emoji: "⚠️", title: "خطا", message: "پرداخت انجام نشد",
                color: "#dc2626", shadow: "#7f1d1d"
            });
            return;
        }

        const result = Users.setUsername(newName);
        if (!result.ok) {
            // rollback
            await Shop.addCoins(price, "username_change_refund");
            showInfoModal({
                emoji: "❌", title: "خطا", message: result.error,
                color: "#dc2626", shadow: "#7f1d1d"
            });
            return;
        }

        showInfoModal({
            emoji: "🎉", title: "نام کاربری تغییر کرد!",
            message: "نام جدید: " + newName + "\n🪙 " + _shopToPersianNumber(price) + " سکه کم شد",
            color: "#22c55e", shadow: "#14532d",
            onClose: showHomeScreen
        });
    };

    document.getElementById("renameCancel").onclick = function() {
        showShopScreen();
    };
}

/* ============================================
   صادرات برای استفاده در app.js
   ============================================ */
if (typeof window !== "undefined") {
    window.showShopScreen = showShopScreen;
    window.showVipAvatarShop = showVipAvatarShop;
    window.handleShopBuy = handleShopBuy;
}
