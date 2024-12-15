import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'
import rawParser from './utilities/rawParser'

//============= require modules =============//
const app = express()
const testRoutes = require('./routes/testRoutes')
const AppError = require('./utilities/appError')
const globalErrorHandler = require('./controllers/modalities/errorController')
import { notFoundHandler } from "./utilities/errorHandlers"
import { shopifyWebHookRoutes } from "./controllers/shopify/webHooks"
import { formatDateToISO } from './utilities/dateToISO'
import { logDev } from './utilities/logDev'
import { findClientEventByOrderId, getAuth2Code, getServerCalendars, getClientToken, getClientCalendars, getClientEvents, newClientEvent} from "./controllers/googlecalendar_core"

app.use('/webHook', rawParser, shopifyWebHookRoutes)
findClientEventByOrderId(process.env.GCalendar_calId!, 6292931281206)

// const corsOptions = {origin: ['']}
app.use(cors());
// static serve
app.use(express.static('public'));

// Middleware to parse JSON request bodies and handle URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEV middleswares
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan')
  app.use(morgan('dev'));
}

// Routes
app.use('/test', testRoutes);

// catch errors

app.all("*", notFoundHandler)
app.use(globalErrorHandler)

module.exports = app