"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMemoryUsageReporting = void 0;
const logDev_1 = require("./logDev");
// Function to format memory usage in MB
const formatMemoryUsage = (bytes) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
// Function to log memory usage
const reportMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    (0, logDev_1.logDev)(`Memory Usage Report:`);
    (0, logDev_1.logDev)(`  RSS: ${formatMemoryUsage(memoryUsage.rss)} (Resident Set Size)`);
    (0, logDev_1.logDev)(`  Heap Total: ${formatMemoryUsage(memoryUsage.heapTotal)} (Total size of the allocated heap)`);
    (0, logDev_1.logDev)(`  Heap Used: ${formatMemoryUsage(memoryUsage.heapUsed)} (Actual memory used)`);
    (0, logDev_1.logDev)(`  External: ${formatMemoryUsage(memoryUsage.external)} (Memory used by C++ objects)`);
    (0, logDev_1.logDev)(`  Array Buffers: ${formatMemoryUsage(memoryUsage.arrayBuffers)} (Memory for ArrayBuffer and SharedArrayBuffer objects)`);
    (0, logDev_1.logDev)('-----------------------------------');
};
// Interval to report memory usage every 5 seconds
const startMemoryUsageReporting = () => {
    (0, logDev_1.logDev)('Starting memory usage reporting...');
    setInterval(reportMemoryUsage, 30000);
};
exports.startMemoryUsageReporting = startMemoryUsageReporting;
