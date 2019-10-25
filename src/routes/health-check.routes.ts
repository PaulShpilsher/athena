import { Router } from 'express';
import { checkAuth } from '../middleware/auth.middleware';
import { HealthCheckController } from '../controllers/health-check.controller';

export const healthCheckRouter = Router()
    .get('/greeting', HealthCheckController.greeting)
    .get('/authorized-greeting', [checkAuth], HealthCheckController.greeting);
