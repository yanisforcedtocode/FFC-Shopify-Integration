'use strict'

import { NextFunction, Request, Response } from "express"
import {writeStringToFile } from "./../utilities/saveStringsToFiles"

//============= require components =============//
const express  = require('express')
const typeSenseController = require('../controllers/typeSense/typseSenseClient')
const router = express.Router()
//============= require controllers =============//
const asyncWrapper = require('./../utilities/asyncWrapper')
//============= handlers =============//
const getTest = asyncWrapper(async(req: Request, res: Response,next: NextFunction)=>{
    console.log('Test route connected')
    console.log( req.query )
    if(req.query.code && req.query.scope){
        const authKey = {code: req.query.code, scope: req.query.scope}
        await writeStringToFile('./utilities/keyFiles/calendarAuthKey.txt', JSON.stringify(authKey))
    }
    return res.status(200).json({
        message: 'Test route connected'
    })
})
//============= routes =============//
router.route('/').get(getTest)
//============= typeSense operations =============//
router.route('/typeSense/addClasses')
.get(typeSenseController.addManyClasses)

module.exports = router