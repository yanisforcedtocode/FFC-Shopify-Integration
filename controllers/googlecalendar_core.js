"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newServiceEvent = exports.getServiceEvents = exports.findServiceEventByOrderId = exports.newClientEvent = exports.getClientEvents = exports.getClientCalendars = exports.getClientToken = exports.getAuth2Code = void 0;
const path_1 = __importDefault(require("path"));
const openurl_1 = require("../utilities/openurl");
const saveStringsToFiles_1 = require("../utilities/saveStringsToFiles");
const logDev_1 = require("../utilities/logDev");
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(process.env.GCalendar_CLIENT_ID, process.env.GCalendar_CLIENT_SECRET, process.env.GCalendar_REDIRECT_URL);
// Oauth2 calendar
const getAuth2Code = async () => {
    try {
        const scopes = [
            'https://www.googleapis.com/auth/calendar'
        ];
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        (0, openurl_1.openUrlInBrowser)(url);
    }
    catch (error) {
        console.log(error);
    }
};
exports.getAuth2Code = getAuth2Code;
const getClientToken = async () => {
    try {
        const authKey = await (0, saveStringsToFiles_1.readFileContent)('./utilities/keyFiles/calendarAuthKey.txt');
        const keyObj = JSON.parse(authKey);
        const tokenRes = await oauth2Client.getToken(keyObj.code);
        console.log(tokenRes);
        if (tokenRes.tokens.refresh_token) {
            (0, saveStringsToFiles_1.writeStringToFile)('./utilities/keyFiles/refresh_token.txt', JSON.stringify(tokenRes.tokens));
            console.log("refresh: ", tokenRes.tokens.refresh_token);
        }
        if (!tokenRes.tokens.refresh_token) {
            await (0, saveStringsToFiles_1.writeStringToFile)('./utilities/keyFiles/access_token.txt', JSON.stringify(tokenRes.tokens));
            console.log("access: ", tokenRes.tokens.access_token);
        }
        tokenRes.tokens;
    }
    catch (error) {
        console.log(error);
    }
};
exports.getClientToken = getClientToken;
const getClientCalendar = async () => {
    const token = await (0, saveStringsToFiles_1.readFileContent)('./utilities/keyFiles/access_token.txt');
    const tokenObj = JSON.parse(token);
    oauth2Client.setCredentials(tokenObj);
    const calendar = google.calendar({
        version: 'v3',
        auth: oauth2Client
    });
    return calendar;
};
// Service calendar
const serviceAuth = new google.auth.GoogleAuth({
    keyFile: path_1.default.join(process.cwd(), '/utilities/keyFiles/sound-responder-334902-27e27960b2c3.json'),
    scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/admin.directory.resource.calendar',
        'https://www.googleapis.com/auth/drive'
    ],
});
const getServiceCalendar = async () => {
    const authClient = await serviceAuth.getClient();
    authClient.subject = process.env.GCalendar_admin;
    const calendar = await google.calendar({
        version: 'v3',
        auth: authClient
    });
    calendar.settings.context;
    return calendar;
};
const getServiceDrive = async () => {
    const authClient = await serviceAuth.getClient();
    authClient.subject = process.env.GCalendar_admin;
    const drive = await google.drive({
        version: 'v3',
        auth: authClient
    });
    return drive;
};
// interactions with the client calendar
const getClientCalendars = async () => {
    try {
        const token = await (0, saveStringsToFiles_1.readFileContent)('./utilities/keyFiles/access_token.txt');
        const tokenObj = JSON.parse(token);
        oauth2Client.setCredentials(tokenObj);
        const calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });
        const res = await calendar.calendarList.get({
            calendarId: process.env.calGCalendar_calId
        });
        console.log(res.data);
    }
    catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err;
        console.log(error.message);
    }
};
exports.getClientCalendars = getClientCalendars;
const getClientEvents = async () => {
    var _a;
    try {
        const calendar = await getClientCalendar();
        const res = await calendar.events.list({
            calendarId: process.env.calGCalendar_calId,
            maxResults: 1000,
            orderBy: "updated"
        });
        (_a = res.data.items) === null || _a === void 0 ? void 0 : _a.forEach((el) => {
            console.log(el.summary);
            console.log(el.start);
            console.log(el.end);
            console.log(el.status);
        });
    }
    catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err;
        console.log(error.message);
    }
};
exports.getClientEvents = getClientEvents;
const newClientEvent = async (calId, event) => {
    try {
        const calendar = await getClientCalendar();
        const res = await calendar.events.insert({
            calendarId: calId,
            requestBody: event
        });
        (0, logDev_1.logDev)({ status: res.status, protocal: 'insert', summary: res.data.summary });
    }
    catch (err) {
        const error = err;
        console.log(error.message);
    }
};
exports.newClientEvent = newClientEvent;
// interactions with the service calendar
const findServiceEventByOrderId = async (calId, orderId) => {
    var _a;
    try {
        const calendar = await getServiceCalendar();
        const res = await calendar.events.list({
            calendarId: calId,
            q: orderId,
        });
        (0, logDev_1.logDev)({ status: res.status, protocol: 'get', itemsCount: (_a = res.data.items) === null || _a === void 0 ? void 0 : _a.length });
        return res.data;
    }
    catch (err) {
        const error = err;
        console.log(error.message);
    }
};
exports.findServiceEventByOrderId = findServiceEventByOrderId;
const getServiceEvents = async () => {
    var _a;
    try {
        const calendar = await getServiceCalendar();
        const res = await calendar.events.list({
            calendarId: process.env.calGCalendar_calId,
            maxResults: 1000,
            orderBy: "updated"
        });
        (_a = res.data.items) === null || _a === void 0 ? void 0 : _a.forEach((el) => {
            console.log(el.summary);
            console.log(el.start);
            console.log(el.end);
            console.log(el.status);
            // confirmed
        });
    }
    catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err;
        console.log(error.message);
    }
};
exports.getServiceEvents = getServiceEvents;
const newServiceEvent = async (calId, event, notification) => {
    try {
        const calendar = await getServiceCalendar();
        const res = await calendar.events.insert({
            calendarId: calId,
            requestBody: event,
            sendNotifications: notification
        });
        (0, logDev_1.logDev)({ status: res.status, protocal: 'insert', summary: res.data.summary });
        return res;
    }
    catch (err) {
        const error = err;
        console.log(error.message);
    }
};
exports.newServiceEvent = newServiceEvent;
// scopes required for shopify integration
/*
1) Read a calendar
2) Read a calendar event
3) Delete a calendar event
4) Create a calendar event
5) List all calendars
*/ 
