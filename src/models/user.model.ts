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
    }
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

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
