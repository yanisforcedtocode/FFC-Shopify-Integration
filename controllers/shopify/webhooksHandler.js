"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEventCreation = exports.orderCreateHandler = void 0;
const logDev_1 = require("../../utilities/logDev");
const dateToISO_1 = require("../../utilities/dateToISO");
const googlecalendar_core_1 = require("./../googlecalendar_core");
const getLineItemsInfo = (order) => {
    const lineItemsInfo = order.line_items.map((el) => {
        let client = order.customer.first_name;
        let classTitle = el.title;
        let clientEmail = order.customer.email ? order.customer.email : undefined;
        let orderId = order.id;
        let timeISO = '';
        let address = '';
        let qty = el.quantity;
        el.properties.forEach((el_01) => {
            if (el_01.name === 'time') {
                timeISO = el_01.value ? (0, dateToISO_1.formatDateToISO)(new Date(Date.parse(el_01.value))) : '';
            }
            if (el_01.name === 'address') {
                address = el_01.value ? el_01.value : '';
            }
        });
        return { client, clientEmail, classTitle, timeISO, address, orderId, qty };
    });
    return lineItemsInfo;
};
const getInternalCalEvent = (info, duration) => {
    const event = {
        summary: `${info.client} | ${info.classTitle} (Trainer - $Price) | ${info.orderId}`,
        location: info.address,
        description: `A ${info.classTitle} class request from shopify API. quantity: ${info.qty}`,
        'start': {
            'dateTime': info.timeISO,
            'timeZone': 'Asia/Singapore',
        },
        'end': {
            'dateTime': (0, dateToISO_1.formatDateToISO)(new Date(Date.parse(info.timeISO) + duration * 3600000)),
            'timeZone': 'Asia/Singapore',
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
        attendees: [
            {
                email: process.env.GCalendar_coordinator,
                organizer: true,
                responseStatus: 'needsAction'
            }
        ]
    };
    return event;
};
const getExternalCalEvent = (info, duration) => {
    const event = {
        summary: `${info.client} | ${info.classTitle} | FITFAMCO`,
        location: info.address,
        description: `A ${info.classTitle} class request from shopify API. quantity: ${info.qty}`,
        'start': {
            'dateTime': info.timeISO,
            'timeZone': 'Asia/Singapore',
        },
        'end': {
            'dateTime': (0, dateToISO_1.formatDateToISO)(new Date(Date.parse(info.timeISO) + duration * 3600000)),
            'timeZone': 'Asia/Singapore',
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
        attendees: [{
                email: info.clientEmail,
                organizer: true,
                responseStatus: 'needsAction'
            }
        ]
    };
    return event;
};
const getDoubleEvents = async (info) => {
    const data = await (0, googlecalendar_core_1.findServiceEventByOrderId)(process.env.GCalendar_calId, info.orderId);
    let double = false;
    (data === null || data === void 0 ? void 0 : data.items) ? data.items.forEach((el) => {
        var _a, _b;
        (0, logDev_1.logDev)((_a = el.start) === null || _a === void 0 ? void 0 : _a.dateTime);
        if (((_b = el.start) === null || _b === void 0 ? void 0 : _b.dateTime) === info.timeISO)
            double = true;
    }) : '';
    return double;
};
const orderCreateHandler = async (req, res) => {
    const orderCreated = req.bodyObj;
    const lineItemsInfo = getLineItemsInfo(orderCreated);
    if (lineItemsInfo.length < 1) {
        res.status(400).json({
            status: 400,
            data: undefined,
            message: "Bad request. No line items received."
        });
    }
    (0, logDev_1.logDev)({ lineItemsInfo: lineItemsInfo });
    try {
        for (const info of lineItemsInfo) {
            if (!info.address || !info.timeISO)
                continue;
            const double = await getDoubleEvents(info);
            (0, logDev_1.logDev)(`${info.classTitle} double detected ${double}`);
            if (double)
                continue;
            const event = getInternalCalEvent(info, 1);
            const clientEvent = getExternalCalEvent(info, 1);
            await (0, googlecalendar_core_1.newServiceEvent)(process.env.GCalendar_calId, event, true);
            await (0, googlecalendar_core_1.newServiceEvent)(process.env.GCalendar_clientCalId, clientEvent, true);
        }
        res.status(200).json({
            status: 200,
            data: { customerId: orderCreated.customer.id, message: "completed" }
        });
    }
    catch (error) {
        console.log(error);
        // todo: send sync fail email**
        res.status(500).json({
            status: 500,
            data: { customerId: orderCreated.customer.id, message: error }
        });
    }
};
exports.orderCreateHandler = orderCreateHandler;
const testEventCreation = async () => {
    const lineItem = {
        client: 'test client',
        clientEmail: 'test@example.com',
        classTitle: 'test title',
        timeISO: '2025-01-16T08:05:00+08:00',
        address: '672A YISHUN AVENUE 4 VINE GROVE @ YISHUN SINGAPORE 761672, ZIP CODE: 761672',
        orderId: 6329763889462,
        qty: 1
    };
    // const event = getInternalCalEvent(lineItem, 1)
    const event = getExternalCalEvent(lineItem, 1);
    const res = await (0, googlecalendar_core_1.newServiceEvent)(process.env.GCalendar_calId, event, true);
    console.log(res === null || res === void 0 ? void 0 : res.data);
};
exports.testEventCreation = testEventCreation;
