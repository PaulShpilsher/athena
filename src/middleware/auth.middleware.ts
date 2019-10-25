import { Request, Response, NextFunction } from 'express';
import { Identity } from '../models/identity.interface';
import { verifyAuthToken } from './auth-token';
import { Logger, getLogger } from 'log4js';
import httpStatus from 'http-status';

const logger: Logger = getLogger('AuthMiddleware');

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith('Bearer ')) {
        const token: string = authHeader.substring(7, authHeader.length);
        try {
            const ident: Identity = await verifyAuthToken(token);
            res.locals.indentity = ident;
            next();
            return;
        }
        catch(err) {
            logger.error(`Token verification failed: ${err.message}`);
        }
    }
    res.status(httpStatus.UNAUTHORIZED).json({message: 'Unauthorized user'});
};
