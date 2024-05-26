const {contextBridge,ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    receive: (channel, func) => {
        ipcRenderer.on(channel, func);
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
});