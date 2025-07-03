const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "music",
    aliases: ["song", "sing"],
    version: "1.0",
    author: "Raj",
    countDown: 5,
    role: 0,
    shortDescription: "Download music from YouTube",
    longDescription: "Search YouTube and download the song in MP3 format.",
    category: "media",
    guide: "{pn} [song name]"
  },

  onStart: async function ({ message, args }) {
    if (!args.length) return message.reply("❌ Please provide a song name.");

    const query = args.join(" ");
    try {
      message.reply("🔎 Searching for the song...");

      const searchResults = await yts(query);
      if (!searchResults.videos.length) return message.reply("⚠️ No results found.");

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const videoTitle = video.title;
      const thumbnail = video.thumbnail;

      const apiUrl = `https://nobita-music-ye7e.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.file_url) {
        console.log("❌ Invalid API response:", response.data);
        return message.reply("❌ Could not fetch the MP3 file. Try again.");
      }

      const fileUrl = response.data.file_url;
      const filePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);

      await message.reply({
        body: `🎵 *Title:* ${videoTitle}\n🔗 *Link:* ${videoUrl}`,
        attachment: await global.utils.getStreamFromURL(thumbnail)
      });

      const stream = await global.utils.getStreamFromURL(fileUrl);
      if (!stream) return message.reply("❌ Failed to get MP3 stream.");

      const writer = fs.createWriteStream(filePath);
      stream.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({ attachment: fs.createReadStream(filePath) });

        // Delete after 10 seconds
        setTimeout(() => {
          fs.unlink(filePath, err => {
            if (err) console.error("❌ Error deleting file:", err);
          });
        }, 10000);
      });

    } catch (error) {
      console.error("🚨 Music Command Error:", error);
      return message.reply(`⚠️ Error: ${error.message}`);
    }
  }
};
