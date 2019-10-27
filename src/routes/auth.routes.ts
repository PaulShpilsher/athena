import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { checkAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils';

export const authRouter = Router()
    .post('/login', asyncHandler(AuthController.login))
    .post('/change-password', [checkAuth], asyncHandler(AuthController.changePassword));
