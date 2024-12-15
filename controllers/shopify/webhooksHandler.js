"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderCreateHandler = void 0;
const logDev_1 = require("../../utilities/logDev");
const dateToISO_1 = require("../../utilities/dateToISO");
const googlecalendar_core_1 = require("./../googlecalendar_core");
const getClassInfo = (order) => {
    const lineItemsInfo = order.line_items.map((el) => {
        let title = el.title;
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
        return { title, timeISO, address, orderId, qty };
    });
    return lineItemsInfo;
};
const getCalEvent = (info) => {
    const event = {
        summary: `${info.title} | ${info.orderId}`,
        location: info.address,
        description: `A ${info.title} class request from shopify API. quantity: ${info.qty}`,
        'start': {
            'dateTime': info.timeISO,
            'timeZone': 'Asia/Singapore',
        },
        'end': {
            'dateTime': (0, dateToISO_1.formatDateToISO)(new Date(Date.parse(info.timeISO) + 3600000)),
            'timeZone': 'Asia/Singapore',
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
    };
    return event;
};
const getDoubleEvents = async (info) => {
    const data = await (0, googlecalendar_core_1.findClientEventByOrderId)(process.env.GCalendar_calId, info.orderId);
    let double = false;
    (data === null || data === void 0 ? void 0 : data.items) ? data.items.forEach((el) => {
        var _a, _b;
        console.log((_a = el.start) === null || _a === void 0 ? void 0 : _a.dateTime);
        if (((_b = el.start) === null || _b === void 0 ? void 0 : _b.dateTime) === info.timeISO)
            double = true;
    }) : '';
    return double;
};
const orderCreateHandler = async (req, res) => {
    const orderCreated = req.bodyObj;
    const lineItemsInfo = getClassInfo(orderCreated);
    console.log(lineItemsInfo);
    try {
        for (const info of lineItemsInfo) {
            if (!info.address || !info.timeISO)
                continue;
            const event = getCalEvent(info);
            let double = await getDoubleEvents(info);
            (0, logDev_1.logDev)(`${info.title} double detected ${double}`);
            !double ? await (0, googlecalendar_core_1.newClientEvent)(process.env.GCalendar_calId, event) : '';
        }
        res.status(200).json({
            status: 200,
            data: { customerId: orderCreated.customer.id, message: "completed" }
        });
    }
    catch (error) {
        console.log(error);
        // send sync fail email**
        res.status(500).json({
            status: 500,
            data: { customerId: orderCreated.customer.id, message: error }
        });
    }
};
exports.orderCreateHandler = orderCreateHandler;
