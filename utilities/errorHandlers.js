"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const appError_1 = require("./appError");
const notFoundHandler = (req, res, next) => {
    res.status(404);
    next(new appError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};
exports.notFoundHandler = notFoundHandler;
