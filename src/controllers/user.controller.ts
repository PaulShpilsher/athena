import { Logger, getLogger } from 'log4js';
import { Request, Response, NextFunction } from 'express';
import { UserModel, UserDocument } from '../models/user.model';
import { sendError } from '../utils';
import { makeUserToken } from '../middleware/auth-token';
import { server } from '../server';

export abstract class UserController {
    static async registerUser(req: Request, res: Response, next: NextFunction) {
        const { email, password, username, role } = req.body;
        if(!email) {
            return sendError(res, httpStatus.BAD_REQUEST, 'Email required');
        }
        if(!password) {
            return sendError(res, httpStatus.BAD_REQUEST, 'Username password');
        }
        if(!username) {
            return sendError(res, httpStatus.BAD_REQUEST, 'Username required');
        }

        try {
            const user: UserDocument = await new UserModel({
                email,
                password,
                username,
                role
            }).save();

            const token = await makeUserToken(user);

            server.logger.info('Registered user', user);
            return res.status(httpStatus.CREATED).json({ data: token });
        }
        catch(err) {
            server.logger.error('Registered user failed', err);
            return sendError(res, httpStatus.BAD_REQUEST, 'Unable to register user', err);
        }
    }
}
