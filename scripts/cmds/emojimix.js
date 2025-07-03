const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix"],
    version: "1.5",
    author: "Raj",
    countDown: 5,
    role: 0,
    description: {
      vi: "Mix 2 emoji lại với nhau",
      en: "Mix 2 emoji together"
    },
    guide: {
      vi: "{pn} 🤣🥰 (không có khoảng trắng)",
      en: "{pn} 🤣🥰 (no space between emojis)"
    },
    category: "fun"
  },

  langs: {
    vi: {
      error: "Rất tiếc, emoji %1 và %2 không mix được",
      success: "Đây là kết quả khi mix emoji %1 và %2"
    },
    en: {
      error: "Sorry, emoji %1 and %2 can't mix",
      success: "Here is the mix of emoji %1 and %2"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    if (!args[0]) return message.SyntaxError();

    const input = args.join("");

    const matched = Array.from(input.matchAll(/([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu)).map(m => m[0]);

    if (matched.length < 2)
      return message.reply("❌ Please provide two emojis together (e.g., 🙂🥵)");

    const emoji1 = matched[0];
    const emoji2 = matched[1];

    const imageStream = await generateEmojimix(emoji1, emoji2);
    if (!imageStream) return message.reply(getLang("error", emoji1, emoji2));

    message.reply({
      body: getLang("success", emoji1, emoji2),
      attachment: imageStream
    });
  }
};

async function generateEmojimix(emoji1, emoji2) {
  try {
    const response = await axios.get("https://nobita-emojimix.onrender.com/emojimix", {
      params: { emoji1, emoji2 },
      responseType: "arraybuffer"
    });

    const fileName = `emojimix_${Date.now()}.png`;
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    const stream = fs.createReadStream(filePath);
    stream.on("close", () => fs.unlinkSync(filePath)); // clean file after use
    return stream;

  } catch (err) {
    return null;
  }
}
