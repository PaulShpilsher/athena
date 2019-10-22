import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export class UserRoutes {
    constructor() {
        this.controller = new UserController();
        this.router = Router();
        this.router
            .post('register', this.controller.registerUser)
            .post('/login', this.controller.authenticateUser)
    }

    router: Router;
    readonly controller = new UserController();
}
