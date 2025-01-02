import { Request, Response, NextFunction } from "express";
import {AppError} from "./appError"

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(404);
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
};

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log("errorHandler on");
    console.log(err.message);
    console.error(err.stack);
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(err);
    }
  
    // Set the response status code and send an error message
    const errorCode = err instanceof AppError ? err.statusCode : 500;
    res.status(errorCode).json({ status: errorCode, error: err.message });
  };
  
  