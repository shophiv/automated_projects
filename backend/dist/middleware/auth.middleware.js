"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Missing or malformed authorization token' }
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        req.user = {
            userId: payload.userId,
            retailerId: payload.retailerId,
            role: payload.role,
            email: payload.email
        };
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Invalid or expired token' }
        });
    }
};
exports.authenticateJWT = authenticateJWT;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'You do not have permission to access this resource' }
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
