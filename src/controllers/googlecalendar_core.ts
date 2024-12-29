import { calendar_v3, drive_v3, GoogleApis } from "googleapis"
import path from "path"
import { openUrlInBrowser } from "../utilities/openurl"
import { readFileContent, writeStringToFile } from "../utilities/saveStringsToFiles"
import { logDev } from '../utilities/logDev'
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    process.env.GCalendar_CLIENT_ID,
    process.env.GCalendar_CLIENT_SECRET,
    process.env.GCalendar_REDIRECT_URL
);

// Oauth2 calendar
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
        if (tokenRes.tokens.refresh_token) {
            writeStringToFile('./utilities/keyFiles/refresh_token.txt', JSON.stringify(tokenRes.tokens))
            console.log("refresh: ", tokenRes.tokens.refresh_token);
        }
        if (!tokenRes.tokens.refresh_token) {
            await writeStringToFile('./utilities/keyFiles/access_token.txt', JSON.stringify(tokenRes.tokens))
            console.log("access: ", tokenRes.tokens.access_token);
        }
        tokenRes.tokens
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

// Service calendar
const serviceAuth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), '/utilities/keyFiles/sound-responder-334902-27e27960b2c3.json'),
    scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/admin.directory.resource.calendar',
        'https://www.googleapis.com/auth/drive'],
});

const getServiceCalendar = async ()=>{
    const authClient = await serviceAuth.getClient()
    authClient.subject = process.env.GCalendar_admin
        const calendar: calendar_v3.Calendar = await google.calendar({
            version: 'v3',
            auth: authClient
        });
        calendar.settings.context
        return calendar
}
const getServiceDrive = async ()=>{
    const authClient = await serviceAuth.getClient()
    authClient.subject = process.env.GCalendar_admin
        const drive: drive_v3.Drive = await google.drive({
            version: 'v3',
            auth: authClient
        });
        return drive
}

// interactions with the client calendar
export const getClientCalendars = async () => {
    try {
        const token = await readFileContent('./utilities/keyFiles/access_token.txt') as string
        const tokenObj = JSON.parse(token) as { access_token: string, scope: string, token_type: string, expiry_date: number }
        oauth2Client.setCredentials(tokenObj);
        const calendar: calendar_v3.Calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });
        const res = await calendar.calendarList.get({
            calendarId: process.env.calGCalendar_calId
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
            calendarId: process.env.calGCalendar_calId,
            maxResults: 1000,
            orderBy: "updated"
        })
        res.data.items?.forEach((el)=>{
            console.log(el.summary)
            console.log(el.start)
            console.log(el.end)
            console.log(el.status)
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

// interactions with the service calendar
export const findServiceEventByOrderId = async (calId: string, orderId: any) => {
    try {
        const calendar = await getServiceCalendar()
        const res = await calendar.events.list(
            {
                calendarId: calId,
                q: orderId,
            }
        )
        logDev({status: res.status, protocol: 'get', itemsCount: res.data.items?.length})
        return res.data

    } catch (err) {
        const error = err as Error
        console.log(error.message)
    }

}
export const getServiceEvents = async () => {
    try {
        const calendar = await getServiceCalendar()
        const res = await calendar.events.list({
            calendarId: process.env.calGCalendar_calId,
            maxResults: 1000,
            orderBy: "updated"
        })
        res.data.items?.forEach((el)=>{
            console.log(el.summary)
            console.log(el.start)
            console.log(el.end)
            console.log(el.status)
            // confirmed
        })
    } catch (err) {
        // the calendar Id is not found, will throw an error message: Not Found"
        const error = err as Error
        console.log(error.message)
    }
}
export const newServiceEvent = async (calId: string, event: calendar_v3.Schema$Event, notification: boolean) => {
    try {
        const calendar = await getServiceCalendar()
        const res = await calendar.events.insert(
            {
                calendarId: calId,
                requestBody: event,
                sendNotifications: notification
            }
        )
        logDev({status: res.status, protocal: 'insert', summary: res.data.summary})
        return res

    } catch (err) {
        const error = err as Error
        console.log(error.message)
    }
}

// scopes required for shopify integration
/* 
1) Read a calendar
2) Read a calendar event
3) Delete a calendar event
4) Create a calendar event
5) List all calendars
*/