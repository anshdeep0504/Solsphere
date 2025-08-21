const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getOSVersion: () => ipcRenderer.invoke('getOSVersion'),
  getCPU: () => ipcRenderer.invoke('getCPU'),
  getRAM: () => ipcRenderer.invoke('getRAM'),
  getDiskEncryption: () => ipcRenderer.invoke('getDiskEncryption'),
  getAntivirus: () => ipcRenderer.invoke('getAntivirus'),
  getSleepSettings: () => ipcRenderer.invoke('getSleepSettings'),
  onSleepSettingsUpdate: (callback) => ipcRenderer.on('sleep-settings-update', callback)
});