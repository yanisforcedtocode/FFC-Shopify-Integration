"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDev = void 0;
const logDev = (log) => {
    if (process.env.NODE_ENV === 'production')
        return;
    if (process.env.NODE_ENV === 'test')
        return;
    console.log(log);
};
exports.logDev = logDev;
