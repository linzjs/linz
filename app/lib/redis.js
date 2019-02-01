'use strict';

const Redis = require('ioredis');

Redis.Promise.onPossiblyUnhandledRejection((err) => console.log(`Unhandled Redis error: ${err}`));

class IORedis {

    constructor () {

        const redis = new Redis('redis://redis-dev:6379', {
            retryStrategy: (times) => {

                if (times >= 10) {

                    console.log('Retry limit of 10 reached, could not connect to Redis');

                    // eslint-disable-next-line no-process-exit
                    return process.exit(1);

                }

                return times * 2000;

            },
        });

        redis.on('close', () => console.log('Redis closed'));
        redis.on('connect', () => console.log('Redis connected'));
        redis.on('end', () => console.log('Redis ended'));
        redis.on('error', (err) => console.log(err));
        redis.on('ready', () => console.log('Redis ready'));
        redis.on('reconnecting', () => console.log('Redis reconnecting'));

        return redis;

    }

}

module.exports = IORedis;
