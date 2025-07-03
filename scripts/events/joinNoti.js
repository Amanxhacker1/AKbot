const { getTime } = global.utils;
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "joinNoti",
    version: "2.3",
    author: "NTKhang (Modified by You)",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const { nickNameBot } = global.GoatBot.config;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    const threadData = await threadsData.get(threadID);
    if (threadData.settings.sendWelcomeMessage === false) return;

    const threadInfo = await api.getThreadInfo(threadID).catch(() => ({}));
    const groupName = threadInfo?.name || "this group";

    const form = {};

    if (dataAddedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
      // Bot add hua hai
      if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
      form.body = `Thank you for inviting me!\nBot prefix: ${prefix}\nUse ${prefix}help to see commands.`;
    } else {
      // Normal user add hua
      const newMembers = dataAddedParticipants.map(user => user.fullName).join(", ");
      form.body = `✨ ★¸.•☆•.¸★ 🅆🄴🄻🄲🄾🄼🄴 🄷🄾 🄶🄰🅈🄰 🄰🄰🄿🄺🄰 ★⡀. *${newMembers}* Injoy Karo😬 *${groupName}* ✨

💝🥀𝐎𝐖𝐍𝐄𝐑:- ☞💕͢͡⃟៚̗̗̗̗̗̗̀̀̀̀̀𝐑𝐚𝐣🙃💔☜ 

✮☸✮
✮┼💞┼✮
☸🕊️━━•🌸•━━🕊️☸
✮☸✮
✮┼🍫┼✮
☸🎀━━•🧸•━━🎀☸
✮┼🦢┼✮
✮☸✮
☸🌈━━•🤍•━━🌈☸
✮☸✮
✮┼❄️┼✮

┏━🕊️━━°❀•°:🎀🧸💙🧸🎀:°•❀°━━💞━┓🌸✦✧✧✧✧✰🍒R⃣A⃣J⃣🌿✰✧✧✧✧✦🌸  
┗━🕊️━━°❀•°:🎀🧸💙🧸🎀:°•❀°━━💞━┛`;
    }

    // Video/gif attach karna
    const gifFolder = path.join(__dirname, "cache/joinGif/randomgif");
    const files = fs.readdirSync(gifFolder).filter(file =>
      [".mp4", ".gif"].includes(path.extname(file).toLowerCase())
    );

    if (files.length > 0) {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      const filePath = path.join(gifFolder, randomFile);
      form.attachment = fs.createReadStream(filePath);
    }

    message.send(form);
  }
};
