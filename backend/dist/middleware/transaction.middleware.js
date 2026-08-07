"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionMiddleware = void 0;
const database_1 = require("../config/database");
const transactionMiddleware = async (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    const client = await (0, database_1.getClient)();
    req.dbClient = client;
    try {
        await client.query('BEGIN');
        let committed = false;
        res.on('finish', async () => {
            if (!committed) {
                try {
                    if (res.statusCode >= 400) {
                        await client.query('ROLLBACK');
                    }
                    else {
                        await client.query('COMMIT');
                    }
                    committed = true;
                }
                catch (err) {
                    console.error('Transaction commit/rollback error on finish', err);
                }
                finally {
                    client.release();
                }
            }
        });
        res.on('close', async () => {
            if (!committed) {
                try {
                    await client.query('ROLLBACK');
                    committed = true;
                }
                catch (err) {
                    console.error('Transaction rollback error on close', err);
                }
                finally {
                    client.release();
                }
            }
        });
        next();
    }
    catch (error) {
        client.release();
        next(error);
    }
};
exports.transactionMiddleware = transactionMiddleware;
