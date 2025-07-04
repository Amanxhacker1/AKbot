const express = require("express");
const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();

// ===== EXPRESS SERVER FOR RENDER =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	res.send("GoatBot is running.");
});

app.listen(PORT, () => {
	console.log(`✅ Express server running on port ${PORT}`);
});
