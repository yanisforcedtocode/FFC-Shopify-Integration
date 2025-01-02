'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const saveStringsToFiles_1 = require("./../utilities/saveStringsToFiles");
//============= require components =============//
const express = require('express');
const router = express.Router();
//============= require controllers =============//
const asyncWrapper = require('./../utilities/asyncWrapper');
//============= handlers =============//
const getTest = asyncWrapper(async (req, res, next) => {
    console.log('Test route connected');
    console.log(req.query);
    if (req.query.code && req.query.scope) {
        const authKey = { code: req.query.code, scope: req.query.scope };
        await (0, saveStringsToFiles_1.writeStringToFile)('./utilities/keyFiles/calendarAuthKey.txt', JSON.stringify(authKey));
    }
    return res.status(200).json({
        message: 'Test route connected'
    });
});
//============= routes =============//
router.route('/').get(getTest);
module.exports = router;
