import { Router } from 'express';
import { asyncHandler } from '../utils';
import { UserController } from '../controllers/user.controller';

export const userRouter = Router()
    .post('/register', asyncHandler(UserController.registerUser));
