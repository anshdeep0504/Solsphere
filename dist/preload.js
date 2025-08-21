var _a = require('electron'), contextBridge = _a.contextBridge, ipcRenderer = _a.ipcRenderer;
contextBridge.exposeInMainWorld('electronAPI', {
    getOSVersion: function () { return ipcRenderer.invoke('getOSVersion'); },
    getCPU: function () { return ipcRenderer.invoke('getCPU'); },
    getRAM: function () { return ipcRenderer.invoke('getRAM'); },
    getDiskEncryption: function () { return ipcRenderer.invoke('getDiskEncryption'); },
    getAntivirus: function () { return ipcRenderer.invoke('getAntivirus'); },
    getSleepSettings: function () { return ipcRenderer.invoke('getSleepSettings'); }
});
