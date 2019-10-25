import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

export abstract class HealthCheckController {
    static greeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(httpStatus.OK).send({
                message: `Greetings from Athena`
            });
            next();
        }
        catch(err) {
            next(err);
        }
    }
}
