"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected error occurred';
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: message,
            details: err.details || []
        }
    });
};
exports.errorHandler = errorHandler;
