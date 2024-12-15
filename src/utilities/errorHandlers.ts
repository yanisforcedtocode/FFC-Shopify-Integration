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