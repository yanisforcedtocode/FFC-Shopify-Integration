"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileContent = exports.writeStringToFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const writeStringToFile = async (filePath, content) => {
    try {
        return new Promise((resolve, reject) => {
            fs_1.default.mkdir(path_1.default.dirname(filePath), { recursive: true }, (err) => {
                if (err) {
                    return reject(err);
                }
                fs_1.default.writeFile(filePath, content, 'utf8', (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve('file written');
                });
            });
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.writeStringToFile = writeStringToFile;
const readFileContent = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
exports.readFileContent = readFileContent;
// Example usage:
