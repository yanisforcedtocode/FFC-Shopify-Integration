import { calendar_v3 } from "googleapis"
import path from "path"
import { openUrlInBrowser } from "../utilities/openurl"
import { readFileContent, writeStringToFile } from "../utilities/saveStringsToFiles"
import { logDev } from '../utilities/logDev'
const { google } = require('googleapis');
const calendar: calendar_v3.Calendar = google.calendar('v3');
const oauth2Client = new google.auth.OAuth2(
    process.env.GCalendar_CLIENT_ID,
    process.env.GCalendar_CLIENT_SECRET,
    process.env.GCalendar_REDIRECT_URL
);

const serviceAuth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), '/utilities/keyFiles/sound-responder-334902-27e27960b2c3.json'),
    scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/admin.directory.resource.calendar'],
});

export const getAuth2Code = async () => {
    try {
        const scopes = [
            'https://www.googleapis.com/auth/calendar'
        ];
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        openUrlInBrowser(url)
    } catch (error) {
        console.log(error)
    }
}

export const getClientToken = async () => {
    try {
        const authKey = await readFileContent('./utilities/keyFiles/calendarAuthKey.txt') as string
        const keyObj = JSON.parse(authKey) as { code: string, scope: string }
        const tokenRes = await oauth2Client.getToken(keyObj.code)
        console.log(tokenRes)
        console.log(tokenRes.tokens.refresh_token)
        if (tokenRes.tokens.refresh_token) {
            writeStringToFile('./utilities/keyFiles/refresh_token.txt', JSON.stringify(tokenRes.tokens))
            console.log("refresh: ", tokenRes.tokens.refresh_token);
        }
        if (!tokenRes.tokens.refresh_token) {
            await writeStringToFile('./utilities/keyFiles/access_token.txt', JSON.stringify(tokenRes.tokens))
            console.log("access: ", tokenRes.tokens.access_token);
        }
    }
    catch (error) {
        console.log(error)
    }
}

const getClientCalendar = async ()=>{
    const token = await readFileContent('./utilities/keyFiles/access_token.txt') as string
        const tokenObj = JSON.parse(token) as { access_token: string, scope: string, token_type: string, expiry_date: number }
        oauth2Client.setCredentials(tokenObj);
        const calendar: calendar_v3.Calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });
        return calendar
}

export const getClientCalendars = async () => {
    try {
        const token = await readFileContent('./utilities/keyFiles/access_token.txt') as string
        const tokenObj = JSON.parse(token) as { access_token: string, scope: string, token_type: string, expiry_date: number }
        oauth2Client.setCredentials(tokenObj);
        // console.log(oauth2Client)
        const calendar: calendar_v3.Calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });
        const res = await calendar.calendarList.get({
            calendarId: "c_bdcf749c763969d87ba39e9fe3a5d7c89025b3c01a1a12fbaa115f44373b8d4a@group.calendar.google.com"
        })
        console.log(res.data)
    } catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err as Error
        console.log(error.message)
    }
}

export const getClientEvents = async () => {
    try {
        const calendar = await getClientCalendar()
        const res = await calendar.events.list({
            calendarId: "c_bdcf749c763969d87ba39e9fe3a5d7c89025b3c01a1a12fbaa115f44373b8d4a@group.calendar.google.com",
            maxResults: 1000,
            orderBy: "updated"
        })
        res.data.items?.forEach((el)=>{
            console.log(el.summary)
            console.log(el.start)
            //{ dateTime: '2024-12-15T18:30:00+08:00', timeZone: 'Asia/Singapore' }
            console.log(el.end)
            //{ dateTime: '2024-12-15T20:30:00+08:00', timeZone: 'Asia/Singapore' }
            console.log(el.status)
            // confirmed
        })
    } catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err as Error
        console.log(error.message)
    }
}

export const newClientEvent = async (calId: string, event: calendar_v3.Schema$Event) => {
    try {
        const calendar = await getClientCalendar()
        const res = await calendar.events.insert(
            {
                calendarId: calId,
                requestBody: event
            }
        )
        logDev({status: res.status, protocal: 'insert', summary: res.data.summary})

    } catch (err) {
        const error = err as Error
        console.log(error.message)
    }
}

export const findClientEventByOrderId = async (calId: string, orderId: any) => {
    try {
        const calendar = await getClientCalendar()
        const res = await calendar.events.list(
            {
                calendarId: calId,
                q: orderId,
            }
        )
        logDev({status: res.status, protocol: 'get', summary: res.data.description})
        return res.data

    } catch (err) {
        const error = err as Error
        console.log(error.message)
    }

}

// server side auth
export const getServerCalendars = async () => {
    try {
        const authClient = await serviceAuth.getClient()
        // const project = await serviceAuth.getProjectId();
        const client = await google.calendar({
            version: 'v3',
            auth: authClient
        });
        const res = await client.calendarList.get(
            {
                calendarId: "c_bdcf749c763969d87ba39e9fe3a5d7c89025b3c01a1a12fbaa115f44373b8d4a@group.calendar.google.com"
            }
        )
        console.log(res.data)
    } catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err as Error
        console.log(error)
    }
}

// scopes required for shopify integration
/* 
calendar id: c_bdcf749c763969d87ba39e9fe3a5d7c89025b3c01a1a12fbaa115f44373b8d4a@group.calendar.google.com
1) Read a calendar
2) Read a calendar event
3) Delete a calendar event
4) Create a calendar event
5) List all calendars
*/