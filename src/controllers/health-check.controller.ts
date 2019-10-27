import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils';

export abstract class HealthCheckController {
    static greeting(req: Request, res: Response, next: NextFunction): void {
        sendSuccess(res, 'Greetings from Athena');
        next();
    }
}
