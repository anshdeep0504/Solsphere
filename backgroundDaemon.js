// @ts-check
const { CronJob } = require('cron');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');

const systemStateFilePath = `${__dirname}/systemState.json`;

let lastSystemState = null;

// Function to get system information
async function getSystemInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      const diskEncryption = await getDiskEncryptionStatus();
      const systemInfo = {
        osVersion: os.platform() + ' ' + os.release(),
        cpu: os.cpus()[0].model,
        ram: os.totalmem(),
        diskEncryption: diskEncryption,
        antivirusStatus: 'N/A', // Placeholder, implement actual check
        sleepSettings: 'N/A', // Placeholder, implement actual check
        timestamp: new Date().toISOString(),
      };
      resolve(systemInfo);
    } catch (error) {
      reject(error);
    }
  });
}

// Function to get disk encryption status (Windows)
function getDiskEncryptionStatus() {
  return new Promise((resolve, reject) => {
    exec('powershell -command "Get-BitLockerVolume | Select-Object -ExpandProperty EncryptionMethod"', (error, stdout, stderr) => {
      if (error) {
        resolve('Unknown');
        return;
      }

      const encryptionMethod = stdout.trim();
      resolve(encryptionMethod === '' ? 'Not Encrypted' : encryptionMethod);
    });
  });
}

// Function to send updates to the remote API
function sendUpdates(data) {
  const postData = JSON.stringify(data);

  const options = {
    hostname: 'myapi.com',
    path: '/system/update',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.write(postData);
  req.end();
}

// Function to load last system state from file
function loadLastSystemState() {
  try {
    const data = fs.readFileSync(systemStateFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Function to save current system state to file
function saveSystemState(systemInfo) {
  fs.writeFileSync(systemStateFilePath, JSON.stringify(systemInfo, null, 2));
}

// Function to compare system states
function hasSystemStateChanged(current, previous) {
  if (!previous) {
    return true; // Report if no previous state
  }
  return (
    current.osVersion !== previous.osVersion ||
    current.cpu !== previous.cpu ||
    current.ram !== previous.ram ||
    current.diskEncryption !== previous.diskEncryption ||
    current.antivirusStatus !== previous.antivirusStatus ||
    current.sleepSettings !== previous.sleepSettings
  );
}

// Main function for the background daemon
async function runDaemon() {
  const currentSystemInfo = await getSystemInfo();
  const hasChanged = hasSystemStateChanged(currentSystemInfo, lastSystemState);

  if (hasChanged) {
    console.log('System state changed, sending update...');
    sendUpdates(currentSystemInfo);
    lastSystemState = currentSystemInfo;
    saveSystemState(currentSystemInfo);
  } else {
    console.log('System state unchanged.');
  }
}

// Function to start the background daemon
function startBackgroundDaemon() {
  console.log('Starting background daemon...');

  // Load last system state
  lastSystemState = loadLastSystemState();

  // Schedule the task to run every 15 to 60 minutes (adjust as needed)
  const job = new CronJob(
    '*/47 * * * *', // Runs every 47 minutes
    runDaemon,
    null,
    true, // Start the job right now
    'America/Los_Angeles' // Time zone of your location
  );

  job.start();
}

module.exports = { startBackgroundDaemon };