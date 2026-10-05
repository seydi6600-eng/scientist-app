// @ts-nocheck
/* ============================================
   🎵 سیستم موسیقی
   main.mp3 برای صفحه اصلی
   quiz.mp3 برای مسابقه
   ============================================ */

const Music = {
    mainAudio: null,
    quizAudio: null,
    enabled: true,
    currentTrack: null,
    initialized: false,
    wasPlayingBeforeHide: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.enabled = Storage.load("musicEnabled", true);

        this.mainAudio = new Audio("sounds/main.mp3");
        this.mainAudio.loop = true;
        this.mainAudio.volume = 0.3;
        this.mainAudio.preload = "auto";

        this.quizAudio = new Audio("sounds/quiz.mp3");
        this.quizAudio.loop = true;
        this.quizAudio.volume = 0.25;
        this.quizAudio.preload = "auto";

        this.updateButton();

        // 🎯 توی اولین کلیک کاربر، موسیقی شروع شه
        document.body.addEventListener("click", () => {
            if (this.enabled && !this.currentTrack) {
                this.playMain();
            }
        }, { once: true });

        // 🔇 وقتی اپ میره پس‌زمینه → موسیقی قطع
        // 🔊 وقتی برمی‌گرده → موسیقی پخش
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.wasPlayingBeforeHide = !!this.currentTrack;
                this.pause();
            } else {
                if (this.enabled && this.wasPlayingBeforeHide) {
                    this.resume();
                }
            }
        });
    },

    /* ============================================
       پخش موسیقی اصلی
       - اگه همون main پخش می‌شه → دست نزن
       - اگه quiz پخش می‌شه → متوقف کن، main پخش
       ============================================ */
    playMain() {
        if (!this.enabled) return;

        // اگه همون main پخش می‌شه، دوباره از اول شروع نکن
        if (this.currentTrack === "main" && !this.mainAudio.paused) {
            return;
        }

        // اگه quiz پخش می‌شه، متوقف کن
        if (this.currentTrack === "quiz") {
            this.quizAudio.pause();
            this.quizAudio.currentTime = 0;
        }

        this.currentTrack = "main";

        this.mainAudio.play().catch(err => {
            console.log("🎵 موسیقی اصلی پخش نشد:", err.message);
        });
    },

    /* ============================================
       پخش موسیقی مسابقه
       - اگه همون quiz پخش می‌شه → دست نزن
       - اگه main پخش می‌شه → متوقف کن، quiz پخش
       ============================================ */
    playQuiz() {
        if (!this.enabled) return;

        // اگه همون quiz پخش می‌شه، دوباره از اول شروع نکن
        if (this.currentTrack === "quiz" && !this.quizAudio.paused) {
            return;
        }

        // اگه main پخش می‌شه، متوقف کن
        if (this.currentTrack === "main") {
            this.mainAudio.pause();
            this.mainAudio.currentTime = 0;
        }

        this.currentTrack = "quiz";

        this.quizAudio.play().catch(err => {
            console.log("🎮 موسیقی مسابقه پخش نشد:", err.message);
        });
    },

    stopAll() {
        if (this.mainAudio) {
            this.mainAudio.pause();
            this.mainAudio.currentTime = 0;
        }
        if (this.quizAudio) {
            this.quizAudio.pause();
            this.quizAudio.currentTime = 0;
        }
        this.currentTrack = null;
    },

    pause() {
        if (this.mainAudio) this.mainAudio.pause();
        if (this.quizAudio) this.quizAudio.pause();
    },

    resume() {
        if (!this.enabled) return;
        if (this.currentTrack === "main") {
            this.mainAudio.play().catch(() => {});
        } else if (this.currentTrack === "quiz") {
            this.quizAudio.play().catch(() => {});
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        Storage.save("musicEnabled", this.enabled);

        if (this.enabled) {
            if (!this.currentTrack) {
                this.playMain();
            } else {
                this.resume();
            }
        } else {
            this.pause();
        }

        this.updateButton();
    },

    updateButton() {
        const btn = document.getElementById("musicToggleBtn");
        if (!btn) return;
        btn.textContent = this.enabled ? "🔊" : "🔇";
        btn.title = this.enabled ? "خاموش کردن موسیقی" : "روشن کردن موسیقی";
    }
};
