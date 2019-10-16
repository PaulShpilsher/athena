import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Schema, SchemaDefinition } from 'mongoose';

const salt = process.env.BCRYPT_SALT as string;

const roles = ['user', 'admin', 'guest'];

const schema = {
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxlength: 128,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
        maxlength: 128,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        maxlength: 128,
        trim: true,
        select: false   // No select
    },
    age: {
        type: Number,
        min: [13, 'Too young'],
        max: 99,
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    role: {
        type: String,
        enum: roles,
        default: 'user'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
};

const userSchema = new Schema(schema as SchemaDefinition, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});

userSchema.pre('save', async function(next) {
    // Hash the password before saving the user model
    const user: any = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, salt);
    }
    next();
});

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET as string);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
};

userSchema.statics.findByCredentials = async (email: string, password: string) => {
    // Search for a user by email and password.
    const user: any = await User.findOne({ email});
    if (!user) {
        throw new Error('Invalid login credentials');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials');
    }
    return user;
};

export const User = mongoose.model('User', userSchema);
