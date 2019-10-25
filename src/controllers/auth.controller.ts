import { Request, Response, NextFunction } from 'express';
import { UserModel, UserDocument } from '../models/user.model';
import { Logger, getLogger } from 'log4js';
import { existy } from '../utils/general-helpers';
import { Identity } from '../models/identity.interface';
import { compare } from 'bcryptjs';
import { makeAuthToken } from '../middleware/auth-token';
import httpStatus from 'http-status';

const logger: Logger = getLogger('AuthController');

export abstract class AuthController {

    static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password }: { email: string, password: string } = req.body;
            if (!(email && password)) {
                res.status(httpStatus.BAD_REQUEST).json({message: 'Validation failed'});
                return;
            }

            const user: UserDocument = await UserModel.findOne({ email }) as UserDocument;
            if(existy(user) && await compare(password, user.password)) {
                const ident: Identity = {
                    userId: user.id,
                    userName: user.username,
                    userRole: user.role
                };

                const token = await makeAuthToken(ident);
                res.send(token);
                next();
                return;
            }

            res.status(httpStatus.UNAUTHORIZED).json({message: 'Unauthorized user'});
        }
        catch(err) {
            logger.error(`Login caught an exception ${err}`);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({error: err});
        }
    }

    static changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { oldPassword, newPassword }: { oldPassword: string, newPassword: string } = req.body;
            if (!(existy(oldPassword) && existy(newPassword))) {
                res.status(httpStatus.BAD_REQUEST).json({message: 'Validation failed'});
                return;
            }
            const identity: Identity = res.locals.indentity;
            const user: UserDocument = await UserModel.findById(identity.userId).exec() as UserDocument;
            if(existy(user) && await compare(oldPassword, user.password)) {
                user.password = newPassword;
                user.save();
                // TODO: need to invalidate token somehow and issue another one
                // possibly add token to blacklist or something
                res.status(httpStatus.NO_CONTENT).send();
                next();
                return;
            }
            res.status(httpStatus.UNAUTHORIZED).json({message: 'Unauthorized user'});
        }
        catch(err) {
            logger.error(`Login caught an exception ${err}`);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({error: err});
        }
    }
}
