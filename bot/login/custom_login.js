const log = require('../../logger/log.js');

// ═══════════════════════════════════════════
// 👑 EDITABLE INFORMATION - CHANGE FROM HERE
// ═══════════════════════════════════════════

const DESIGN = {
    owner: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    developer: "𝐒𝐈𝐘𝐀𝐌 𝐇𝐀𝐒𝐀𝐍",

    botName: "[ , ]𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓",
    project: "𝐍𝐔-𝟒𝟎𝟒-𝐁𝐎𝐓",
    framework: "𝐆𝐎𝐀𝐓𝐁𝐎𝐓 𝐕𝟐",

    fca: "𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓",
    fcaLibrary: "𝐖𝐒𝟑-𝐅𝐂𝐀",

    prefix: ",",
    commands: "250+",
    node: "𝐍𝐎𝐃𝐄.𝐉𝐒 𝟐𝟎+",
    database: "𝐒𝐐𝐋𝐈𝐓𝐄",
    timezone: "𝐀𝐒𝐈𝐀/𝐃𝐇𝐀𝐊𝐀",

    developerType: "𝐅𝐑𝐎𝐍𝐓𝐄𝐍𝐃 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑",

    github: "https://github.com/siyam-officialpfo/nu-404-bot.git",
    whatsapp: "https://wa.me/8801789138157",
    phone: "+8801789138157",

    country: "𝐁𝐀𝐍𝐆𝐋𝐀𝐃𝐄𝐒𝐇",

    welcome: "আশা করি আমার এই বটটি ব্যবহার করে অনেক মজা পাবেন।",
    prayer: "সবাই আমার জন্য দোয়া করবেন।",
    problem: "কোনো সমস্যা হলে অবশ্যই যোগাযোগ করবেন।",
    thanks: "আপনাদের ভালোবাসা ও সাপোর্টের জন্য অসংখ্য ধন্যবাদ।"
};

// ═══════════════════════════════════════════
// 🎨 COLOR CONFIGURATION
// ═══════════════════════════════════════════

const COLOR = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    brightRed: "\x1b[91m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m",
    bold: "\x1b[1m",
    reset: "\x1b[0m"
};

// ═══════════════════════════════════════════
// 👑 OFFICIAL BOT DESIGN
// ═══════════════════════════════════════════

function showCustomDesign() {

    const print = (message, color = COLOR.white) => {
        log.info("SIYAM", color + message + COLOR.reset);
    };

    // 👑 OWNER IDENTITY

    print(" ");
    print("╭─ 👑 " + DESIGN.owner + " 👑", COLOR.brightYellow);
    print("│", COLOR.cyan);

    print("├─ 🧑‍💻 𝐌𝐀𝐈𝐍 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 : " + DESIGN.developer, COLOR.brightCyan);
    print("├─ ⚙️ 𝐁𝐎𝐓 𝐂𝐑𝐄𝐀𝐓𝐎𝐑 : " + DESIGN.developer, COLOR.green);
    print("├─ 🧠 𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐎𝐖𝐍𝐄𝐑 : " + DESIGN.owner, COLOR.magenta);
    print("├─ 💻 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐓𝐘𝐏𝐄 : " + DESIGN.developerType, COLOR.blue);

    print("│", COLOR.cyan);

    // 🚀 PROJECT INFORMATION

    print("├─ 🚀 𝐏𝐑𝐎𝐉𝐄𝐂𝐓 : " + DESIGN.project, COLOR.brightRed);
    print("├─ 📦 𝐁𝐎𝐓 𝐍𝐀𝐌𝐄 : " + DESIGN.botName, COLOR.brightGreen);
    print("├─ 🏷️ 𝐅𝐂𝐀 𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄 : " + DESIGN.fca, COLOR.brightYellow);
    print("├─ 🧩 𝐅𝐑𝐀𝐌𝐄𝐖𝐎𝐑𝐊 : " + DESIGN.framework, COLOR.cyan);
    print("├─ 🔌 𝐅𝐂𝐀 𝐋𝐈𝐁𝐑𝐀𝐑𝐘 : " + DESIGN.fcaLibrary, COLOR.magenta);

    print("│", COLOR.cyan);

    // ⚙️ SYSTEM INFORMATION

    print("├─ 🎯 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐏𝐑𝐄𝐅𝐈𝐗 : " + DESIGN.prefix, COLOR.green);
    print("├─ 📊 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 : " + DESIGN.commands, COLOR.yellow);
    print("├─ 🖥️ 𝐑𝐔𝐍𝐓𝐈𝐌𝐄 : " + DESIGN.node, COLOR.blue);
    print("├─ 🗄️ 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄 : " + DESIGN.database, COLOR.brightMagenta);
    print("├─ 🕒 𝐓𝐈𝐌𝐄𝐙𝐎𝐍𝐄 : " + DESIGN.timezone, COLOR.brightCyan);
    print("├─ 📡 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃 : 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐄𝐃", COLOR.brightGreen);

    print("│", COLOR.cyan);

    // 🔗 SOURCE CODE & SUPPORT

    print("├─ 🔗 𝐆𝐈𝐓𝐇𝐔𝐁 : " + DESIGN.github, COLOR.brightYellow);
    print("├─ 📞 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 : " + DESIGN.phone, COLOR.green);
    print("├─ 💬 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 : " + DESIGN.whatsapp, COLOR.brightGreen);
    print("├─ 🌍 𝐂𝐎𝐔𝐍𝐓𝐑𝐘 : " + DESIGN.country, COLOR.cyan);

    print("│", COLOR.cyan);

    // 📋 OWNER COMMANDS

    print("├─ 📋 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 : ,owner", COLOR.magenta);
    print("├─ 📚 𝐄𝐗𝐓𝐑𝐀 𝐈𝐍𝐅𝐎 : ,owner2", COLOR.blue);

    print("│", COLOR.cyan);

    // ❤️ BANGLA WELCOME MESSAGE

    print("├─ 💖 " + DESIGN.welcome, COLOR.brightRed);
    print("├─ 🤲 " + DESIGN.prayer, COLOR.brightGreen);
    print("├─ 📝 " + DESIGN.problem, COLOR.brightYellow);
    print("├─ 🌸 " + DESIGN.thanks, COLOR.brightMagenta);

    print("│", COLOR.cyan);

    // 👑 FINAL SIGNATURE

    print("╰─ ✨ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 " + DESIGN.developer, COLOR.brightCyan);
    print(" ");

}

// ═══════════════════════════════════════════
// 🚀 INITIALIZE DESIGN
// ═══════════════════════════════════════════

showCustomDesign();
