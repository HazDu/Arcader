import {join} from "path";
import {app, BrowserWindow, ipcMain} from "electron";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import {SerialPort} from "serialport";
import {ReadlineParser} from "@serialport/parser-readline";
import {onAxis, onKeyDown} from "./utils/joystick";
import {startById} from"./utils/emulation";
import {startServer} from "./api";
import {cacheMissingThumbnails, retrieveGames} from "./utils/loader";

let mainWindow;

let port;
let parser;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
        }
    });

    if (is.dev) {
        mainWindow.webContents.openDevTools();
    }

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    mainWindow.show();
    mainWindow.maximize();
    mainWindow.setFullScreen(true);
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('de.gnmyt');

    app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window));

    onKeyDown((number) => {
        mainWindow.webContents.send("joystick-button", number);
    });

    onAxis((axis) => {
        mainWindow.webContents.send("joystick-axis", axis);
    });

    ipcMain.on("load-game", (event, gameId) => {
        startById(mainWindow.webContents, gameId);
    });

    ipcMain.on("connect-acceptor", () => {
        mainWindow.webContents.send("games-updated", retrieveGames(true));
        setInterval(() => {
            mainWindow.webContents.send("games-updated", retrieveGames(true));
        }, 10000);

        if (process.env['DISABLE_COIN_SLOT']) {
            mainWindow.webContents.send("acceptor-connected", true);
            setTimeout(() => {
                mainWindow.webContents.send("coin-detected", true);
            }, 2000);
            return;
        }
        loadConnector();
    });

    createWindow();

    startServer();

    cacheMissingThumbnails();
});

const loadConnector = () => {
    port = new SerialPort({path: process["COIN_ACCEPTOR_PATH"] || "/dev/ttyACM0", baudRate: 9600});
    parser = port.pipe(new ReadlineParser());
    port.on("open", () => {
        console.log("Coin acceptor connected");

        mainWindow.webContents.send("acceptor-connected", true);
    });

    port.on("error", () => {
        mainWindow.webContents.send("acceptor-connected", false);
    });

    parser.on("data", (data) => {
        mainWindow.webContents.send("coin-detected", data === "100073000\r");
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});