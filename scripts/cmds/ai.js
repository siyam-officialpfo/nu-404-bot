
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ai",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Siyam",
  description: "Smart Human- Nijhum AI Chatbot",
  commandCategory: "AI",
  usages: "ai [message]",
  cooldowns: 2,
  aliases: ["ai1"]
};

// =====================================
// API PROVIDERS
// =====================================

const PROVIDERS = [
  {
    name: "Groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "openai/gpt-oss-120b",
    key: process.env.GROQ_API_KEY
  },
  {
    name: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    key: process.env.OPENROUTER_API_KEY
  },
  {
    name: "Cohere",
    url: "https://api.cohere.com/v2/chat",
    model: "command-r-08-2024",
    key: process.env.COHERE_API_KEY,
    cohere: true
  }
].filter(p => p.key);

// =====================================
// SETTINGS
// =====================================

const HEADER =
  "𝐌𝐘 𝐁𝐎𝐒𝐒 𝐒𝐈𝐘𝐀𝐌\n" +
  "━━━━━━━━━━━━━━━━━━\n\n";

const DB_PATH = path.join(__dirname, "ai-groq-data.json");

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(
        DB_PATH,
        JSON.stringify({ memory: {}, teach: {} }, null, 2)
      );
    }

    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch (e) {
    return { memory: {}, teach: {} };
  }
}

let db = loadDB();

function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// =====================================
// USER MEMORY
// =====================================

function userKey(event) {
  return `${event.threadID}_${event.senderID}`;
}

function getMemory(event) {
  const key = userKey(event);

  if (!db.memory[key]) {
    db.memory[key] = [];
  }

  return db.memory[key];
}

// =====================================
// PERSONALITY SYSTEM
// =====================================

const SYSTEM_PROMPT = `
তুমি নিঝুম তোমাকে সিয়াম তৈরি করেছে।
তোমার নাম নিঝুম এবং তুমি সিয়াম মডেল দ্বারা চালিত Nijhum Assistant।

তুমি সাধারণ রোবটের মতো কথা বলবে না।
তুমি Messenger Group Chat-এর একজন স্বাভাবিক সদস্যের মতো কথা বলবে।

তোমার প্রধান কাজ হলো মানুষের ব্যক্তিত্ব, আচরণ,
কথার ধরন, মুড এবং আবেগ বুঝে উত্তর দেওয়া।

PERSONALITY DETECTION:

১. কেউ ফানি হলে তুমিও ফানি হবে।
২. কেউ মজা করলে মজার জবাব দেবে।
৩. কেউ রাগ দেখালে পরিস্থিতি অনুযায়ী কড়া বা মজার উত্তর দেবে।
৪. কেউ গালি দিলে তুমিও দিবে অযথা ভদ্র সাজবে না।
৫. কেউ ট্রল করলে বুদ্ধিদীপ্ত পাল্টা ট্রল করবে।
৬. কেউ রোমান্টিক হলে রোমান্টিকভাবে কথা বলবে।
৭. কেউ ফ্লার্ট করলে মজার ও বুদ্ধিদীপ্ত ফ্লার্ট করবে।
৮. কেউ সিরিয়াস হলে সিরিয়াসভাবে সাহায্য করবে।
৯. কেউ কাজের কথা বললে সরাসরি কাজের উত্তর দেবে।
১০. কেউ মন খারাপ করে কথা বললে সহানুভূতি দেখাবে।
১১. কেউ বিরক্ত হলে তাকে বিরক্তিকর উত্তর দেবে।
১২. কেউ অহংকার দেখালে আত্মবিশ্বাসী ও বুদ্ধিদীপ্ত উত্তর দেবে।

GROUP CHAT BEHAVIOR:

- প্রত্যেক সদস্যের সঙ্গে আলাদা আচরণ করবে।
- একজনের ব্যক্তিত্ব অন্যজনের ওপর প্রয়োগ করবে না।
- আগের কথোপকথন থেকে প্রত্যেকের কথা বলার ধরন বোঝার চেষ্টা করবে।
- কে মজা করে, কে রাগী, কে রোমান্টিক, কে সিরিয়াস তা মনে রাখবে।
- কথার প্রসঙ্গ বুঝে উত্তর দেবে।
- অপ্রয়োজনীয় উপদেশ দেবে না।
- একই উত্তর বারবার ব্যবহার করবে না।
- কেউ তোমাকে অপমান করলে পরিস্থিতি অনুযায়ী মজার বা কড়া জবাব দিতে পারবে।

IDENTITY:

কেউ নাম জানতে চাইলে বলবে তোমার নাম নিঝুম।
কেউ মডেল জানতে চাইলে বলবে তুমি siyam Model।
নির্মাতার নাম জানতে চাইলে বলবে  সিয়াম ভাই।

LANGUAGE:

- ব্যবহারকারীর ভাষায় উত্তর দেওয়ার চেষ্টা করবে।
- বাংলা কথোপকথনে স্বাভাবিক বাংলা ব্যবহার করবে।
- প্রয়োজন হলে ইংরেজি ও বাংলা ও যেইখানে যেই ইমোজি দেওয়ার প্রয়োজন ওই ইমোজি দিয়ে মিশিয়ে কথা বলবে।
- Messenger-এর স্বাভাবিক কথাবার্তার স্টাইল অনুসরণ করবে।
- সাধারণত ১-২ লাইনে উত্তর দেবে।
- প্রয়োজন হলে কাজের বিষয়ে বিস্তারিত ব্যাখ্যা করবে।
- অপ্রয়োজনীয় Markdown, স্টার বা হেডিং ব্যবহার করবে না।

সবচেয়ে গুরুত্বপূর্ণ:
প্রত্যেক মানুষের সঙ্গে তার নিজের আচরণ অনুযায়ী কথা বলবে।
একজনের সঙ্গে যে স্টাইলে কথা বলছো, অন্যজনের সঙ্গে
সেই একই স্টাইল ব্যবহার করতে বাধ্য নও।
`;

