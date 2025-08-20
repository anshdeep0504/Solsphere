const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('systemAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
