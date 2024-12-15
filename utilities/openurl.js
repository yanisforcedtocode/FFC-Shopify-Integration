"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openUrlInBrowser = void 0;
const { exec } = require('child_process');
const openUrlInBrowser = (url) => {
    function escapeCmdString(input) {
        return input.replace(/([\^&<>\|"\(\)%!])/g, '^$1');
    }
    const platform = process.platform;
    const url1 = escapeCmdString(url);
    let command;
    if (platform === 'win32') {
        command = `start ${url1}`; // Windows
    }
    else if (platform === 'darwin') {
        command = `open ${url}`; // macOS
    }
    else {
        command = `xdg-open ${url}`; // Linux
    }
    exec(command, (error) => {
        if (error) {
            console.error('Failed to open URL:', error);
        }
    });
};
exports.openUrlInBrowser = openUrlInBrowser;
