"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateToISO = void 0;
const formatDateToISO = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const timezoneOffset = -date.getTimezoneOffset(); // in minutes
    const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
    const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);
    const timezoneSign = timezoneOffset >= 0 ? '+' : '-';
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneSign}${offsetHours}:${offsetMinutes}`;
};
exports.formatDateToISO = formatDateToISO;