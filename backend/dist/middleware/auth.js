"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Missing or malformed authorization token' },
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
        });
    }
};
exports.authenticateJwt = authenticateJwt;
