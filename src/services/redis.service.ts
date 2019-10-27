
import { RedisClient, createClient } from 'redis';
import { promisify } from 'util';
import { existy } from '../utils';
import { redisUri } from '../settings';

export class RedisService {
    constructor() {
    }

    private _redisClient: RedisClient;

    start(): void {
        this._redisClient = createClient(redisUri)
            .on('connect', () => console.log('Redis connected'))
            .on('error', (err) => console.error('Redis error', err))
            .on('warning', (warn) => console.error('Redis error', warn))
            .on('ready', () => console.log('Redis is ready'))
            .on('reconnecting', (delay, attempt) => console.log(`Redis is reconnecting.  Delay: ${delay}, Attempt: ${attempt}`))
            .on('end', () => console.log('Redis disconnected'));
    }

    async stop(): Promise<void> {
        if(existy(this._redisClient) && this._redisClient.connected) {
            return await promisify(this._redisClient.quit).bind(this._redisClient)();
        }
        else {
            return;
        }
    }
}
