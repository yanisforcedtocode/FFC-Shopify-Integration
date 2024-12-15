import { NextFunction, Response } from "express"
import { AppError } from './../../utilities/appError'
import { logDev } from '../../utilities/logDev'
import { formatDateToISO } from '../../utilities/dateToISO'
import { findClientEventByOrderId, newClientEvent } from './../googlecalendar_core'
import { calendar_v3 } from "googleapis"
import { skip } from "node:test"

export type OrderCreated = {
    id: number,
    admin_graphql_api_id: string,
    app_id: string | null,
    browser_ip: string | null,
    buyer_accepts_marketing: boolean,
    cancel_reason: string,
    cancelled_at: string,
    cart_token: string | null,
    checkout_id: string | null,
    checkout_token: string | null,
    client_details: any | null, // Replace 'any' with a more specific type if known
    closed_at: string | null,
    confirmation_number: string | null,
    confirmed: boolean,
    contact_email: string,
    created_at: string,
    currency: string,
    current_subtotal_price: string,
    current_total_additional_fees_set: any | null, // Replace 'any' with a more specific type if known
    current_total_discounts: string,
    current_total_duties_set: any | null, // Replace 'any' with a more specific type if known
    current_total_price: string,
    current_total_tax: string,
    customer_locale: string,
    device_id: string | null,
    discount_codes: { code: string, amount: string, type: string }[], // Replace 'any' with a more specific type if known
    email: string,
    estimated_taxes: boolean,
    financial_status: string,
    fulfillment_status: string,
    landing_site: string | null,
    landing_site_ref: string | null,
    location_id: string | null,
    merchant_of_record_app_id: string | null,
    name: string,
    note: string | null,
    note_attributes: any[], // Replace 'any' with a more specific type if known
    number: number,
    order_number: number,
    order_status_url: string,
    original_total_additional_fees_set: any | null, // Replace 'any' with a more specific type if known
    original_total_duties_set: any | null, // Replace 'any' with a more specific type if known
    payment_gateway_names: string[],
    phone: string | null,
    po_number: string | null,
    presentment_currency: string,
    processed_at: string | null,
    reference: string | null,
    referring_site: string | null,
    source_identifier: string | null,
    source_name: string,
    source_url: string | null,
    subtotal_price: string,
    tags: string,
    tax_exempt: boolean,
    tax_lines: any[], // Replace 'any' with a more specific type if known
    taxes_included: boolean,
    test: boolean,
    token: string,
    total_discounts: string,
    total_line_items_price: string,
    total_outstanding: string,
    total_price: string,
    total_tax: string,
    total_tip_received: string,
    total_weight: number,
    updated_at: string,
    user_id: string | null,
    customer: WebHookCustomer,
    discount_applications: any[], // Replace 'any' with a more specific type if known
    fulfillments: any[], // Replace 'any' with a more specific type if known
    line_items: WebHookLineItem[],
    payment_terms: any | null, // Replace 'any' with a more specific type if known
    refunds: any[], // Replace 'any' with a more specific type if known
}
export type WebHookCustomer = {
    id: number,
    email: string,
    accepts_marketing: boolean,
    created_at: string | null,
    updated_at: string | null,
    first_name: string,
    last_name: string,
    state: string,
    note: string | null,
    verified_email: boolean,
    multipass_identifier: string | null,
    tax_exempt: boolean,
    phone: string | null,
    email_marketing_consent: {
        state: string,
        opt_in_level: string | null,
        consent_updated_at: string | null,
    } | null,
    sms_marketing_consent: any | null, // Replace 'any' with a more specific type if known
    tags: string,
    currency: string,
    accepts_marketing_updated_at: string | null,
    marketing_opt_in_level: string | null,
    tax_exemptions: string[],
    admin_graphql_api_id: string
}
export type WebHookLineItem = {
    id: number,
    admin_graphql_api_id: string,
    attributed_staffs: any[], // Replace 'any' with a more specific type if known
    current_quantity: number,
    fulfillable_quantity: number,
    fulfillment_service: string,
    fulfillment_status: string | null,
    gift_card: boolean,
    grams: number,
    name: string,
    price: string,
    product_exists: boolean,
    product_id: number,
    properties: any[], // Replace 'any' with a more specific type if known
    quantity: number,
    requires_shipping: boolean,
    sku: string,
    taxable: boolean,
    title: string,
    total_discount: string,
    variant_id: number,
    variant_inventory_management: string,
    variant_title: string | null,
    vendor: string | null,
    tax_lines: any[], // Replace 'any' with a more specific type if known
    duties: any[], // Replace 'any' with a more specific type if known
    discount_allocations: any[] // Replace 'any' with a more specific type if known
}

const getClassInfo = (order: OrderCreated) => {
    const lineItemsInfo = order.line_items.map((el) => {
        let title = el.title
        let orderId = order.id
        let timeISO: string = ''
        let address: string = ''
        let qty = el.quantity
        el.properties.forEach((el_01) => {
            if (el_01.name === 'time') {
                timeISO = el_01.value ? formatDateToISO(new Date(Date.parse(el_01.value))) : ''
            }
            if (el_01.name === 'address') {
                address = el_01.value ? el_01.value : ''
            }
        })
        return { title, timeISO, address, orderId, qty }
    })
    return lineItemsInfo
}
const getCalEvent = (info: {
    title: string; timeISO: string; address: string; orderId: number; qty: number
}) => {
    const event: calendar_v3.Schema$Event = {
        summary: `${info.title} | ${info.orderId}`,
        location: info.address,
        description: `A ${info.title} class request from shopify API. quantity: ${info.qty}`,
        'start': {
            'dateTime': info.timeISO,
            'timeZone': 'Asia/Singapore',
        },
        'end': {
            'dateTime': formatDateToISO(new Date(Date.parse(info.timeISO) + 3600000)),
            'timeZone': 'Asia/Singapore',
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
    }
    return event

}
const getDoubleEvents = async (info: {
    title: string; timeISO: string; address: string; orderId: number; qty: number
}) => {
    const data = await findClientEventByOrderId(process.env.GCalendar_calId!, info.orderId)
    let double = false
    data?.items ? data.items.forEach((el) => {
        console.log(el.start?.dateTime)
        if (el.start?.dateTime === info.timeISO) double = true
    }) : ''
    return double
}

export const orderCreateHandler = async (req: any, res: Response) => {
  const orderCreated = req.bodyObj as OrderCreated
  const lineItemsInfo = getClassInfo(orderCreated)
  console.log(lineItemsInfo)
  try {
    for (const info of lineItemsInfo) {
        if(!info.address || !info.timeISO) continue 
        const event = getCalEvent(info)
        let double = await getDoubleEvents(info)
        logDev(`${info.title} double detected ${double}`)
        !double? await newClientEvent(process.env.GCalendar_calId!, event):''
    }
    res.status(200).json({
        status: 200,
        data: { customerId: orderCreated.customer.id, message: "completed" }
      })
  } catch (error) {
    console.log(error)
    // send sync fail email**
    res.status(500).json({
      status: 500,
      data: { customerId: orderCreated.customer.id, message: error }
    })
  }
}


