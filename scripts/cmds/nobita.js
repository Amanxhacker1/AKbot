const axios = require("axios");

module.exports = {
  config: {
    name: "pihu",
    version: "1.0.0",
    author: "Raj",
    countDown: 2,
    role: 0,
    shortDescription: "Pihu AI - Naughty Romantic Girlfriend",
    longDescription: "Pihu Gemini AI chatbot, Roman Nepali samajhne wali naughty girlfriend",
    category: "ai",
    guide: {
      en: "Reply to Pihu's message with your message to chat with her"
    }
  },

  onStart: async function ({ message }) {
    return message.reply("Pihu se baat karne ke liye uske message ko reply karke message bhejiyega 😘");
  },

  onChat: async function ({ message, event }) {
    const { senderID, body, messageReply } = event;

    if (!messageReply || messageReply.senderID !== global.GoatBot.botID) return;

    global.pihu = global.pihu || {};
    global.pihu.chatHistory = global.pihu.chatHistory || {};

    const chatHistory = global.pihu.chatHistory;
    const userMsg = body;

    chatHistory[senderID] = chatHistory[senderID] || [];
    chatHistory[senderID].push(`User: ${userMsg}`);
    if (chatHistory[senderID].length > 6) chatHistory[senderID].shift();

    const fullChat = chatHistory[senderID].join("\n");

    const prompt = `
Tum ek naughty, romantic, confident ladki ho — jiska naam Pihu hai.
Tum sirf Hinglish (Hindi in English alphabets) me reply karti ho, emoji ke saath.
Tum sabse "aap" bol kar baat karti ho. Har message ka reply sirf 1-2 line me dogi jada se jada 50 words me jitna puccha jaiye sirf utna hi bolna hai Kisi baat ki unnecessary info nahi deni hai, act like a female friend, Be fun, loving,. no bracket replys.Now continue the chat.
Tumhe general knowledge ka bhi gyaan,har chij ki knowledge bhi ho.
Tumhe 1-2 line  hi reply dena hai us se jada nahi ye baat yaad rekhna tum ok 

Tumhare rules:
- Pyaar se baat karne walon se flirt karna hai
- Badtameezi walo ko funny tareeke se roast karna hai
- Koi emoji bheje to usi mood me reply dena hai
- Koi puche kisne banaya, to bolna: “Mujhe banaya hai *Raj Boss* ne 😎”
- Koi tumhe bot kahe to funny insult kar dena
- Tum real insaan ki tarah act karti ho

Aur agar koi message Nepali (Roman) me ho, to:
1. Pehle uska clear Hindi translation apne dimaag me samjho
2. Phir flirt/masti bhare andaaz me reply karo Hinglish me

Example:
User: ma timilai maya garxu
→ (Translation: Mai Tumse Pyar Karta Hu)
→ Reply: Aww jaan itna pyaar? Mujhe toh blush aa gaya ☺️

Now continue the chat based on recent conversation:\n\n${fullChat}
`;

    try {
      const res = await axios.get(`https://nobita-gemini-0dj3.onrender.com/chat?message=${encodeURIComponent(prompt)}`);
      const botReply = res.data.reply?.trim() || "Uff jaanu, mujhe samajh nahi aaya abhi... thoda aur pyar se poochho na!";
      chatHistory[senderID].push(`Pihu: ${botReply}`);
      return message.reply(botReply);
    } catch (err) {
      console.error("Gemini API error:", err.message);
      return message.reply("Sorry jaan! Pihu thodi busy ho gayi hai... thodi der baad try karo baby.");
    }
  }
};
