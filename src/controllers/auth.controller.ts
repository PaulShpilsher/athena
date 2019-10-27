import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { compare } from 'bcryptjs';

import { Identity } from '../models/identity.interface';
import { UserModel, UserDocument } from '../models/user.model';
import { makeAuthToken, makeUserToken } from '../middleware/auth-token';
import { existy, sendSuccess, sendError, sendValidationFailed } from '../utils';

export abstract class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password }: { email: string, password: string } = req.body;
        if (!(email && password)) {
            return sendValidationFailed(res);
        }

        const user: UserDocument = await UserModel.findOne({ email }) as UserDocument;
        if(existy(user) && await compare(password, user.password)) {
            const token = await makeUserToken(user);
            return sendSuccess(res, undefined, token);
        }
        else {
            return sendError(res, httpStatus.UNAUTHORIZED, 'Unauthorized user');
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction) {
        const { oldPassword, newPassword }: { oldPassword: string, newPassword: string } = req.body;
        if (!(existy(oldPassword) && existy(newPassword))) {
            return sendValidationFailed(res);
        }

        const identity: Identity = res.locals.indentity; // must be authorized
        const user: UserDocument = await UserModel.findById(identity.userId).exec() as UserDocument;
        if(!existy(user)) {
            return sendError(res, httpStatus.NOT_FOUND, 'No such user');
        }

        if(await compare(oldPassword, user.password)) {
            user.password = newPassword;
            try {
                await user.save();
                // server.redisService
                return sendSuccess(res);
            }
            catch(err) {
                return sendError(res, httpStatus.BAD_REQUEST, 'Unable to change password', err);
            }
        }
        else {
            return sendError(res, httpStatus.BAD_REQUEST, 'Invalid password');
        }
    }
}
