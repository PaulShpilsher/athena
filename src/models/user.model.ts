import { NextFunction } from 'express';
import { sign } from 'jsonwebtoken';
import { Document, Schema, Model, model, Types } from 'mongoose';
import { bcryptCompare, bcryptHash } from '../utils/bcrypt-helpers';
import { jwtExpirationMinutes, jwtSecret } from '../settings';
import { existy } from '../utils/general-helpers';
import { ApiError } from '../utils/api-error';


const roles = ['user', 'admin', 'guest'];

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    role: string;
}

const userSchema = new Schema({
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        maxlength: 128,
        trim: true,
        select: false   // No select
    },
    username: {
        type: String,
        required: true,
        minLength: 2,
        maxlength: 128,
        trim: true
    },
    role: {
        type: String,
        enum: roles,
        default: 'user'
    },
    // tokens: [{
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }]
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});

userSchema.pre<IUser>('save', async function(next: NextFunction) {
    // Hash the password before saving the user model
    const user = this;
    try {
        if (user.isModified('password')) {
            user.password =  await bcryptHash(user.password);
        }
        next();
    }
    catch(error) {
        // TODO: add error logging
        return next(error);
    }
});

export const createUserToken = (user: IUser): string => {
    const notBefore = Math.floor(Date.now() / 1000);
    const expiresIn = notBefore + (jwtExpirationMinutes * 60);

    const token: string = sign({
        username: user.username,
        role: user.role
    }, jwtSecret, {
        algorithm: 'RS512',
        expiresIn,
        notBefore,
        subject: user._id
    });
    return token;
}

const matchUserPassword = async (user: IUser, password: string): Promise<boolean> => await bcryptCompare(password, user.password);

userSchema.statics = {
    roles,

    async get(id: number): Promise<IUser> {
        if (Types.ObjectId.isValid(id)) {
            const user: IUser = await this.findById(id).exec();
            if(existy(user)) {
                return user;
            }
        }
        throw new ApiError({
            message: 'User does not exist',
            status: httpStatus.NOT_FOUND
        });
    },

    async findAndCheckPassword(email: string, password: string): Promise<{user: IUser, token: string}> {
        if (!existy(email) || !existy(password)) {
            throw new ApiError({
                message: 'An email and password are required to generate a token',
                status: httpStatus.BAD_REQUEST});
        }

        const user = await this.findOne({ email }).exec();
        if(existy(user) && (await matchUserPassword(user, password))) {
            return {
                user,
                token: user.token()
            };
        }
        throw new ApiError({
            message: 'Incorrect email or password',
            status: httpStatus.UNAUTHORIZED,
        });
    }
};

// userSchema.statics.findByCredentials = async (email: string, password: string) => {
//     // Search for a user by email and password.
//     const user = await User.findOne({ email});
//     if (!user) {
//         throw new Error('Invalid login credentials');
//     }


//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//         throw new Error('Invalid login credentials');
//     }
//     return user;
// };

export const User: Model<IUser> = model<IUser>('User', userSchema);
