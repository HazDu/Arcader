const path = require("node:path");
const {app, BrowserWindow, ipcMain} = require("electron");
const {SerialPort} = require("serialport");
const {ReadlineParser} = require("@serialport/parser-readline");
const joystick = require("./utils/joystick");
const emulation = require("./utils/emulation");

let mainWindow;

let port;
let parser;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, "../", "index.html"));
    }

    mainWindow.show();
    mainWindow.maximize();
    mainWindow.setFullScreen(true);
}

app.whenReady().then(() => {
    createWindow();

    joystick.onKeyDown((number) => {
        mainWindow.webContents.send("joystick-button", number);
    });

    joystick.onAxis((axis) => {
        mainWindow.webContents.send("joystick-axis", axis);
    });

    ipcMain.on("load-game", (event, gameId) => {
        emulation.startById(gameId);
    });

    ipcMain.on("connect-acceptor", () => {
        loadConnector();
    });
});

const loadConnector = () => {
    port = new SerialPort({path: "/dev/ttyACM0", baudRate: 9600});
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