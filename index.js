const { spawn } = require("child_process");
const express = require("express");
const log = require("./logger/log.js");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

let child = null;
let restarting = false;
let shuttingDown = false;

function startProject() {
if (shuttingDown) return;

log.info("MESSENGER", "Starting GoatBot...");  

child = spawn(process.execPath, ["Goat.js"], {  
    cwd: __dirname,  
    stdio: "inherit",  
    shell: false,  
    env: process.env  
});  

child.on("error", (error) => {  
    log.error("MESSENGER", "Startup error: " + error.message);  
    process.exitCode = 1;  
});  

child.on("close", (code) => {  
    log.info("MESSENGER", "Bot stopped with code: " + code);  

    if (shuttingDown) return;  

    if (code === 2 && !restarting) {  
        restarting = true;  

        log.info("MESSENGER", "Restarting GoatBot...");  

        setTimeout(() => {  
            restarting = false;  
            startProject();  
        }, 3000);  
    } else {  
        process.exit(code || 0);  
    }  
});

}

app.get("/", (req, res) => {
res.status(200).send("SIYAM HASAN Messenger GoatBot is running!");
});

app.get("/health", (req, res) => {
res.status(200).json({
status: "OK",
platform: "Facebook Messenger",
uptime: process.uptime(),
messenger:
child && child.exitCode === null
? "running"
: "starting"
});
});

require('./bot/login/custom_login.js');

const server = app.listen(PORT, "0.0.0.0", () => {
log.info("SERVER", "Uptime server running on port " + PORT);
startProject();
});

function shutdown() {
if (shuttingDown) return;

shuttingDown = true;  

if (child && child.exitCode === null) {  
    child.kill("SIGTERM");  
}  

server.close(() => {  
    process.exit(0);  
});  

setTimeout(() => process.exit(0), 5000).unref();

}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
