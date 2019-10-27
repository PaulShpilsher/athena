import dotenv from 'dotenv';
import log4js from 'log4js';

const getEnvVar = (envVariable: string, defaultValue?: string): string => {
    const value = process.env[envVariable];
    if(!!value) {
        return value;
    }
    else if(!!defaultValue) {
        return defaultValue;
    }
    else {
        throw new Error(`Missing environment variable ${envVariable}`);
    }
};

// load config into env
dotenv.config();

export const env: string = getEnvVar('NODE_ENV', 'production');
export const port: number = Number.parseInt(getEnvVar('PORT', '4300'), 10);

export const bcryptSalt: string = getEnvVar('BCRYPT_SALT');

export const jwtSecret: string = getEnvVar('JWT_SECRET');
export const jwtExpirationSeconds: number = Number.parseInt(getEnvVar('JWT_EXPIRATION_MINUTES', '5'), 10) * 60;
export const uploadLimitMb = 5;

export const mongoUri: string = getEnvVar('MONGO_URI');
export const redisUri = getEnvVar('REDIS_URI');

export const logLevel: string = getEnvVar('LOG_LEVEL', 'info');
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
