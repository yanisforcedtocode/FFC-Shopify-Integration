'use strict'
//============= require modules =============//
const express = require('express')
const app = express()
const passport = require('passport')
const cookieParser = require('cookie-parser')
const cors = require('cors')
//============= variables =============//
const protectRoute = (passport)=>{
    return passport.authenticate('jwt', { session: false })
}
const corsOptions = {
  origin: 'http://127.0.0.1:9292',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  
  credentials: true,
  allowedHeaders: "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
  preflightContinue: true,
  optionsSuccessStatus: 200,
}
//============= require handlers =============//
const configPassport = require('./passport-config')
const testRoutes = require('./routes/testRoutes')
const AppError = require('./utilities/appError')
const globalErrorHandler = require('./controllers/modalities/errorController')
//============= db model =============//
//============= global dir =============//
global.__basedir = __dirname
//============= middleware =============//
if(process.env.environment === 'development'){
  app.all("*", (req, res, next)=>{
    next(console.log(`CORS allowed origin: ${req.get('origin')===corsOptions.origin}`)) 
  })
}
app.use(cors(corsOptions),)
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json({limit:'10kb'}));
//============= handlers =============//
//============= passport initialization =============//
app.use(passport.initialize())
configPassport(passport)
//============= Routes =============//
app.use('/test', testRoutes);
app.all("*", (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)) 
  })
app.use(globalErrorHandler)
//============= Exports =============//
module.exports = app