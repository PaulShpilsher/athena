import { Request, Response } from 'express';
import { bcryptHash } from '../utils/bcrypt-helpers';
import { User, IUser, createUserToken } from '../models/user.model';
import { sign } from 'jsonwebtoken';
import { jwtSecret, jwtExpirationMinutes } from 'src/settings';

export class UserController {
    public async registerUser(request: Request, response: Response): Promise<void> {
        const user = await User.create({
            email: request.body.email,
            password: await bcryptHash(request.body.password),
            username: request.body.username,
            role: 'user'
        });

        // const token: string = createUserToken(user);
        response.status(httpStatus.CREATED).send({ id: user.id });
    }

    public authenticateUser(request: Request, response: Response, next: NextFunction) {
        passport.authenticate("local", function (err, user, info) {
          // no async/await because passport works only with callback ..
          if (err) return next(err);
          if (!user) {
            return response.status(401).json({ status: "error", code: "unauthorized" });
          } else {
            const token = jwt.sign({ username: user.username }, JWT_SECRET);
            response.status(200).send({ token: token });
          }
        });
      }
}
