import {app, BrowserWindow} from "electron";
import path from "node:path";

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