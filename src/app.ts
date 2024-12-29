import express from 'express';
import rawParser from './utilities/rawParser'

//============= require modules =============//
const app = express()
const testRoutes = require('./routes/testRoutes')
const globalErrorHandler = require('./controllers/modalities/errorController')
import { notFoundHandler } from "./utilities/errorHandlers"
import { shopifyWebHookRoutes } from "./controllers/shopify/webHooks"
import { findServiceEventByOrderId } from "./controllers/googlecalendar_core"
import {  } from './controllers/shopify/webhooksHandler';

app.use('/webHook', rawParser, shopifyWebHookRoutes)
// run scripts
if(process.env.environment === "development"){
  findServiceEventByOrderId(process.env.GCalendar_calId!, 6329619644726)
}
  
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