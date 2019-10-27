import httpStatus from 'http-status';
import { Logger, getLogger } from 'log4js';
import { Request, Response, NextFunction } from 'express';
import { Identity } from '../models/identity.interface';
import { verifyAuthToken } from './auth-token';
import { asyncHandler, sendError } from '../utils';

// const logger: Logger = getLogger('AuthMiddleware');

export const checkAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let error;
    const authHeader = req.headers.authorization;
    if(!!authHeader && authHeader.startsWith('Bearer ')) {
        const token: string = authHeader.substring(7, authHeader.length);
        try {
            const ident: Identity = await verifyAuthToken(token);
            res.locals.indentity = ident;
            next();
            return;
        }
        catch(err) {
            error = err;
        }
    }
    sendError(res, httpStatus.UNAUTHORIZED, 'Unauthorized user', error);
});
