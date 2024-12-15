"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyWebHookRoutes = void 0;
const express = require('express');
const webHooksVerification_1 = require("./webHooksVerification");
const webhooksHandler_1 = require("./webhooksHandler");
exports.shopifyWebHookRoutes = express.Router();
exports.shopifyWebHookRoutes.post('/orderCreate', webHooksVerification_1.webHookVerification, webhooksHandler_1.orderCreateHandler);
