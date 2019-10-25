import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { Logger, getLogger } from 'log4js';

const logger: Logger = getLogger('UserController');

export abstract class UserController {

    static registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password, username, role } = req.body;

            const userModel = await new UserModel({
                email,
                password,
                username,
                role
            }).save();
            logger.info(`Registered user: ${userModel.toJSON()}`);
            next();
        }
        catch(err) {
            logger.error(`Registered user failed.  Error: ${err}, Request body: ${JSON.stringify(req.body)}`);
            next(err);
        }
    }
}
