import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { Logger, getLogger } from 'log4js';
import { compare } from 'bcryptjs';

import { Identity } from '../models/identity.interface';
import { UserModel, UserDocument } from '../models/user.model';
import { makeAuthToken } from '../middleware/auth-token';
import { throwArgumentValidationFailed, existy, sendSuccess, sendError, throwApiError } from '../utils';

// const logger: Logger = getLogger('AuthController');

export abstract class AuthController {
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password }: { email: string, password: string } = req.body;
        if (!(email && password)) {
            throwArgumentValidationFailed();
        }

        const user: UserDocument = await UserModel.findOne({ email }) as UserDocument;
        if(existy(user) && await compare(password, user.password)) {
            const ident: Identity = {
                userId: user.id,
                userName: user.username,
                userRole: user.role
            };

            const token = await makeAuthToken(ident);
            sendSuccess(res, undefined, token);
        }
        else {
            sendError(res, httpStatus.UNAUTHORIZED, 'Unauthorized user');
        }
        next();
    }

    static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { oldPassword, newPassword }: { oldPassword: string, newPassword: string } = req.body;
        if (!(existy(oldPassword) && existy(newPassword))) {
            throwArgumentValidationFailed();
        }

        const identity: Identity = res.locals.indentity; // must be authorized
        const user: UserDocument = await UserModel.findById(identity.userId).exec() as UserDocument;
        if(!existy(user)) {
            throwApiError(httpStatus.NOT_FOUND, 'No such user');
        }

        if(await compare(oldPassword, user.password)) {
            user.password = newPassword;
            try {
                await user.save();
                sendSuccess(res);
            }
            catch(err) {
                sendError(res, httpStatus.BAD_REQUEST, 'Unable to change password', err);
            }
        }
        else {
            sendError(res, httpStatus.BAD_REQUEST, 'Invalid password');
        }
        next();
    }
}
