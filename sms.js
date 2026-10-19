const axios = require("axios");

const MELIPAYAMAK_API_URL = "https://console.melipayamak.com/api/send/otp/7a85952ffd054761b21587aa06c5ee6c";

async function sendOTP(phoneNumber, code) {
    try {
        const response = await axios.post(MELIPAYAMAK_API_URL, {
            to: phoneNumber,
            code: code
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.data && response.data.status === "success") {
            console.log("✅ OTP sent successfully to", phoneNumber);
            return { ok: true, data: response.data };
        } else {
            console.error("❌ Melipayamak API Error:", response.data);
            return { ok: false, error: response.data.message || "خطا در ارسال پیامک" };
        }
    } catch (error) {
        console.error("❌ Melipayamak Network Error:", error.response?.data || error.message);
        return { ok: false, error: "خطای شبکه در ارسال پیامک" };
    }
}

module.exports = { sendOTP };
