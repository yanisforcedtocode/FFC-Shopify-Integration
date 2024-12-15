"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contentType = require('content-type');
const getRawBody = require('raw-body');
const rawParser = (req, res, next) => {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '1mb',
        encoding: contentType.parse(req).parameters.charset
    }, function (err, string) {
        if (err)
            return next(err);
        req.text = string;
        next();
    });
};
exports.default = rawParser;
