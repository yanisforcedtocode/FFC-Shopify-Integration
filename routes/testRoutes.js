'use strict'
//============= require components =============//
const express  = require('express')
const passport = require('passport')
const typeSenseController = require('../controllers/typeSense/typseSenseClient')
const router = express.Router()
//============= require controllers =============//
const asyncWrapper = require('./../utilities/asyncWrapper')
//============= handlers =============//
const getTest = asyncWrapper(async(req,res,next)=>{
    console.log('protected route connected')
    return res.status(200).json({
        message: 'protected route connected'
    })
})
//============= routes =============//
router.route('test').get(getTest)
//============= update operations =============//
//============= public query operations =============//
//============= typeSense operations =============//
router.route('/typeSense/addProducts')
.get(typeSenseController.addManyProducts)

module.exports = router