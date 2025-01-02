"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.notFoundHandler = void 0;
const appError_1 = require("./appError");
const notFoundHandler = (req, res, next) => {
    res.status(404);
    next(new appError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};
exports.notFoundHandler = notFoundHandler;
const globalErrorHandler = (err, req, res, next) => {
    console.log("errorHandler on");
    console.log(err.message);
    console.error(err.stack);
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }
    // Set the response status code and send an error message
    const errorCode = err instanceof appError_1.AppError ? err.statusCode : 500;
    res.status(errorCode).json({ status: errorCode, error: err.message });
};
exports.globalErrorHandler = globalErrorHandler;
