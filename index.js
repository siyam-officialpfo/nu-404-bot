const { spawn } = require("child_process");
const express = require("express");
const fs = require("fs");
const path = require("path");
const log = require("./logger/log.js");
const sendAccountNotification = require("./bot/login/accountNotification.js");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const accountFiles = [
    { id: 1, file: path.join(__dirname, "account.txt") },
    { id: 2, file: path.join(__dirname, "account2.txt") },
    { id: 3, file: path.join(__dirname, "account3.txt") }
];

let child = null;
let currentAccount = null;
let nextIndex = 0;
let switching = false;
let shuttingDown = false;
let retryTimer = null;

function getAvailableAccounts() {
    return accountFiles.filter(account => {
        try {
            return fs.existsSync(account.file) &&
                fs.statSync(account.file).size > 0 &&
                fs.readFileSync(account.file, "utf8").trim().length > 0;
        } catch {
            return false;
        }
    });
}

function getNextAccount() {
    const available = getAvailableAccounts();

    while (nextIndex < accountFiles.length) {
        const wanted = accountFiles[nextIndex++];
        const found = available.find(item => item.id === wanted.id);

        if (found) return found;
    }

    return null;
}

async function startNextAccount() {
    if (shuttingDown || switching) return;

    const account = getNextAccount();

    if (!account) {
        currentAccount = null;

        log.error("ACCOUNT", "সব অ্যাকাউন্ট শেষ অথবা কোনো অ্যাকাউন্ট পাওয়া যায়নি।");

        await sendAccountNotification(
            "❌ <b>বট চালু করা যাচ্ছে না</b>\n\n" +
            "তিনটি অ্যাকাউন্টের কোনোটিই চালু করার মতো অবস্থায় নেই।\n" +
            "account.txt, account2.txt এবং account3.txt পরীক্ষা করুন।"
        );

        return;
    }

    currentAccount = account;

    log.info("ACCOUNT", `অ্যাকাউন্ট নম্বর ${account.id} দিয়ে বট চালু হচ্ছে।`);

    child = spawn(process.execPath, ["Goat.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: false,
        env: {
            ...process.env,
            BOT_ACCOUNT_FILE: account.file,
            BOT_ACCOUNT_ID: String(account.id)
        }
    });

    let failureHandled = false;

    child.on("error", async error => {
        if (failureHandled || shuttingDown) return;
        failureHandled = true;

        log.error("ACCOUNT", `অ্যাকাউন্ট ${account.id} চালু করতে সমস্যা: ${error.message}`);
        await handleAccountFailure(account, error.message);
    });

    child.on("close", async (code, signal) => {
        if (shuttingDown || failureHandled) return;
        failureHandled = true;

        const reason = signal
            ? `প্রসেস বন্ধ হয়েছে: ${signal}`
            : `বট বন্ধ হয়েছে। Exit code: ${code}`;

        log.error("ACCOUNT", `অ্যাকাউন্ট ${account.id}: ${reason}`);

        await handleAccountFailure(account, reason);
    });
}

async function handleAccountFailure(account, reason) {
    if (shuttingDown || switching) return;

    switching = true;

    const nextAccount = getAvailableAccounts().find(item => item.id > account.id);

    let message =
        `⚠️ <b>অ্যাকাউন্টে সমস্যা হয়েছে</b>\n\n` +
        `🔴 সমস্যাগ্রস্ত অ্যাকাউন্ট: ${account.id}\n` +
        `📝 কারণ: ${String(reason).slice(0, 600)}\n\n`;

    if (nextAccount) {
        message +=
            `🔄 এখন অ্যাকাউন্ট নম্বর ${nextAccount.id} চালু করার চেষ্টা করা হবে।`;
    } else {
        message +=
            "❌ আর কোনো পরবর্তী অ্যাকাউন্ট পাওয়া যায়নি।";
    }

    await sendAccountNotification(message);

    if (!nextAccount) {
        switching = false;
        currentAccount = null;
        log.error("ACCOUNT", "আর কোনো অ্যাকাউন্ট বাকি নেই।");
        return;
    }

    nextIndex = nextAccount.id - 1;

    log.info(
        "ACCOUNT",
        `অ্যাকাউন্ট ${account.id} থেকে ${nextAccount.id}-এ পরিবর্তন হচ্ছে।`
    );

    switching = false;

    retryTimer = setTimeout(() => {
        startNextAccount();
    }, 2500);
}

// Uptime route
app.get("/", (req, res) => {
    res.status(200).send("Messenger GoatBot is running!");
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: shuttingDown ? "stopping" : "OK",
        platform: "Facebook Messenger",
        currentAccount: currentAccount ? currentAccount.id : null,
        bot: child && child.exitCode === null ? "running" : "stopped",
        uptime: process.uptime()
    });
});

const server = app.listen(PORT, "0.0.0.0", () => {
    log.info("SERVER", `Uptime server running on port ${PORT}`);
    startNextAccount();
});

function shutdown() {
    if (shuttingDown) return;

    shuttingDown = true;

    if (retryTimer) clearTimeout(retryTimer);

    if (child && child.exitCode === null) {
        child.kill("SIGTERM");
    }

    server.close(() => process.exit(0));

    setTimeout(() => process.exit(0), 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
