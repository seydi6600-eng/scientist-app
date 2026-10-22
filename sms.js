const axios = require("axios");

// کد bodyId که از پنل ملی‌پیامک گرفتی
const BODY_ID = 562530; 

// کلید API
const MELIPAYAMAK_API_KEY = "7a85952ffd054761b21587aa06c5ee6c";

// آدرس صحیح وب‌سرویس پترن (shared)
const MELIPAYAMAK_PATTERN_URL = `https://console.melipayamak.com/api/send/shared/${MELIPAYAMAK_API_KEY}`;

async function sendOTP(phoneNumber, code) {
    try {
        const response = await axios.post(MELIPAYAMAK_PATTERN_URL, {
            to: phoneNumber,
            bodyId: BODY_ID,
            args: [code] 
        }, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.data && (response.data.recId || response.data.status === "success")) {
            console.log("✅ OTP sent successfully to", phoneNumber);
            return { ok: true, data: response.data };
        } else {
            console.error("❌ Melipayamak Pattern API Error:", response.data);
            return { ok: false, error: response.data.message || "خطا در ارسال پیامک" };
        }
    } catch (error) {
        console.error("❌ Melipayamak Network Error:", error.response?.data || error.message);
        return { ok: false, error: "خطای شبکه در ارسال پیامک" };
    }
}

module.exports = { sendOTP };
