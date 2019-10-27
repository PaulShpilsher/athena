import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }

    readonly status: number;
}

export const throwApiError = (status: number, message: string) => { throw new ApiError(status, message); };

export const sendSuccess = (res: Response, message?: string, data?: any) =>
    res.status(httpStatus.OK).json({
        message,
        data
    });

export const sendError = (res: Response, status: number, message: string, error?: Error) =>
    res.status(status || httpStatus.INTERNAL_SERVER_ERROR).json({
        message,
        error
    });

export const sendValidationFailed = (res: Response) => sendError(res, httpStatus.BAD_REQUEST, 'Request data validation failed');

type ApiHandler = (req: Request, res: Response, next: NextFunction) => any;

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) =>
    Promise
        .resolve(fn(req, res, next))
        .catch((err: any) => {
            if(err instanceof ApiError) {
                sendError(res, err.status, err.message, err);
            }
            else {
                next(err);
            }
        });
