module.exports = {
  config: {
    name: "lockname",
    version: "2.0",
    author: "Raj",// Author Name change Karne per file nahi chalega
    role: 1, // Sirf admin use kar sake
    shortDescription: "Lock and monitor group name",
    longDescription: "Locks the group name and prevents any changes.",
    category: "group",
    guide: "{pn} [on/off]"
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    if (!args[0]) return api.sendMessage("❌ Usage: lockname on/off", threadID);

    if (args[0].toLowerCase() === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      const currentName = threadInfo.threadName;

      global.groupNameLock = global.groupNameLock || {};
      global.groupNameLock[threadID] = currentName;

      return api.sendMessage(`🔒 Group name locked: "${currentName}".\nAgar koi name change karega toh main wapas set kar dunga.`, threadID);
    }

    if (args[0].toLowerCase() === "off") {
      if (!global.groupNameLock || !global.groupNameLock[threadID]) return api.sendMessage("⚠️ Group name pehle se unlocked hai!", threadID);

      delete global.groupNameLock[threadID];
      return api.sendMessage("✅ Group name lock hat gaya, ab koi bhi name change kar sakta hai.", threadID);
    }

    return api.sendMessage("❌ Invalid option! Use: lockname on/off", threadID);
  },

  onEvent: async function ({ api, event }) {
    if (!global.groupNameLock || !global.groupNameLock[event.threadID]) return;

    const threadInfo = await api.getThreadInfo(event.threadID);
    const currentName = threadInfo.threadName;
    const lockedName = global.groupNameLock[event.threadID];

    if (currentName !== lockedName) {
      // Name change detect ho gaya, wapas purana name set karte hain
      await api.setTitle(lockedName, event.threadID);
      api.sendMessage(`⚠️ Group name change detect hua! Name wapas "${lockedName}" set kar diya gaya.`, event.threadID);
    }
  }
};
