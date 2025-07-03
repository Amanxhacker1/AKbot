const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    aliases: ["mp4"],
    version: "2.2",
    author: "Raj",
    countDown: 5,
    role: 0,
    shortDescription: "Download YouTube video with reply",
    longDescription: "Search YouTube, choose from top 5 results and download selected MP4 video.",
    category: "media",
    guide: "{pn} [video name]"
  },

  onStart: async function ({ message, args, event }) {
    if (!args.length) return message.reply("❌ Please provide a video name.");

    const query = args.join(" ");
    try {
      const searchResults = await yts(query);
      const top5 = searchResults.videos.slice(0, 5);
      if (!top5.length) return message.reply("⚠️ No results found.");

      let replyText = `🎬 Top 5 results for: ${query}\n\n`;
      let attachments = [];

      for (let i = 0; i < top5.length; i++) {
        const v = top5[i];
        replyText += `${i + 1}. ${v.title}\n⏱ ${v.timestamp} | 👁 ${v.views.toLocaleString()}\n\n`;
        const stream = await global.utils.getStreamFromURL(v.thumbnail);
        attachments.push(stream);
      }

      replyText += "💬 Reply with 1-5 to download that video.";

      message.reply({
        body: replyText,
        attachment: attachments
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          results: top5
        });
      });

    } catch (err) {
      console.error("❌ Search error:", err);
      return message.reply("❌ YouTube search failed.");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const { senderID, body } = event;
    if (senderID !== Reply.author)
      return message.reply("⚠️ Only the original user can reply to this message.");

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length)
      return message.reply("❌ Invalid choice. Reply with a number from 1 to 5.");

    const selected = Reply.results[choice - 1];
    const videoUrl = selected.url;
    const videoTitle = selected.title;
    const thumbnail = selected.thumbnail;
    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

    message.reply({
      body: `📥 Downloading:\n🎬 ${videoTitle}\n🔗 ${videoUrl}`,
      attachment: await global.utils.getStreamFromURL(thumbnail)
    });

    try {
      const apiUrl = `https://nobita-music-ye7e.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=video`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.file_url) {
        console.error("❌ API error:", res.data);
        return message.reply("❌ API failed to fetch video.");
      }

      const stream = await global.utils.getStreamFromURL(res.data.file_url);
      const writer = fs.createWriteStream(filePath);
      stream.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({ attachment: fs.createReadStream(filePath) });

        // Delete after 15 seconds
        setTimeout(() => fs.unlinkSync(filePath), 15000);
      });

    } catch (err) {
      console.error("🚨 Video Download Error:", err);
      message.reply("❌ Failed to download the video.");
    }
  }
};
