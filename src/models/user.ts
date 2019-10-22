import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Document, Schema, Model, model } from 'mongoose';
import { bcryptCompare, bcryptHash } from '../utils/bcrypt-helpers';


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

userSchema.methods.comparePassword = async function(testPassword: string): Promise<boolean> {
    const user: IUser = this;
    return await bcryptCompare(testPassword, user.password);
};

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET as string);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
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
