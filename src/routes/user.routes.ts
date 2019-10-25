import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export const userRouter = Router()
    .post('/register', UserController.registerUser);
