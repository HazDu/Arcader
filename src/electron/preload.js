const {contextBridge,ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    receive: (channel, func) => {
        ipcRenderer.on(channel, func);
    },
    endReceive: (channel, func) => {
        ipcRenderer.off(channel, func);
    },
    endReceiveAll: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
});