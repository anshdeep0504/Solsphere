const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Utility: Promise with timeout
function timeoutPromise(promise, ms = 5000) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve('Unknown'), ms))]);
}

// IPC: Get System Info
ipcMain.handle('get-system-info', async () => {
  const info = {};

  // Disk info (type as proxy for encryption)
  info.diskEncryption = await timeoutPromise(
    si.diskLayout().then(d => d[0]?.type || 'Unknown').catch((err) => {console.log('Disk Error:', err); return 'Unknown'})
  );

  // OS version
  info.osVersion = await timeoutPromise(
    si.osInfo().then(os => `${os.distro} ${os.release}`).catch((err) => {console.log('OS Error:', err); return 'Unknown'})
  );

  // CPU
  info.cpu = await timeoutPromise(
    si.cpu().then(c => c.manufacturer + ' ' + c.brand).catch((err) => {console.log('CPU Error:', err); return 'Unknown'})
  );

  // RAM
  info.ram = await timeoutPromise(
    si.mem().then(m => (m.total / (1024 ** 3)).toFixed(2) + ' GB').catch((err) => {console.log('RAM Error:', err); return 'Unknown'})
  );

  // Antivirus and Sleep (not reliable on all Windows machines)
  info.antivirus = await timeoutPromise(
    si.currentLoad().then(() => 'Detected').catch((err) => {console.log('Antivirus Error:', err); return 'Unknown'})
  );
  info.sleep = await timeoutPromise(
    si.battery().then(b => `${b.designedCapacity} ${b.cycleCount}`).catch((err) => {console.log('Sleep Error:', err); return 'Unknown'})
  );

  return info;
});
