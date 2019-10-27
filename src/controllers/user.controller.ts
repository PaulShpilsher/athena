import { Logger, getLogger } from 'log4js';
import { Request, Response, NextFunction } from 'express';
import { UserModel, UserDocument } from '../models/user.model';
import { sendError, throwArgumentValidationFailed } from '../utils';

const logger: Logger = getLogger('UserController');

export abstract class UserController {
    static async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password, username, role } = req.body;
        if(!(email && password && username)) {
            throwArgumentValidationFailed();
        }

        try {
            const userModel: UserDocument = await new UserModel({
                email,
                password,
                username,
                role
            }).save();
            logger.info('Registered user', userModel);
        }
        catch(err) {
            logger.error(`Registered user failed.  Error: ${err}, Request body: ${JSON.stringify(req.body)}`);
            sendError(res, httpStatus.BAD_REQUEST, 'Unable to register user', err);
        }
        next();
    }
}
