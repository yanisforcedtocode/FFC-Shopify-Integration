"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const rawParser_1 = __importDefault(require("./utilities/rawParser"));
//============= require modules =============//
const app = (0, express_1.default)();
const testRoutes = require('./routes/testRoutes');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/modalities/errorController');
const errorHandlers_1 = require("./utilities/errorHandlers");
const webHooks_1 = require("./controllers/shopify/webHooks");
const googlecalendar_core_1 = require("./controllers/googlecalendar_core");
app.use('/webHook', rawParser_1.default, webHooks_1.shopifyWebHookRoutes);
(0, googlecalendar_core_1.findClientEventByOrderId)(process.env.GCalendar_calId, 6292931281206);
// const corsOptions = {origin: ['']}
app.use((0, cors_1.default)());
// static serve
app.use(express_1.default.static('public'));
// Middleware to parse JSON request bodies and handle URL encoded data
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// DEV middleswares
if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}
// Routes
app.use('/test', testRoutes);
// catch errors
app.all("*", errorHandlers_1.notFoundHandler);
app.use(globalErrorHandler);
module.exports = app;
