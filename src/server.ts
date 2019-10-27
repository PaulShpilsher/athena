
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Logger, getLogger, connectLogger } from 'log4js';
import mongoose, { Connection } from 'mongoose';
import { logLevel, mongoUri, port, redisUri } from './settings';
import { userRouter } from './routes/user.routes';
import { authRouter } from './routes/auth.routes';
import { healthCheckRouter } from './routes/health-check.routes';
import bodyParser from 'body-parser';
import { RedisService } from './services/redis.service';

const exit = (code: number) => setTimeout(process.exit, 0, code);

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
        this.logger = getLogger();
        this.redisService = new RedisService();
        this._mongooseConnection = mongoose.connection;
        this._app = express();
    }

    readonly logger: Logger;
    readonly redisService: RedisService;
    private readonly _mongooseConnection: Connection;
    private readonly _app: express.Application;

    start(): void {
        this._initMongo();
        this._initRedis();
        this._initServer();
        this._initRoutes();
        this._app.listen(port, () => this.logger.info(`server started at http://localhost:${port}`));
    }

    private _initServer(): void {
        process.on('SIGINT', () => this._terminate());

        this._app
            .use(connectLogger(this.logger, {
                level: logLevel,
                format: (req, res, format) => format(`:remote-addr :method :url ${JSON.stringify(req.body)}`)
            }))

            .use(helmet())                              // secure apps by setting various HTTP headers
            .use(helmet.noCache())
            .use(cors())                                // enable CORS - Cross Origin Resource Sharing
            .use(express.json())                        //
            .use(bodyParser.json())
            .use(express.urlencoded({extended: false})) //
            .use(compression())                         // gzip compression

            .get('/', (_, response) => response.send('Welcome to Athena project'));
    }

    private _initMongo(): void {
        this._mongooseConnection
            .on('error', (error: Error) => this.logger.error(`Mongo connection error: ${error}`))
            .on('close', () => this.logger.log('Mongo connection closed'))
            .on('connected', () => this.logger.log('Mongo connected'))
            .on('reconnected', () => this.logger.log('Mongo reconnected'))
            .on('disconnected', () => {
                this.logger.log('Mongo disconnected, trying to reestablish connection...');
                setTimeout(() => mongoConnect({socketTimeoutMS: 3000, connectTimeoutMS: 3000}), 3000);
            });

        mongoConnect()
            .catch(error => {
                this.logger.error(error);
                exit(-1);
            });
    }

    private _initRedis(): void {
        this.redisService.start();
    }

    private _initRoutes(): void {
        this._app
            .use('/api/user', userRouter)
            .use('/api/auth', authRouter)
            .use('/api/healthcheck', healthCheckRouter);
    }

    private _terminate(): void {
        Promise.all([
            this._mongooseConnection.close(() => this.logger.log('Mongoose default connection is disconnected due to application termination')),
            this.redisService.stop()
        ]).finally(() => exit(0));
    }
}

//
export const server = new Server();
server.start();
