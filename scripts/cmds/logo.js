const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "logo",
    version: "1.0",
    aliases: [],
    author: "Raj",
    countDown: 5,
    role: 0,
    shortDescription: "Generate logos",
    longDescription: "Generate different types of logos using API",
    category: "logo",
    guide: "{pn} list\n{pn} <number> <name>"
  },

  onStart: async function ({ message, args, event, api, commandName }) {
    const { threadID, messageID } = event;

    // If user requests the logo list
    if (args.length === 1 && args[0] === "list") {
      const logoTypes = [
        "1: Blackpink",
        "2: American Flag",
        "3: Glossy Silver",
        "4: Bear Logo",
        "5: 3D Balloon",
        "6: Comic Style",
        "7: Pixel Glitch",
        "8: Digital Glitch",
        "9: Naruto Shippuden",
        "10: Devil Wings",
        "11: Wet Glass",
        "12: Typography Status",
        "13: Dragon Ball",
        "14: Castle Pop",
        "15: Frozen Christmas",
        "16: Foggy Glass",
        "17: Neon Light",
        "18: Colour Paint",
        "19: Logo Maker"
      ];
      return message.reply(`Available Logo Types:\n\n${logoTypes.join("\n")}`);
    }

    if (args.length < 2) {
      return message.reply(`Usage: ${commandName} <number> <name>\nTo see all logo types: ${commandName} list`);
    }

    const type = args[0];
    const name = args.slice(1).join(" ");
    const pathImg = `${__dirname}/cache/logo_${Date.now()}.png`;

    const logoApis = {
      "1": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=",
      "2": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=",
      "3": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html&name=",
      "4": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=",
      "5": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=",
      "6": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=",
      "7": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html&name=",
      "8": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html&name=",
      "9": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=",
      "10": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=",
      "11": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=",
      "12": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=",
      "13": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=",
      "14": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=",
      "15": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=",
      "16": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=",
      "17": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=",
      "18": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=",
      "19": "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html&name="
      
    };

    if (!logoApis[type]) {
      return message.reply("Invalid logo type! Use: logo list to view available types.");
    }

    const apiUrl = `${logoApis[type]}${encodeURIComponent(name)}`;

    try {
      message.reply("Generating your logo, please wait...");
      const response = await axios.get(apiUrl);
      if (!response.data.result || !response.data.result.download_url) {
        return message.reply("Failed to generate the logo. Please try again later.");
      }

      const downloadUrl = response.data.result.download_url;
      const imageResponse = await axios.get(downloadUrl, { responseType: "arraybuffer" });

     
