"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }
    res.status(statusCode).json({
        success: false,
        error_code: statusCode,
        message: message,
        details: err.errors || undefined,
    });
};
exports.errorHandler = errorHandler;
