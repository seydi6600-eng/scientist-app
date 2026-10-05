// @ts-nocheck
/* ============================================
   🛒 فروشگاه — با خرید سکه + گالری آواتار
   ============================================ */

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
        price: 300
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
    categoriesDiv.innerHTML = "";
    categoriesDiv.classList.remove("no-scroll");
    User.showBottomBar();
    setActiveTab("shop");
    if (typeof Music !== "undefined") Music.playMain();

    const user = Users.loadCurrent();
    if (!user) { showLoginScreen(); return; }

    User.updateTopBar();
    Hearts.updateDisplay();

    /* ---------- هدر ---------- */
    const header = document.createElement("div");
    header.className = "shop-header";
    header.innerHTML =
        '<div class="shop-title">🛒 فروشگاه</div>' +
        '<div class="shop-coins">🪙 ' + toPersianNumber(user.coins) + ' سکه</div>';
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
        priceEl.textContent = toPersianNumber(pkg.price.toLocaleString()) + " تومان";
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

        card.onmouseenter = function () { card.style.transform = "translateY(-3px)"; };
        card.onmouseleave = function () { card.style.transform = "translateY(0)"; };
        card.onmousedown = function () { card.style.transform = "translateY(2px) scale(0.97)"; };
        card.onmouseup = function () { card.style.transform = "translateY(-3px)"; };

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
                countText = '<div class="shop-item-count">✅ ' + toPersianNumber(owned) + ' آواتار داری</div>';
                ownedClass = "owned";
                btnText = "مشاهده";
                btnClass = "owned";
            }
        } else if (item.id === "rename") {
            countText = '<div class="shop-item-count">با هر خرید ۱ بار</div>';
        } else {
            const count = (user.items && user.items[item.id]) || 0;
            if (count > 0) {
                countText = '<div class="shop-item-count">📦 موجودی: ' + toPersianNumber(count) + '</div>';
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
                '<div class="shop-price-value">🪙 ' + toPersianNumber(item.price) + '</div>' +
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

    const confirmMsg =
        "💰 خرید " + pkg.title + "\n\n" +
        "مبلغ: " + toPersianNumber(pkg.price.toLocaleString()) + " تومان\n" +
        "دریافتی: " + toPersianNumber(pkg.coins) + " سکه\n\n" +
        "آیا مطمئنید؟";

    if (!confirm(confirmMsg)) return;

    showPaymentGateway(pkg);
}

/* ============================================
   درگاه پرداخت
   ============================================ */
function showPaymentGateway(pkg) {
    const modal = document.createElement("div");
    modal.style.cssText =
        "position: fixed; inset: 0; " +
        "background: rgba(0,0,0,0.85); " +
        "backdrop-filter: blur(8px); " +
        "-webkit-backdrop-filter: blur(8px); " +
        "z-index: 9999; " +
        "display: flex; align-items: center; justify-content: center; " +
        "padding: 20px;";

    const card = document.createElement("div");
    card.style.cssText =
        "max-width: 380px; width: 100%; " +
        "background: white; " +
        "border-radius: 26px; " +
        "padding: 28px 22px; " +
        "text-align: center; " +
        "box-shadow: 0 20px 60px rgba(0,0,0,0.5); " +
        "animation: bounceIn 0.4s ease;";

    card.innerHTML =
        '<div style="font-size: 60px; margin-bottom: 12px;">🏦</div>' +
        '<div style="font-size: 18px; font-weight: 900; color: #1e293b; margin-bottom: 6px;">' +
            'در حال انتقال به درگاه پرداخت...' +
        '</div>' +
        '<div style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 20px;">' +
            'لطفاً صبر کنید' +
        '</div>' +
        '<div style="padding: 14px; background: linear-gradient(180deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; border-radius: 14px; margin-bottom: 18px;">' +
            '<div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 4px;">مبلغ قابل پرداخت</div>' +
            '<div style="font-size: 24px; font-weight: 900; color: #d97706;">' +
                toPersianNumber(pkg.price.toLocaleString()) + ' تومان' +
            '</div>' +
        '</div>' +
        '<div style="font-size: 11px; font-weight: 600; color: #94a3b8;">' +
            '⚠️ این یه نسخه نمایشیه — پرداخت واقعی انجام نمی‌شه' +
        '</div>';

    modal.appendChild(card);
    document.body.appendChild(modal);

    setTimeout(function () {
        modal.remove();

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
            "animation: bounceIn 0.4s ease;";

        successCard.innerHTML =
            '<div style="font-size: 70px; margin-bottom: 12px;">✅</div>' +
            '<div style="font-size: 20px; font-weight: 900; color: #16a34a; margin-bottom: 10px;">' +
                'پرداخت موفق!' +
            '</div>' +
            '<div style="font-size: 14px; font-weight: 700; color: #64748b; margin-bottom: 20px;">' +
                toPersianNumber(pkg.coins) + ' سکه به حسابت اضافه شد' +
            '</div>' +
            '<div style="padding: 14px; background: linear-gradient(180deg, #fef3c7, #fde68a); border: 3px solid #fbbf24; border-radius: 16px; margin-bottom: 18px;">' +
                '<div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 4px;">موجودی جدید</div>' +
                '<div id="newCoinBalance" style="font-size: 28px; font-weight: 900; color: #d97706;">' +
                    '🪙 ' + toPersianNumber(0) +
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

        User.addCoins(pkg.coins);

        const newBalance = Users.loadCurrent().coins;
        const balanceEl = successCard.querySelector("#newCoinBalance");
        if (balanceEl) {
            balanceEl.textContent = "🪙 " + toPersianNumber(newBalance);
        }

        successCard.querySelector("#successOkBtn").onclick = function () {
            successModal.remove();
            showShopScreen();
        };
    }, 2000);
}

/* ============================================
   خرید آیتم
   ============================================ */
function handleShopBuy(itemId) {
    const user = Users.loadCurrent();
    if (!user) return;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (itemId === "vipAvatar") {
        showVipAvatarShop();
        return;
    }

    if (user.coins < item.price) {
        alert("❌ سکه کافی نداری!\n\nنیاز: " + toPersianNumber(item.price) + " سکه\nموجودی: " + toPersianNumber(user.coins) + " سکه");
        return;
    }

    if (!confirm("خرید «" + item.title + "» به قیمت " + toPersianNumber(item.price) + " سکه؟")) {
        return;
    }

    if (itemId === "rename") {
        showRenameScreen(item.price);
        return;
    }

    User.addCoins(-item.price);
    const items = user.items || { removeTwo: 0, extraTime: 0, rename: 0 };
    items[itemId] = (items[itemId] || 0) + 1;
    Users.updateCurrent({ items: items });

    alert("✅ «" + item.title + "» خریده شد!\n\nموجودی جدید: " + toPersianNumber(items[itemId]));
    showShopScreen();
}

/* ============================================
   🎨 گالری آواتارهای ویژه — عکس‌های خودت
   ============================================ */
function showVipAvatarShop() {
    categoriesDiv.innerHTML = "";

    const user = Users.loadCurrent();
    if (!user) return;

    const owned = (user.vipAvatars || []).length;
    const total = VIP_AVATARS.length;

    /* ---------- هدر ---------- */
    const header = document.createElement("div");
    header.style.cssText =
        "background: linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b); " +
        "border: 4px solid #fbbf24; border-radius: 24px; " +
        "padding: 20px 16px; text-align: center; color: white; " +
        "box-shadow: 0 8px 0 #4c1d95, 0 15px 40px rgba(124,58,237,0.4); " +
        "margin-bottom: 20px; position: relative; overflow: hidden;";

    const shine = document.createElement("div");
    shine.style.cssText =
        "position:absolute; top:-50%; left:-100%; width:60%; height:200%; " +
        "background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); " +
        "animation: shine 4s ease infinite; pointer-events:none;";
    header.appendChild(shine);

    const headerContent = document.createElement("div");
    headerContent.style.cssText = "position: relative; z-index: 1;";
    headerContent.innerHTML =
        '<div style="font-size: 44px; margin-bottom: 6px; ' +
            'filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🎨</div>' +
        '<div style="font-size: 22px; font-weight: 900; ' +
            'text-shadow: 0 2px 4px rgba(0,0,0,0.3);">آواتارهای ویژه</div>' +
        '<div style="font-size: 12px; font-weight: 700; margin-top: 4px; ' +
            'color: rgba(255,255,255,0.95);">' +
            toPersianNumber(total) + ' آواتار حرفه‌ای</div>';

    /* نوار پیشرفت خرید */
    const progressWrap = document.createElement("div");
    progressWrap.style.cssText =
        "margin-top: 14px; padding: 10px 14px; " +
        "background: rgba(0,0,0,0.3); border-radius: 14px;";

    const progressPct = total > 0 ? (owned / total) * 100 : 0;
    progressWrap.innerHTML =
        '<div style="display:flex; justify-content:space-between; ' +
            'font-size: 11px; font-weight: 900; color: white; margin-bottom: 6px;">' +
            '<span>🛍 خریداری‌شده</span>' +
            '<span>' + toPersianNumber(owned) + ' / ' + toPersianNumber(total) + '</span>' +
        '</div>' +
        '<div style="height: 8px; background: rgba(0,0,0,0.4); ' +
            'border-radius: 10px; overflow: hidden; ' +
            'border: 1px solid rgba(255,255,255,0.3);">' +
            '<div style="height: 100%; width: ' + progressPct + '%; ' +
                'background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24); ' +
                'background-size: 200% 100%; border-radius: 10px; ' +
                'box-shadow: 0 0 10px rgba(251,191,36,0.8); ' +
                'animation: onlineEnergyFlow 2s linear infinite;"></div>' +
        '</div>';

    headerContent.appendChild(progressWrap);
    header.appendChild(headerContent);
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
            "position: relative; padding: 0; " +
            "aspect-ratio: 1; " +
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

        /* تصویر */
        const img = document.createElement("img");
        img.src = vip.url;
        img.style.cssText =
            "width: 100%; height: 100%; " +
            "object-fit: cover; display: block;";
        img.alt = "آواتار";
        img.onerror = function() {
            img.style.display = "none";
            btn.style.background =
                "linear-gradient(180deg, #fef3c7, #fde68a)";
            const errIcon = document.createElement("div");
            errIcon.style.cssText =
                "position: absolute; inset: 0; display: flex; " +
                "align-items: center; justify-content: center; " +
                "font-size: 48px;";
            errIcon.textContent = "🖼️";
            btn.appendChild(errIcon);
        };
        btn.appendChild(img);

        /* تیک انتخاب‌شده */
        if (isSelected) {
            const checkBadge = document.createElement("div");
            checkBadge.style.cssText =
                "position: absolute; top: 8px; right: 8px; " +
                "width: 32px; height: 32px; border-radius: 50%; " +
                "background: linear-gradient(180deg, #fbbf24, #d97706); " +
                "border: 3px solid white; " +
                "display: flex; align-items: center; justify-content: center; " +
                "font-size: 18px; color: white; font-weight: 900; " +
                "z-index: 3; " +
                "box-shadow: 0 3px 10px rgba(251,191,36,0.7); " +
                "animation: pulse 1.5s ease infinite;";
            checkBadge.textContent = "✓";
            btn.appendChild(checkBadge);
        }

        /* بج مالکیت */
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

        /* بج قیمت */
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
            priceBadge.textContent = "🪙 " + toPersianNumber(vip.price);
            btn.appendChild(priceBadge);
        }

        /* رویدادها */
        btn.onmouseenter = function () {
            btn.style.transform = "translateY(-5px) scale(1.03)";
            btn.style.filter = "brightness(1.1)";
        };
        btn.onmouseleave = function () {
            btn.style.transform = "translateY(0) scale(1)";
            btn.style.filter = "brightness(1)";
        };
        btn.onmousedown = function () {
            btn.style.transform = "translateY(3px) scale(0.97)";
        };
        btn.onmouseup = function () {
            btn.style.transform = "translateY(-5px) scale(1.03)";
        };

        /* کلیک */
        btn.onclick = function() {
            const freshUser = Users.loadCurrent();
            if (!freshUser) return;
            const freshOwned = (freshUser.vipAvatars || []).indexOf(vip.id) !== -1;

            if (freshOwned) {
                Users.updateCurrent({ avatar: vip.id });
                alert("✅ آواتار ویژه انتخاب شد!");
                showHomeScreen();
                return;
            }

            if (freshUser.coins < vip.price) {
                alert(
                    "❌ سکه کافی نداری!\n\n" +
                    "نیاز: " + toPersianNumber(vip.price) + " سکه\n" +
                    "موجودی: " + toPersianNumber(freshUser.coins) + " سکه\n\n" +
                    "می‌تونی از فروشگاه سکه بخری یا تبلیغ ببینی! 📺"
                );
                return;
            }

            if (!confirm(
                "🎨 خرید این آواتار ویژه؟\n\n" +
                "قیمت: " + toPersianNumber(vip.price) + " سکه\n\n" +
                "بعد از خرید، این آواتار به کلکسیونت اضافه می‌شه."
            )) return;

            User.addCoins(-vip.price);
            const newVipList = [...(freshUser.vipAvatars || []), vip.id];
            Users.updateCurrent({ vipAvatars: newVipList, avatar: vip.id });

            alert("🎉 آواتار ویژه خریداری و فعال شد!");
            showVipAvatarShop();
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
        "text-shadow: 0 1px 2px rgba(0,0,0,0.3); " +
        "transition: all 0.15s ease;";
    backBtn.textContent = "← بازگشت به فروشگاه";
    backBtn.onmouseenter = function () { backBtn.style.transform = "translateY(-2px)"; };
    backBtn.onmouseleave = function () { backBtn.style.transform = "translateY(0)"; };
    backBtn.onmousedown = function () { backBtn.style.transform = "translateY(2px)"; backBtn.style.boxShadow = "0 3px 0 #4c1d95"; };
    backBtn.onmouseup = function () { backBtn.style.transform = "translateY(-2px)"; backBtn.style.boxShadow = "0 5px 0 #4c1d95"; };
    backBtn.onclick = showShopScreen;
    categoriesDiv.appendChild(backBtn);
}

/* ============================================
   تغییر نام کاربری
   ============================================ */
function showRenameScreen(price) {
    categoriesDiv.innerHTML = "";

    const user = Users.loadCurrent();
    if (!user) return;

    if (!price) {
        const renameItem = SHOP_ITEMS.find(i => i.id === "rename");
        price = renameItem ? renameItem.price : 300;
    }

    const modal = document.createElement("div");
    modal.className = "rename-modal-content";

    modal.innerHTML =
        '<div class="rename-icon">✏️</div>' +
        '<div class="rename-title">تغییر نام کاربری</div>' +
        '<div class="rename-subtitle">نام جدید رو وارد کن — هزینه: 🪙 ' + toPersianNumber(price) + '</div>' +
        '<input type="text" class="rename-input" id="renameInput" placeholder="نام جدید" value="' + user.username + '" maxlength="15">' +
        '<div class="rename-buttons">' +
            '<button class="rename-btn confirm" id="renameConfirm">✅ تأیید و پرداخت</button>' +
            '<button class="rename-btn cancel" id="renameCancel">❌ لغو</button>' +
        '</div>';

    categoriesDiv.appendChild(modal);

    document.getElementById("renameConfirm").onclick = function() {
        const newName = document.getElementById("renameInput").value.trim();

        if (!newName || newName.length < 3) {
            alert("❌ نام کاربری حداقل ۳ کاراکتر");
            return;
        }
        if (newName.length > 15) {
            alert("❌ نام کاربری حداکثر ۱۵ کاراکتر");
            return;
        }
        if (!/^[a-zA-Z0-9_\u0600-\u06FF\u200c]{3,15}$/.test(newName)) {
            alert("❌ فقط حروف، عدد و _ مجاز است");
            return;
        }
        if (newName === user.username) {
            alert("⚠️ نام کاربری همون قبلیه!");
            return;
        }

        const users = Users.loadAll();
        if (users[newName]) {
            alert("❌ این نام کاربری قبلاً گرفته شده!");
            return;
        }

        const freshUser = Users.loadCurrent();
        if (!freshUser || freshUser.coins < price) {
            alert("❌ سکه کافی نداری!\n\nنیاز: " + toPersianNumber(price) + " سکه\nموجودی: " + toPersianNumber(freshUser ? freshUser.coins : 0) + " سکه");
            return;
        }

        User.addCoins(-price);

        const oldName = user.username;
        delete users[oldName];

        user.username = newName;
        users[newName] = user;

        Users.saveAll(users);
        Users.saveCurrent(user);

        const oldHearts = Storage.load("hearts_" + oldName, null);
        if (oldHearts) {
            Storage.save("hearts_" + newName, oldHearts);
            Storage.remove("hearts_" + oldName);
        }

        const oldLeague = Storage.load("userLeague_" + oldName, null);
        if (oldLeague) {
            Storage.save("userLeague_" + newName, oldLeague);
            Storage.remove("userLeague_" + oldName);
        }

        alert("🎉 نام کاربری به «" + newName + "» تغییر کرد!\n🪙 " + toPersianNumber(price) + " سکه کم شد");
        showHomeScreen();
    };

    document.getElementById("renameCancel").onclick = function() {
        showShopScreen();
    };
}
