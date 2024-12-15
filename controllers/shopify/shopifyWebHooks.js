"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyWebHookRoutes = void 0;
const express = require('express');
const shopifyWebHookVerification_1 = require("./../controllers/shopifyAdmin/shopifyWebHookVerification");
const shopifyWebhooksHandler_1 = require("./../controllers/moobiPoints/shopifyWebhooksHandler");
exports.shopifyWebHookRoutes = express.Router();
exports.shopifyWebHookRoutes.post('/orderCreate', shopifyWebHookVerification_1.webHookVerification, shopifyWebhooksHandler_1.orderCreateHandler);
// shopifyWebHookRoutes.post('/orderFulfill', webHookVerification, orderFulfillHandler )
