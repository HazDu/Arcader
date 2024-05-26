const path = require("node:path");
const { app, BrowserWindow } = require("electron");
const {SerialPort} = require("serialport");
const {ReadlineParser} = require("@serialport/parser-readline");

const port = new SerialPort({ path: "/dev/ttyACM0", baudRate: 9600 });
port.on("open", () => {
    console.log("Coin acceptor connected");
});

const parser = port.pipe(new ReadlineParser());
parser.on('data', console.log);


const createWindow = () => {
    const win = new BrowserWindow({
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(__dirname, "../", "index.html"));
    }

    win.show();
    win.setFullScreen(true);
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});