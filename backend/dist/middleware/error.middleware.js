"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const AppError_1 = require("../shared/errors/AppError");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        });
    }
    console.error('Unhandled Error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};
exports.errorMiddleware = errorMiddleware;
