const axios = require("axios");
const path = require("path");
const fs = require("fs");

const { NODE_ENV } = process.env;

const configPath = path.join(
    __dirname,
    "../../",
    `config${["production", "development"].includes(NODE_ENV) ? ".dev.json" : ".json"}`
);

async function sendAccountNotification(message) {
    try {
        if (!fs.existsSync(configPath)) {
            console.error("Telegram notification: config file পাওয়া যায়নি।");
            return false;
        }

        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        const telegram = config.notiWhenListenMqttError?.telegram;

        if (
            !telegram ||
            telegram.enable !== true ||
            !telegram.botToken ||
            !telegram.chatId
        ) {
            console.log("Telegram notification বন্ধ অথবা Token/Chat ID দেওয়া হয়নি।");
            return false;
        }

        const url = `https://api.telegram.org/bot${telegram.botToken}/sendMessage`;

        await axios.post(url, {
            chat_id: telegram.chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: true
        }, {
            timeout: 15000
        });

        return true;
    } catch (error) {
        console.error(
            "Telegram notification পাঠানো যায়নি:",
            error.response?.data?.description || error.message
        );
        return false;
    }
}

module.exports = sendAccountNotification;
