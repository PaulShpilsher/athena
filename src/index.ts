import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import log4js, { Logger } from 'log4js';
import mongoose from 'mongoose';

// get .env
dotenv.config();

//  logger
log4js.configure({
    appenders: {
        console: { type: 'console' }
    },
    categories: {
    default: {
            appenders: ['console'],
            level: process.env.LOG_LEVEL || 'info'
        }
    }
});

async function startUp() {
    const logger: Logger = log4js.getLogger();

    logger.info('Connecting to mongo');
    try {
        await mongoose.connect(process.env.MONGO_URI || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
    }
    catch(error) {
        logger.error(error.message);
        process.exit(1);
    }
    logger.info('Mongo connected');

    mongoose.connection
        .on('connected', () => logger.info('Mongoose default connection is open'))
        .on('error', (err) => logger.error('Mongoose default connection ERROR', err))
        .on('connected', () => logger.info('Mongoose default connection is disconnected'));

    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            logger.log('Mongoose default connection is disconnected due to application termination');
            process.exit(0);
        });
    });

    logger.info('Setting up express');
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(log4js.connectLogger(logger, {
        level: 'trace',
        format: (req, res, format) => format(`:remote-addr :method :url ${JSON.stringify(req.body)}`)
      }));

    app.get('/', (request, response) => response.send('Welcome to Athena project'));

    app.listen(process.env.PORT, () => logger.info(`server started at http://localhost:${process.env.PORT}`));

}

(async () => await startUp())();
