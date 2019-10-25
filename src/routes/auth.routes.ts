import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { checkAuth } from '../middleware/auth.middleware';

export const authRouter = Router()
    .post('/login', AuthController.login)
    .post('/change-password', [checkAuth], AuthController.changePassword);
