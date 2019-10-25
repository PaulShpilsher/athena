
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Logger, getLogger, connectLogger } from 'log4js';
import mongoose from 'mongoose';
import { logLevel, mongoUri, port } from './settings';
import { userRouter } from './routes/user.routes';
import { authRouter } from './routes/auth.routes';

const mongoConnect = async (opt = {}) => await mongoose.connect(mongoUri, {
    ...opt,
    autoReconnect: true,
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

class Server {
    constructor() {
        this._app = express();
        this._logger = getLogger();
    }

    private readonly _app: express.Application;
    private readonly _logger: Logger;

    start(): void {
        this._initMongo();
        this._initServer();
        this._initRoutes();
        this._app.listen(port, () => this._logger.info(`server started at http://localhost:${process.env.PORT}`));
    }

    private _initServer(): void {
        this._app
            .use(connectLogger(this._logger, {
                level: logLevel,
                format: (req, res, format) => format(`:remote-addr :method :url ${JSON.stringify(req.body)}`)
            }))

            .use(helmet())                              // secure apps by setting various HTTP headers
            .use(helmet.noCache())
            .use(cors())                                // enable CORS - Cross Origin Resource Sharing
            .use(express.json())                        //
            .use(express.urlencoded({extended: false})) //
            .use(compression())                         // gzip compression

            .get('/', (_, response) => response.send('Welcome to Athena project'));
    }

    private _initMongo(): void {
        mongoose.connection
            .on('error', (error: Error) => this._logger.error(`Mongo connection error: ${error}`))
            .on('close', () => this._logger.log('Mongo connection closed'))
            .on('connected', () => this._logger.log('Mongo connected'))
            .on('reconnected', () => this._logger.log('Mongo reconnected'))
            .on('disconnected', () => {
                this._logger.log('Mongo disconnected, trying to reestablish connection...');
                setTimeout(() => mongoConnect({socketTimeoutMS: 3000, connectTimeoutMS: 3000}), 3000);
            });

        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                this._logger.log('Mongoose default connection is disconnected due to application termination');
                process.exit(0);
            });
        });

        mongoConnect()
            .catch(error => {
                this._logger.error(error);
                process.exit(-1);
            });
    }

    private _initRoutes(): void {
        this._app
            .use('/api/user', userRouter)
            .use('/api/auth', authRouter);
    }
}

//
const server = new Server();
server.start();
