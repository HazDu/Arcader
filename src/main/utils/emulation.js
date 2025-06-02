import cp from "child_process";
import fs from "fs";
import path from "path";
import terminate from "terminate";
import { getConfig } from "./config";

let currentPid = null;
let cores = [];

const loadCoresData = () => {
    try {
        const coresPath = path.join(process.cwd(), 'data/cores/metadata.json');
        if (fs.existsSync(coresPath)) {
            const data = JSON.parse(fs.readFileSync(coresPath, 'utf8'));
            cores = data.cores || [];
            return cores;
        }
    } catch (error) {
        console.error('Error loading cores metadata:', error);
    }
    return [];
}

loadCoresData();

const isRunning = (pid) => {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}

export const reloadCores = () => {
    cores = loadCoresData();
    return cores;
}

export const findCoreByExtension = (ext) => {
    return cores.find(core => core.extensions.includes(ext));
}

const isWayland = () => {
    return process.env.XDG_SESSION_TYPE === "wayland";
}

export const startEmulator = (webContents, core, gameFile) => {
    const LD_PRELOAD = isWayland() ? "/usr/lib/x86_64-linux-gnu/libwayland-client.so.0" : "";
    const START_CMD = "./data/retro.AppImage -f -L ./data/cores/" + core + " " + gameFile;

    if (currentPid && isRunning(currentPid)) {
        console.error("Emulator already running");
        return;
    }

    console.log("Spawning emulator with command: " + START_CMD);

    const proc = cp.spawn([`LD_PRELOAD=${LD_PRELOAD}`, START_CMD].join(" "), {
        shell: true
    });

    proc.stdout.on("data", (data) => console.log(data.toString()));
    proc.stderr.on("data", (data) => console.error(data.toString()));

    proc.on("close", (code) => {
        console.log(`Emulator exited with code ${code}`);

        stop(webContents);
    });

    currentPid = proc.pid;
}

export const start = (webContents, gameFile) => {
    const ext = gameFile.split(".").pop();
    const core = cores.find(core => core.extensions.includes(ext));

    if (!core) {
        console.error("No core found for this file extension");
        return;
    }

    webContents.send("game-loaded", gameFile);

    startEmulator(webContents, core.core, gameFile);
}

export const startById = (webContents, gameId) => {
    const gameFile = fs.readdirSync("./data/roms").find(file => file.startsWith(gameId));

    if (!gameFile) {
        console.error("Game not found");
        return;
    }

    start(webContents,`./data/roms/${gameFile}`);
}

export const stop = (webContents) => {
    if (currentPid && isRunning(currentPid)) {
        terminate(currentPid, () => {
            console.log("Emulator closed");
        });
    }

    currentPid = null;
    
    const config = getConfig('systemSettings') || {};
    webContents.send("game-stopped", config.disableCoinSlot);

    return true;
}

export const getAllConsoles = () => {
    const uniqueConsoles = [...new Set(cores.map(core => core.name))];
    return uniqueConsoles.map(name => {
        const core = cores.find(c => c.name === name);
        return {
            name,
            extensions: core.extensions
        };
    });
};