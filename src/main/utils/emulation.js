import cp from "child_process";
import fs from "fs";
import terminate from "terminate";

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
    {core: "snes9x_libretro.so", extensions: ["sfc", "smc"], name: "Super Nintendo"},
    {core: "2048_libretro.so", extensions: ["2048"], name: "2048"},
    {core: "desmume_libretro.so", extensions: ["nds"], name: "Nintendo DS"},
    {core: "fceumm_libretro.so", extensions: ["nes"], name: "Nintendo Entertainment System"},
    {core: "gambatte_libretro.so", extensions: ["gb", "gbc"], name: "Game Boy / Game Boy Color"},
    {core: "mame2003_libretro.so", extensions: ["zip", "chd"], name: "MAME"},
    {core: "mednafen_gba_libretro.so", extensions: ["gba"], name: "Game Boy Advance"},
    {core: "mednafen_psx_libretro.so", extensions: ["cue", "bin", "iso"], name: "Sony PlayStation"},
    {core: "genesis_plus_gx_libretro.so", extensions: ["md", "gen", "bin", "smd"], name: "Sega Genesis"},
    {core: "mupen64plus_next_libretro.so", extensions: ["n64", "z64", "v64"], name: "Nintendo 64"},
    {core: "vice_x64_libretro.so", extensions: ["d64", "t64", "prg"], name: "Commodore 64"},
    {core: "nxengine_libretro.so", extensions: ["exe"], name: "Cave Story"},
    {core: "pcsx2_libretro.so", extensions: ["iso", "bin"], name: "Sony PlayStation 2"},
    {core: "ppsspp_libretro.so", extensions: ["iso", "cso"], name: "PlayStation Portable"},
    {core: "bluemsx_libretro.so", extensions: ["rom", "mx1", "mx2"], name: "MSX/MSX2"},
    {core: "flycast_libretro.so", extensions: ["cdi", "gdi", "chd"], name: "Sega Dreamcast"},
    {core: "dosbox_pure_libretro.so", extensions: ["exe", "com", "bat"], name: "DOSBox Pure"},
    {core: "pokemini_libretro.so", extensions: ["min"], name: "Pokemon Mini"},
    {core: "prboom_libretro.so", extensions: ["wad"], name: "Doom (PrBoom)"},
    {core: "tic80_libretro.so", extensions: ["tic"], name: "TIC-80"},
    {core: "uzem_libretro.so", extensions: ["uze"], name: "Uzebox"},
    {core: "scummvm_libretro.so", extensions: ["svm"], name: "ScummVM"},
    {core: "mgba_libretro.so", extensions: ["gba"], name: "Game Boy Advance (mGBA)"},
    {core: "picodrive_libretro.so", extensions: ["md", "gen", "bin"], name: "Sega 32X/Sega CD"},
    {core: "opera_libretro.so", extensions: ["iso"], name: "3DO"},
    {core: "bsnes_libretro.so", extensions: ["sfc", "smc"], name: "Super Nintendo (BSNES)"},
    {core: "stella_libretro.so", extensions: ["a26", "bin"], name: "Atari 2600"},
    {core: "yabasanshiro_libretro.so", extensions: ["cue", "bin", "iso"], name: "Sega Saturn"},
    {core: "mednafen_wswan_libretro.so", extensions: ["ws", "wsc"], name: "WonderSwan"},
    {core: "mednafen_vb_libretro.so", extensions: ["vb"], name: "Virtual Boy"},
    {core: "mednafen_ngp_libretro.so", extensions: ["ngp", "ngc"], name: "Neo Geo Pocket"},
    {core: "dolphin_libretro.so", extensions: ["iso", "gcm"], name: "Nintendo GameCube / Wii"},
    {core: "fbalpha2012_libretro.so", extensions: ["zip"], name: "Final Burn Alpha"},
    {core: "openlara_libretro.so", extensions: ["phd", "png"], name: "Tomb Raider (OpenLara)"},
    {core: "retro8_libretro.so", extensions: ["8bit"], name: "Retro8"},
    {core: "same_cdi_libretro.so", extensions: ["cdi"], name: "Phillips CD-i"}
];

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

    webContents.send("game-stopped", process.env['DISABLE_COIN_SLOT']);

    return true;
}