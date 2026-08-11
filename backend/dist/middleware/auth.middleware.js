"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../shared/errors/AppError");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError_1.AppError('Authentication token missing or malformed', 401);
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'supersecretkey';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new AppError_1.AppError('Invalid or expired authentication token', 401);
    }
};
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError_1.AppError('Unauthorized access', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError_1.AppError('Forbidden: insufficient permissions', 403);
        }
        next();
    };
};
exports.authorize = authorize;
