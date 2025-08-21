const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');
const { execSync } = require('child_process');
const { startBackgroundDaemon } = require('./backgroundDaemon');

let previousOSVersion = null; // Store the previous OS version

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'dist/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  startBackgroundDaemon();

 // Set up a timer to periodically update sleep settings
  setInterval(() => {
    const win = BrowserWindow.getAllWindows()[0]; // Get the main window
    if (win) {
      const sleepSettings = getSleepSettings();
      win.webContents.send('sleep-settings-update', sleepSettings);
    }
  }, 1000); // Update every 1 second
});

// Utility: Promise with timeout
function timeoutPromise(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve('Unknown'), ms)),
  ]);
}

// Helpers
function getDiskType() {
  try {
    const diskOutput = execSync(
      'powershell -Command "Get-PhysicalDisk | Select-Object -First 1 MediaType"'
    ).toString();

    let diskType = "Unknown";
    if (diskOutput.includes("SSD")) diskType = "SSD";
    else if (diskOutput.includes("HDD")) diskType = "HDD";

    // BitLocker status
    const encOutput = execSync('powershell -Command "manage-bde -status C:"').toString();
    let encryption = "Not Encrypted";
    if (encOutput.includes("Encryption Method") && !encOutput.includes("None")) {
      encryption = "BitLocker Enabled";
    }

    return `${diskType} (${encryption})`;
  } catch (e) {
    return "SSD (Default Proxy)";
  }
}

let lastSleepSettingsCall = null;
const defaultTimeoutMinutes = 30;

function getSleepSettings() {
  lastSleepSettingsCall = new Date();
  try {
    const output = execSync(
      'powershell -Command "powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE"'
    ).toString();

    const match = output.match(/AC Value Index:\s*(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]) / 60;
      return `${minutes} minutes (Actual)`;
    }

    // Calculate remaining time
    const now = new Date();
    const timeDiff = now.getTime() - lastSleepSettingsCall.getTime();
    const remainingTime = defaultTimeoutMinutes * 60000 - timeDiff;

    if (remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    } else {
      return "Inactive";
    }
  } catch (e) {
    // Calculate remaining time even in case of error
    const now = new Date();
    const timeDiff = now.getTime() - lastSleepSettingsCall.getTime();
    const remainingTime = defaultTimeoutMinutes * 60000 - timeDiff;

    if (remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    } else {
      return "Inactive";
    }
  }
}

// IPC Handlers
ipcMain.handle('getOSVersion', async () => {
  try {
    const osInfo = await timeoutPromise(
      si.osInfo()
    );
    const currentVersion = `${osInfo.distro} ${osInfo.release}`;

    previousOSVersion = currentVersion; // Update the previous version

    return currentVersion;
  } catch (err) {
    console.log("OS Error:", err);
    return "Unknown";
  }
});

ipcMain.handle('getCPU', async () => {
  return await timeoutPromise(
    si.cpu()
      .then((c) => c.manufacturer + " " + c.brand)
      .catch((err) => {
        console.log("CPU Error:", err);
        return "Unknown";
      })
  );
});

ipcMain.handle('getRAM', async () => {
  return await timeoutPromise(
    si.mem()
      .then((m) => (m.total / 1024 ** 3).toFixed(2) + " GB")
      .catch((err) => {
        console.log("RAM Error:", err);
        return "Unknown";
      })
  );
});

ipcMain.handle('getDiskEncryption', async () => {
  return await timeoutPromise(
    new Promise((resolve) => resolve(getDiskType()))
  );
});

ipcMain.handle('getAntivirus', async () => {
  return await timeoutPromise(
    si.processes()
      .then((data) => {
        const antivirusProcesses = data.list.filter(
          (process) =>
            process.name.toLowerCase().includes("antivirus") ||
            process.name.toLowerCase().includes("defender")
        );
        return antivirusProcesses.length > 0 ? "Detected" : "Not Detected";
      })
      .catch((err) => {
        console.log("Antivirus Error:", err);
        return "Unknown";
      })
  );
});

ipcMain.handle('getSleepSettings', async () => {
  return await timeoutPromise(
    new Promise((resolve) => resolve(getSleepSettings()))
  );
});
