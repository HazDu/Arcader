const cp = require("child_process");
const fs = require("fs");
const terminate = require("terminate");

let currentPid = null;

const isRunning = (pid) => {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}

const cores = [
    {core: "snes9x_libretro.so", extensions: ["sfc", "smc"]},
]

const isWayland = () => {
    return process.env.XDG_SESSION_TYPE === "wayland";
}

module.exports.startEmulator = (core, gameFile) => {
    const LD_PRELOAD = isWayland() ? "/usr/lib/x86_64-linux-gnu/libwayland-client.so.0" : "";
    const START_CMD = "./data/retro.AppImage -f -L ./data/cores/" + core + " " + gameFile;

    if (currentPid && isRunning(currentPid)) {
        console.error("Emulator already running");
        return;
    }

    const proc = cp.spawn([`LD_PRELOAD=${LD_PRELOAD}`, START_CMD].join(" "), {
        shell: true
    });

    currentPid = proc.pid;
}

module.exports.start = (gameFile) => {
    const ext = gameFile.split(".").pop();
    const core = cores.find(core => core.extensions.includes(ext));

    if (!core) {
        console.error("No core found for this file extension");
        return;
    }

    module.exports.startEmulator(core.core, gameFile);
}

module.exports.startById = (gameId) => {
    const gameFile = fs.readdirSync("./data/roms").find(file => file.startsWith(gameId));

    if (!gameFile) {
        console.error("Game not found");
        return;
    }

    module.exports.start(`./data/roms/${gameFile}`);
}

module.exports.stop = () => {
    if (currentPid && isRunning(currentPid)) {
        terminate(currentPid, () => {
            console.log("Emulator closed");
        });
    }
}