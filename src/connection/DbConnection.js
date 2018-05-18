/* eslint no-param-reassign: 1 */

const mysql = require('mysql2');

const DEFAULT_OUTPUT_LABEL = 'connector.DBConnection';
// These flags are expected to be reasonably stable for any service
// but are mainly performance-driven, so as to prevent connections from backing up
// and services becoming silently overwhelmed and unresponsive.
// Further documentation on these flags can be found at https://github.com/mysqljs/mysql#pool-options
//
// Connection pool size, i.e. number of connections that can be ready in the pool
// They're lazily loaded
const CONNECTION_LIMIT = 200;

// Milliseconds to wait to be allocated a connection from the pool
const ACQUIRE_TIMEOUT = 1000;

// If set to `true`, the driver will queue up any newly requested connections if the amount
// exceeds the current connection limit.
// If `false`, the driver will immediately error out when it runs out of connections. This is to
// prevent a backlog of connection requests from silently backing up.
const WAIT_FOR_CONNECTIONS = false;

// Only applicable if `waitForConnections` is true
// Maximum amount of requests to push into the queue awaiting a connection from the pool
const QUEUE_LIMIT = 100;

module.exports = (
    logger,
    timers,
    host,
    port,
    user,
    password,
    database,
    connectionOptions = {},
    enableConnectionLogging = false,
) => {
    const poolOpts = Object.assign({
        host,
        port,
        user,
        password,
        database,
        connectionLimit: CONNECTION_LIMIT,
        queueLimit: QUEUE_LIMIT,
        acquireTimeout: ACQUIRE_TIMEOUT,
        waitForConnections: WAIT_FOR_CONNECTIONS,
    }, connectionOptions);

    const pool = mysql.createPool(poolOpts);

    logger.info('connector.DBConnection.init', {
        message: 'new db connection',
        host,
        port,
    });

    function releaseConnection(connection) {
        connection.release();

        if (enableConnectionLogging) {
            logger.info('connector.DBConnection.releaseConnection', {
                message: 'db connection dropped',
            });
        }
    }

    function newConnection() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    logger.error('connector.DBConnection.newConnection', err);
                    return reject(err);
                }

                if (enableConnectionLogging) {
                    logger.info('connector.DBConnection.newConnection', {
                        message: 'new db connection sourced from pool',
                    });
                }

                return resolve(connection);
            });
        });
    }

    function bindParamLabels(sql, values) {
        if (!values || values.length === 0) {
            return sql;
        }

        return sql.replace(/:(\w+)/g, (txt, key) => {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                return mysql.escape(values[key]);
            }

            return txt;
        });
    }

    function query(sql, values = [], label) {
        const outputLabel = label || DEFAULT_OUTPUT_LABEL;
        return new Promise((resolve, reject) => {
            const startToken = timers.start();
            newConnection()
                .then((connection) => {
                    connection.query(sql, values, (err, rows) => {
                        const duration = timers.stop(startToken);
                        if (err) {
                            logger.error(`${outputLabel}.sql`, err);
                            connection.destroy();
                            return reject(err);
                        }
                        logger.info(`${outputLabel}.query.done`, {
                            duration,
                            count: rows.length,
                        });
                        releaseConnection(connection);
                        return resolve(rows);
                    });
                })
                .catch((err) => {
                    logger.error(`${outputLabel}.sql`, err);
                    reject(err);
                });
        });
    }

    function labelQuery(sql, values = [], label) {
        const outputLabel = label || DEFAULT_OUTPUT_LABEL;
        return new Promise((resolve, reject) => {
            const startToken = timers.start();
            newConnection()
                .then((connection) => {
                    connection.config.queryFormat = bindParamLabels;
                    const formattedSql = connection.format(sql, values);

                    connection.query(formattedSql, values, (err, rows) => {
                        const duration = timers.stop(startToken);
                        if (err) {
                            logger.error(`${outputLabel}.sql`, err);
                            return reject(err);
                        }
                        logger.info(`${outputLabel}.query.done`, {
                            duration,
                            count: rows.length,
                        });

                        // Since query format is set per connection and we have a pool of them,
                        // we might end up reusing this connection with this query format in a
                        // query that doesn't expect it.
                        connection.config.queryFormat = null;
                        releaseConnection(connection);
                        return resolve(rows);
                    });
                })
                .catch((err) => {
                    logger.error(`${outputLabel}.sql`, err);
                    reject(err);
                });
        });
    }

    function multiStmtQuery(sql, values, label, options = {}) {
        if (poolOpts.multipleStatements !== true) {
            return Promise.reject(new Error('This pool has not been initialised with "multipleStatements: true" as an option'));
        }

        const outputLabel = label || DEFAULT_OUTPUT_LABEL;
        return new Promise((resolve, reject) => {
            newConnection()
                .then((connection) => {
                    if (options.paramLabels) {
                        connection.config.queryFormat = bindParamLabels;
                    }
                    const queries = values.reduce((acc, row) => {
                        if (row && row.length > 0) {
                            return acc + connection.format(sql, row);
                        }

                        return acc;
                    }, '');
                    connection.query(queries, (err, rows) => {
                        if (err) {
                            logger.error(`${outputLabel}.multiStmtQuery`, { message: err });
                            return reject(err);
                        }

                        if (options.paramLabels) {
                            connection.config.queryFormat = null;
                        }
                        releaseConnection(connection);
                        if (!Array.isArray(rows)) {
                            rows = [rows];
                        }

                        return resolve(rows);
                    });
                })
                .catch((err) => {
                    logger.error(`${outputLabel}.multiStmtQuery`, { message: err });
                    reject(err);
                });
        });
    }

    // TODO -- Use transactions? connection.beginTransaction ...
    function bulkInsert(sql, values, label) {
        const outputLabel = label || DEFAULT_OUTPUT_LABEL;
        return new Promise((resolve, reject) => {
            newConnection()
                .then((connection) => {
                    connection.query(sql, [values], (err) => {
                        if (err) {
                            logger.error(`${outputLabel}.bulkInsert`, err);
                            return reject(err);
                        }
                        releaseConnection(connection);
                        return resolve(true);
                    });
                })
                .catch((err) => {
                    logger.error(`${outputLabel}.bulkInsert`, err);
                    reject(err);
                });
        });
    }

    function isHealthy() {
        return new Promise((resolve, reject) => {
            newConnection()
                .then((connection) => {
                    connection.query('SELECT 1', null, (err, rows) => {
                        if (err) {
                            logger.error('connector.DBConnection.unhealthy', { message: err.message });
                            return reject(err);
                        }
                        releaseConnection(connection);

                        if (!rows || rows.length === 0 || rows[0][1] !== 1) {
                            logger.error('connector.DBConnection.unhealthy', { message: 'Response obtained from database was invalid' });
                            return reject();
                        }

                        return resolve(true);
                    });
                })
                .catch((err) => {
                    logger.error('connector.DBConnection.unhealthy', { message: err.message });
                    reject(err);
                });
        });
    }

    return {
        query,
        multiStmtQuery,
        labelQuery,
        bulkInsert,
        isHealthy,
    };
};
