const { getTime, drive } = global.utils;
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "leave",
		version: "1.5",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			leaveType1: "tự rời",
			leaveType2: "bị kick",
			defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			leaveType1: "[⚜️] 👉🏻👉🏻 {userName}👈🏻👈🏻▬▬▬▬ KO Bhaga diya ....  [⚜️]\n😒😒\n🌺🌸🌺 🙏🏻 🙂●▬▬▬▬๑۩۩BEHTI HAWA SA THAA WO 😥 uDTI PATANG✨✨ SAA THAA WOO ♥ KAHA GAYA USE DHOONDHO🤔🤔🤔●▬▬▬▬๑۩ 🙏🏻💐<3😊💔\n\n[❤️‍🔥] 🖤🖤😥😥...Good",
			leaveType2: "[⚜️] 👉🏻👉🏻 {userName}👈🏻👈🏻▬▬▬▬ KO Bhaga diya ....  [⚜️]\n😒😒\n🌺🌸🌺 🙏🏻 🙂●▬▬▬▬๑۩۩BEHTI HAWA SA THAA WO 😥 uDTI PATANG✨✨ SAA THAA WOO ♥ KAHA GAYA USE DHOONDHO🤔🤔🤔●▬▬▬▬๑۩ 🙏🏻💐<3😊💔\n\n[❤️‍🔥] 🖤🖤😥😥...Good",
			defaultLeaveMessage: "{userName} {type} Group se",
			adminRemoveMessage: "😈 {adminName} ne {userName} Bechare Ko[⚜️] 👉🏻👉🏻🙂👈🏻👈🏻▬▬▬▬ Bhaga Diya Group Se .... {type} [⚜️]\n😒😒\n🌺🌸🌺 🙏🏻 🙂●▬▬▬▬๑۩۩BEHTI HAWA SA THAA WO 😥 uDTI PATANG✨✨ SAA THAA WOO ♥ KAHA GAYA USE DHOONDHO🤔🤔🤔●▬▬▬▬๑۩ 🙏🏻💐<3😊💔\n\n[❤️‍🔥] 🖤🖤😥😥"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe") {
			const { threadID, logMessageData, author } = event;
			const threadData = await threadsData.get(threadID);
			if (!threadData.settings.sendLeaveMessage) return;

			const { leftParticipantFbId } = logMessageData;
			if (leftParticipantFbId == api.getCurrentUserID()) return;

			const hours = getTime("HH");
			const threadName = threadData.threadName;

			// **Remove hone wale user ka naam fetch karein**
			let userName;
			try {
				userName = await usersData.getName(leftParticipantFbId);
				if (!userName) {
					const userInfo = await api.getUserInfo(leftParticipantFbId);
					userName = userInfo[leftParticipantFbId]?.name || "Unknown User";
				}
			} catch (err) {
				userName = "Unknown User";
			}

			// **Agar admin remove kare to admin ka naam bhi fetch karein**
			let adminName = "Admin";
			if (author !== leftParticipantFbId) {
				try {
					const adminInfo = await api.getUserInfo(author);
					adminName = adminInfo[author]?.name || "Admin";
				} catch (err) {
					adminName = "Admin";
				}
			}

			// **Message Template Fix**
			let leaveMessage;
			if (leftParticipantFbId === author) {
				// **Agar member khud leave kare**
				leaveMessage = getLang("leaveType1");
			} else {
				// **Agar admin ne remove kiya ho**
				leaveMessage = getLang("adminRemoveMessage")
					.replace(/\{adminName\}/g, adminName);
			}

			leaveMessage = leaveMessage
				.replace(/\{userName\}/g, userName)
				.replace(/\{threadName\}/g, threadName)
				.replace(/\{time\}/g, hours)
				.replace(/\{session\}/g, hours <= 10 ? getLang("session1") :
					hours <= 12 ? getLang("session2") :
					hours <= 18 ? getLang("session3") :
					getLang("session4"));

			const form = {
				body: leaveMessage,
				mentions: [{
					id: leftParticipantFbId,
					tag: userName
				}]
			};

			// **Folder se random video lena**
			const gifFolder = path.join(__dirname, "cache/leaveGif/randomgif");
			const files = fs.readdirSync(gifFolder).filter(file => file.endsWith(".mp4") || file.endsWith(".gif"));

			if (files.length > 0) {
				const randomFile = files[Math.floor(Math.random() * files.length)];
				const filePath = path.join(gifFolder, randomFile);
				form.attachment = fs.createReadStream(filePath);
			}

			message.send(form);
		}
	}
};
