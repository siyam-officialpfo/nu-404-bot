/**
 * @author NTKhang
 * ! If you do not download the source code from the official address,
 * ! you are using an unknown version and at risk of having your account hacked.
 */

process.on("unhandledRejection", error => console.log(error));
process.on("uncaughtException", error => console.log(error));

const axios = require("axios");
const fs = require("fs-extra");
const nodemailer = require("nodemailer");
const { execSync } = require("child_process");
const log = require("./logger/log.js");
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

function validJSON(pathDir) {
    try {
        if (!fs.existsSync(pathDir))
            throw new Error(`File "${pathDir}" not found`);

        execSync(`npx jsonlint "${pathDir}"`, { stdio: "pipe" });
        return true;
    } catch (err) {
        let msgError = err.message;
        msgError = msgError.split("\n").slice(1).join("\n");
        const indexPos = msgError.indexOf("    at");
        msgError = msgError.slice(
            0,
            indexPos !== -1 ? indexPos - 1 : msgError.length
        );
        throw new Error(msgError);
    }
}

const { NODE_ENV } = process.env;

const dirConfig = path.normalize(
    `${__dirname}/config${["production", "development"].includes(NODE_ENV) ? ".dev.json" : ".json"}`
);

const dirConfigCommands = path.normalize(
    `${__dirname}/configCommands${["production", "development"].includes(NODE_ENV) ? ".dev.json" : ".json"}`
);

// Supervisor থেকে দেওয়া অ্যাকাউন্ট ফাইল ব্যবহার করবে।
const dirAccount = process.env.BOT_ACCOUNT_FILE
    ? path.resolve(process.env.BOT_ACCOUNT_FILE)
    : path.normalize(
        `${__dirname}/account${["production", "development"].includes(NODE_ENV) ? ".dev.txt" : ".txt"}`
    );

for (const pathDir of [dirConfig, dirConfigCommands]) {
    try {
        validJSON(pathDir);
    } catch (err) {
        log.error(
            "CONFIG",
            `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n` +
            `${err.message.split("\n").map(line => `  ${line}`).join("\n")}\n` +
            "Please fix it and restart bot"
        );
        process.exit(0);
    }
}

const config = require(dirConfig);

if (
    config.whiteListMode?.whiteListIds &&
    Array.isArray(config.whiteListMode.whiteListIds)
) {
    config.whiteListMode.whiteListIds =
        config.whiteListMode.whiteListIds.map(id => id.toString());
}

const configCommands = require(dirConfigCommands);

global.GoatBot = {
    startTime: Date.now() - process.uptime() * 1000,
    commands: new Map(),
    eventCommands: new Map(),
    commandFilesPath: [],
    eventCommandsFilesPath: [],
    aliases: new Map(),
    onFirstChat: [],
    onChat: [],
    onEvent: [],
    onReply: new Map(),
    onReaction: new Map(),
    onAnyEvent: [],
    config,
    configCommands,
    envCommands: {},
    envEvents: {},
    envGlobal: {},
    reLoginBot: function () {},
    Listening: null,
    oldListening: [],
    callbackListenTime: {},
    storage5Message: [],
    fcaApi: null,
    botID: null
};

global.db = {
    allThreadData: [],
    allUserData: [],
    allDashBoardData: [],
    allGlobalData: [],
    threadModel: null,
    userModel: null,
    dashboardModel: null,
    globalModel: null,
    threadsData: null,
    usersData: null,
    dashBoardData: null,
    globalData: null,
    receivedTheFirstMessage: {}
};

global.client = {
    dirConfig,
    dirConfigCommands,
    dirAccount,
    countDown: {},
    cache: {},
    database: {
        creatingThreadData: [],
        creatingUserData: [],
        creatingDashBoardData: [],
        creatingGlobalData: []
    },
    commandBanned: configCommands.commandBanned
};

const utils = require("./utils.js");
global.utils = utils;

const { colors } = utils;

global.temp = {
    createThreadData: [],
    createUserData: [],
    createThreadDataError: [],
    filesOfGoogleDrive: {
        arraybuffer: {},
        stream: {},
        fileNames: {}
    },
    contentScripts: {
        cmds: {},
        events: {}
    }
};

const watchAndReloadConfig = (dir, type, prop, logName) => {
    let lastModified = fs.statSync(dir).mtimeMs;
    let isFirstModified = true;

    fs.watch(dir, eventType => {
        if (eventType === type) {
            const oldConfig = global.GoatBot[prop];

            setTimeout(() => {
                try {
                    if (isFirstModified) {
                        isFirstModified = false;
                        return;
                    }

                    if (lastModified === fs.statSync(dir).mtimeMs) {
                        return;
                    }

                    global.GoatBot[prop] = JSON.parse(
                        fs.readFileSync(dir, "utf-8")
                    );

                    log.success(
                        logName,
                        `Reloaded ${dir.replace(process.cwd(), "")}`
                    );
                } catch (err) {
                    log.warn(
                        logName,
                        `Can't reload ${dir.replace(process.cwd(), "")}`
                    );
                    global.GoatBot[prop] = oldConfig;
                } finally {
                    lastModified = fs.statSync(dir).mtimeMs;
                }
            }, 200);
        }
    });
};

watchAndReloadConfig(
    dirConfigCommands,
    "change",
    "configCommands",
    "CONFIG COMMANDS"
);

watchAndReloadConfig(dirConfig, "change", "config", "CONFIG");

global.GoatBot.envGlobal = global.GoatBot.configCommands.envGlobal;
global.GoatBot.envCommands = global.GoatBot.configCommands.envCommands;
global.GoatBot.envEvents = global.GoatBot.configCommands.envEvents;

const getText = global.utils.getText;

// AUTO RESTART
if (config.autoRestart) {
    const time = config.autoRestart.time;

    if (!isNaN(time) && time > 0) {
        utils.log.info(
            "AUTO RESTART",
            getText("Goat", "autoRestart1", utils.convertTime(time, true))
        );

        setTimeout(() => {
            utils.log.info("AUTO RESTART", "Restarting...");
            process.exit(2);
        }, time);
    } else if (
        typeof time === "string" &&
        time.match(/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/gmi)
    ) {
        utils.log.info(
            "AUTO RESTART",
            getText("Goat", "autoRestart2", time)
        );

        const cron = require("node-cron");

        cron.schedule(time, () => {
            utils.log.info("AUTO RESTART", "Restarting...");
            process.exit(2);
        });
    }
}

(async () => {
    require(`./bot/login/login${NODE_ENV === "development" ? ".dev.js" : ".js"}`);
})();
