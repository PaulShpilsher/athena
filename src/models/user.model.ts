import { NextFunction } from 'express';
import { Document, Schema, Model, model } from 'mongoose';
import { User } from './user.interface';
import { hash, hashSync } from 'bcryptjs';
import { bcryptSalt } from '../settings';

const roles = ['user', 'admin', 'guest'];

export interface UserDocument extends User, Document {}

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
        trim: true
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

userSchema.pre<UserDocument>('save', async function(next: NextFunction) {
    // Hash the password before saving the user model
    const user = this;
    try {
        if (user.isModified('password')) {
            user.password = await hash(user.password, bcryptSalt);
        }
        next();
    }
    catch(error) {
        // TODO: add error logging
        return next(error);
    }
});

// userSchema.statics = {
//     roles,

//     async get(id: number): Promise<UserDocument> {
//         if (Types.ObjectId.isValid(id)) {
//             const user: UserDocument = await this.findById(id).exec();
//             if(existy(user)) {
//                 return user;
//             }
//         }
//         throw new ApiError({
//             message: 'User does not exist',
//             status: httpStatus.NOT_FOUND
//         });
//     },

//     async findAndCheckPassword(email: string, password: string): Promise<{user: UserDocument, token: string}> {
//         if (!existy(email) || !existy(password)) {
//             throw new ApiError({
//                 message: 'An email and password are required to generate a token',
//                 status: httpStatus.BAD_REQUEST});
//         }

//         const user = await this.findOne({ email }).exec();
//         if(existy(user) && (await bcryptCompare(user.password, password))) {
//             return {
//                 user,
//                 token: user.token()
//             };
//         }
//         throw new ApiError({
//             message: 'Incorrect email or password',
//             status: httpStatus.UNAUTHORIZED,
//         });
//     }
//};

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

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
