import dotenv from 'dotenv';
import log4js from 'log4js';

const err = (missingVariable: string ) => { throw new Error(`Missing environment variable ${missingVariable}`); };

// load config into env
dotenv.config();

export const env: string = process.env.NODE_ENV || 'production';
export const port: number = Number.parseInt(process.env.PORT || '4300', 10);

if(!process.env.BCRYPT_SALT) {
    err('BCRYPT_SALT');
}
export const bcryptSalt: string = process.env.BCRYPT_SALT as string;

if(!process.env.JWT_SECRET) {
    err('JWT_SECRET');
}
export const jwtSecret: string = process.env.JWT_SECRET as string;
export const jwtExpirationSeconds: number = Number.parseInt(process.env.JWT_EXPIRATION_MINUTES || '20', 10) * 60;

export const uploadLimitMb = 5;

if(!process.env.MONGO_URI) {
    err('MONGO_URI');
}
export const mongoUri: string = process.env.MONGO_URI as string;

export const logLevel: string = process.env.LOG_LEVEL || 'info';
log4js.configure({
    appenders: {
        console: { type: 'console' }
    },
    categories: {
    default: {
            appenders: ['console'],
            level: logLevel
        }
    }
});
