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
var _this = this;
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow, ipcMain = _a.ipcMain;
var path = require('path');
var si = require('systeminformation');
var execSync = require('child_process').execSync;
var startBackgroundDaemon = require('./backgroundDaemon').startBackgroundDaemon;
function createWindow() {
    var win = new BrowserWindow({
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
app.whenReady().then(function () {
    createWindow();
    startBackgroundDaemon();
});
// Utility: Promise with timeout
function timeoutPromise(promise, ms) {
    if (ms === void 0) { ms = 5000; }
    return Promise.race([
        promise,
        new Promise(function (resolve) { return setTimeout(function () { return resolve('Unknown'); }, ms); }),
    ]);
}
// Helpers
function getDiskType() {
    try {
        var diskOutput = execSync('powershell -Command "Get-PhysicalDisk | Select-Object -First 1 MediaType"').toString();
        var diskType = "Unknown";
        if (diskOutput.includes("SSD"))
            diskType = "SSD";
        else if (diskOutput.includes("HDD"))
            diskType = "HDD";
        // BitLocker status
        var encOutput = execSync('powershell -Command "manage-bde -status C:"').toString();
        var encryption = "Not Encrypted";
        if (encOutput.includes("Encryption Method") && !encOutput.includes("None")) {
            encryption = "BitLocker Enabled";
        }
        return "".concat(diskType, " (").concat(encryption, ")");
    }
    catch (e) {
        return "SSD (Default Proxy)";
    }
}
function getSleepSettings() {
    try {
        var output = execSync('powershell -Command "powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE"').toString();
        var match = output.match(/AC Value Index:\s*(\d+)/);
        if (match) {
            var minutes = parseInt(match[1]) / 60;
            return "".concat(minutes, " minutes (Actual)");
        }
        return "30 minutes (Default Proxy)";
    }
    catch (e) {
        return "30 minutes (Default Proxy)";
    }
}
// IPC: Get System Info
ipcMain.handle("get-system-info", function () { return __awaiter(_this, void 0, void 0, function () {
    var info, _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                info = {};
                // Disk Type & Encryption
                _a = info;
                return [4 /*yield*/, timeoutPromise(new Promise(function (resolve) { return resolve(getDiskType()); }))];
            case 1:
                // Disk Type & Encryption
                _a.diskEncryption = _g.sent();
                // OS version
                _b = info;
                return [4 /*yield*/, timeoutPromise(si.osInfo()
                        .then(function (os) { return "".concat(os.distro, " ").concat(os.release); })
                        .catch(function (err) {
                        console.log("OS Error:", err);
                        return "Unknown";
                    }))];
            case 2:
                // OS version
                _b.osVersion = _g.sent();
                // CPU
                _c = info;
                return [4 /*yield*/, timeoutPromise(si.cpu()
                        .then(function (c) { return c.manufacturer + " " + c.brand; })
                        .catch(function (err) {
                        console.log("CPU Error:", err);
                        return "Unknown";
                    }))];
            case 3:
                // CPU
                _c.cpu = _g.sent();
                // RAM
                _d = info;
                return [4 /*yield*/, timeoutPromise(si.mem()
                        .then(function (m) { return (m.total / Math.pow(1024, 3)).toFixed(2) + " GB"; })
                        .catch(function (err) {
                        console.log("RAM Error:", err);
                        return "Unknown";
                    }))];
            case 4:
                // RAM
                _d.ram = _g.sent();
                // Antivirus
                _e = info;
                return [4 /*yield*/, timeoutPromise(si.processes()
                        .then(function (data) {
                        var antivirusProcesses = data.list.filter(function (process) {
                            return process.name.toLowerCase().includes("antivirus") ||
                                process.name.toLowerCase().includes("defender");
                        });
                        return antivirusProcesses.length > 0 ? "Detected" : "Not Detected";
                    })
                        .catch(function (err) {
                        console.log("Antivirus Error:", err);
                        return "Unknown";
                    }))];
            case 5:
                // Antivirus
                _e.antivirus = _g.sent();
                // Sleep Settings
                _f = info;
                return [4 /*yield*/, timeoutPromise(new Promise(function (resolve) { return resolve(getSleepSettings()); }))];
            case 6:
                // Sleep Settings
                _f.sleep = _g.sent();
                return [2 /*return*/, info];
        }
    });
}); });
