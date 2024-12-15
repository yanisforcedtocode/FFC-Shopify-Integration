"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webHookVerification = void 0;
const appError_1 = require("./../../utilities/appError");
const logDev_1 = require("./../../utilities/logDev");
const crypto = require('crypto');
const getHash = async (rawBody, secretKey) => {
    const hash = await crypto
        .createHmac('sha256', secretKey)
        .update(rawBody, 'utf8')
        .digest('base64');
    return hash;
};
const parseRawText = (bufferText) => {
    const bufferString = bufferText.toString('utf8');
    const object = JSON.parse(bufferString);
    return object;
};
const isDomainMatch = (domainHeader) => {
    if (domainHeader === JSON.stringify(process.env.ShopifyDomainLive) || domainHeader === JSON.stringify(process.env.ShopifyDomainDev)) {
        (0, logDev_1.logDev)('domain verification success');
        return true;
    }
    else {
        (0, logDev_1.logDev)('domain verification failed');
        return false;
    }
};
const isHashMatch = (headerhmac, hash) => {
    if (headerhmac === hash) {
        (0, logDev_1.logDev)('hashCheck success');
        return true;
    }
    else {
        (0, logDev_1.logDev)('hashCheck failed');
        return false;
    }
};
const webHookVerification = async (req, res, next) => {
    try {
        // === verification ===
        const getHeaderhmac = req.header('x-shopify-hmac-sha256');
        const shopDomain = req.header('x-shopify-shop-domain');
        const hash = await getHash(req.text, process.env.ShopifyWebHookKey);
        if (!getHeaderhmac)
            throw new appError_1.AppError('No valid hmac in header', 404);
        // Reject failed verifications
        if (!isHashMatch(getHeaderhmac, hash) || !isDomainMatch(JSON.stringify(shopDomain))) {
            console.log("verification failed");
            throw new appError_1.AppError('Webhook verification error', 401);
        }
        else {
            (0, logDev_1.logDev)('verification successful');
            req.bodyObj = parseRawText(req.text);
            next();
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.webHookVerification = webHookVerification;
