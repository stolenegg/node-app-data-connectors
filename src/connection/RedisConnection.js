const redis = require('redis');

module.exports = (
    logger,
    metrics,
    host,
    port,
    dbIndex,
) => {
    logger.info('redisconnector.init', {
        host,
        port,
        dbIndex,
    });

    const CONNECT_TIMEOUT_MS = 2000;
    let client = null;

    const RedisConnector = {
        client: () => {
            if (client) {
                return client;
            }

            client = redis.createClient(
                port,
                host,
                { connect_timeout: CONNECT_TIMEOUT_MS, dbIndex },
            );
            client.on('error', (err) => {
                logger.error(
                    'cache.error',
                    {
                        message: err.toString(),
                    },
                );
                client = null;
            });

            return client;
        },
    };

    RedisConnector.set = (key, value) => {
        logger.info('cache.set', {
            key,
        });

        return new Promise((resolve, reject) => {
            RedisConnector.client().set(key, value, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    };

    RedisConnector.delete = (key) => {
        logger.info('cache.delete', { key });

        return new Promise((resolve, reject) => {
            RedisConnector.client().del(key, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    };

    return RedisConnector;
};