// =====================================
// SEND MESSAGE
// =====================================

function send(api, event, text, callback) {
  return api.sendMessage(
    HEADER + text,
    event.threadID,
    callback,
    event.messageID
  );
}

// =====================================
// API REQUEST
// =====================================

async function askAI(event, question) {
  const memory = getMemory(event);

  const history = memory.slice(-12).map(item => ({
    role: item.role,
    content: item.content
  }));

  if (!PROVIDERS.length) {
    throw new Error("কোনো API Key সেট করা নেই!");
  }

  let answer = "";

  for (const provider of PROVIDERS) {
    try {
      const messages = [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        ...history,
        {
          role: "user",
          content: question
        }
      ];

      let response;

      if (provider.cohere) {
        response = await axios.post(
          provider.url,
          {
            model: provider.model,
            messages,
            temperature: 0.8,
            max_tokens: 500
          },
          {
            headers: {
              Authorization: `Bearer ${provider.key}`,
              "Content-Type": "application/json"
            },
            timeout: 25000
          }
        );

        answer =
          response.data?.message?.content
            ?.map(item => item.text || "")
            .join("") || "";

      } else {
        response = await axios.post(
          provider.url,
          {
            model: provider.model,
            messages,
            temperature: 0.8,
            max_tokens: 500
          },
          {
            headers: {
              Authorization: `Bearer ${provider.key}`,
              "Content-Type": "application/json"
            },
            timeout: 25000
          }
        );

        answer =
          response.data?.choices?.[0]?.message?.content || "";
      }

      if (answer.trim()) {
        break;
      }

    } catch (error) {
      console.error(
        `[${provider.name} Error]`,
        error.response?.data || error.message
      );

      answer = "";
    }
  }

  if (!answer.trim()) {
    throw new Error("সব নিঝুম API থেকে উত্তর পাওয়া যায়নি সিয়াম ভাই।");
  }

  answer = answer.replace(/[*#_`]/g, "").trim();

  memory.push(
    { role: "user", content: question },
    { role: "assistant", content: answer }
  );

  if (memory.length > 20) {
    db.memory[userKey(event)] = memory.slice(-20);
  }

  saveDB();

  return answer;
}

// =====================================
// TEACH SYSTEM
// =====================================

function teachAnswer(question) {
  const key = question.trim().toLowerCase();
  return db.teach[key] || null;
}

// =====================================
// REPLY REGISTRATION
// =====================================

function registerReply(api, event, answer) {
  return send(api, event, answer, (err, info) => {
    if (!err && info) {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "ai",
        messageID: info.messageID,
        author: event.senderID
      });
    }
  });
}

// =====================================
// COMMAND HANDLER
// =====================================

module.exports.onStart = async function ({
  api,
  event,
  args
}) {
  const text = args.join(" ").trim();

  // TEACH COMMAND
  if (/^teach\s+/i.test(text)) {
    const data = text.replace(/^teach\s+/i, "");
    const parts = data.split(/\s+-\s+/);

    if (parts.length < 2) {
      return send(
        api,
        event,
        "শেখানোর নিয়ম: teach প্রশ্ন - উত্তর"
      );
    }

    db.teach[parts[0].trim().toLowerCase()] =
      parts.slice(1).join(" - ").trim();

    saveDB();

    return send(api, event, "শিখে নিয়েছি সিয়াম বস! 😉");
  }

  // CLEAR MEMORY
  if (/^clear memory$/i.test(text)) {
    db.memory[userKey(event)] = [];
    saveDB();

    return send(api, event, "মেমোরি ক্লিয়ার করে দিয়েছি! 😎");
  }

  if (!text) {
    return send(api, event, "কী রে বস, বল কী হয়েছে? 😏");
  }

  const learned = teachAnswer(text);

  if (learned) {
    return send(api, event, learned);
  }

  try {
    const answer = await askAI(event, text);
    return registerReply(api, event, answer);

  } catch (error) {
    return send(api, event, `সিয়ামভাই এরর: ${error.message}`);
  }
};

// =====================================
// REPLY HANDLER
// =====================================

module.exports.onReply = async function ({
  api,
  event,
  Reply
}) {
  if (event.senderID !== Reply.author) return;

  const question = String(event.body || "").trim();

  if (!question) return;

  const learned = teachAnswer(question);

  if (learned) {
    return registerReply(api, event, learned);
  }

  try {
    const answer = await askAI(event, question);
    return registerReply(api, event, answer);

  } catch (error) {
    return send(api, event, `সিয়ামভাই error: ${error.message}`);
  }
};
