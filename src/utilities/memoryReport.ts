import { logDev } from './logDev';

// Function to format memory usage in MB
const formatMemoryUsage = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// Function to log memory usage
const reportMemoryUsage = (): void => {
    const memoryUsage = process.memoryUsage();
    logDev(`Memory Usage Report:`);
    logDev(`  RSS: ${formatMemoryUsage(memoryUsage.rss)} (Resident Set Size)`);
    logDev(`  Heap Total: ${formatMemoryUsage(memoryUsage.heapTotal)} (Total size of the allocated heap)`);
    logDev(`  Heap Used: ${formatMemoryUsage(memoryUsage.heapUsed)} (Actual memory used)`);
    logDev(`  External: ${formatMemoryUsage(memoryUsage.external)} (Memory used by C++ objects)`);
    logDev(`  Array Buffers: ${formatMemoryUsage(memoryUsage.arrayBuffers)} (Memory for ArrayBuffer and SharedArrayBuffer objects)`);
    logDev('-----------------------------------');
};

// Interval to report memory usage every 5 seconds
export const startMemoryUsageReporting = (): void => {
    logDev('Starting memory usage reporting...');
    setInterval(reportMemoryUsage, 30000);
};

