var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// @ts-check
var CronJob = require('cron').CronJob;
var os = require('os');
var fs = require('fs');
var exec = require('child_process').exec;
var https = require('https');
var systemStateFilePath = "".concat(__dirname, "/systemState.json");
var lastSystemState = null;
// Function to get system information
function getSystemInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var diskEncryption, systemInfo, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, getDiskEncryptionStatus()];
                            case 1:
                                diskEncryption = _a.sent();
                                systemInfo = {
                                    osVersion: os.platform() + ' ' + os.release(),
                                    cpu: os.cpus()[0].model,
                                    ram: os.totalmem(),
                                    diskEncryption: diskEncryption,
                                    antivirusStatus: 'N/A', // Placeholder, implement actual check
                                    sleepSettings: 'N/A', // Placeholder, implement actual check
                                    timestamp: new Date().toISOString(),
                                };
                                resolve(systemInfo);
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                reject(error_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
// Function to get disk encryption status (Windows)
function getDiskEncryptionStatus() {
    return new Promise(function (resolve, reject) {
        exec('powershell -command "Get-BitLockerVolume | Select-Object -ExpandProperty EncryptionMethod"', function (error, stdout, stderr) {
            if (error) {
                resolve('Unknown');
                return;
            }
            var encryptionMethod = stdout.trim();
            resolve(encryptionMethod === '' ? 'Not Encrypted' : encryptionMethod);
        });
    });
}
// Function to send updates to the remote API
function sendUpdates(data) {
    var postData = JSON.stringify(data);
    var options = {
        hostname: 'myapi.com',
        path: '/system/update',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
        },
    };
    var req = https.request(options, function (res) {
        console.log("Status Code: ".concat(res.statusCode));
        res.on('data', function (d) {
            process.stdout.write(d);
        });
    });
    req.on('error', function (error) {
        console.error(error);
    });
    req.write(postData);
    req.end();
}
// Function to load last system state from file
function loadLastSystemState() {
    try {
        var data = fs.readFileSync(systemStateFilePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
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
    return (current.osVersion !== previous.osVersion ||
        current.cpu !== previous.cpu ||
        current.ram !== previous.ram ||
        current.diskEncryption !== previous.diskEncryption ||
        current.antivirusStatus !== previous.antivirusStatus ||
        current.sleepSettings !== previous.sleepSettings);
}
// Main function for the background daemon
function runDaemon() {
    return __awaiter(this, void 0, void 0, function () {
        var currentSystemInfo, hasChanged;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSystemInfo()];
                case 1:
                    currentSystemInfo = _a.sent();
                    hasChanged = hasSystemStateChanged(currentSystemInfo, lastSystemState);
                    if (hasChanged) {
                        console.log('System state changed, sending update...');
                        sendUpdates(currentSystemInfo);
                        lastSystemState = currentSystemInfo;
                        saveSystemState(currentSystemInfo);
                    }
                    else {
                        console.log('System state unchanged.');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Function to start the background daemon
function startBackgroundDaemon() {
    console.log('Starting background daemon...');
    // Load last system state
    lastSystemState = loadLastSystemState();
    // Schedule the task to run every 15 to 60 minutes (adjust as needed)
    var job = new CronJob('*/15 * * * *', // Runs every 15 minutes
    runDaemon, null, true, // Start the job right now
    'America/Los_Angeles' // Time zone of your location
    );
    job.start();
}
module.exports = { startBackgroundDaemon: startBackgroundDaemon };
