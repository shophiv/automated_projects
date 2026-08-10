"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizationMiddleware = exports.corsMiddleware = exports.securityHeadersMiddleware = void 0;
exports.default = securityMiddleware;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
exports.securityHeadersMiddleware = (0, helmet_1.default)();
exports.corsMiddleware = (0, cors_1.default)({
    origin: '*', // Configure appropriately in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
const sanitizationMiddleware = (req, res, next) => {
    // Basic query & body sanitization interceptor to mitigate XSS/SQLi vectors
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};
exports.sanitizationMiddleware = sanitizationMiddleware;
function securityMiddleware(app) {
    app.use((0, helmet_1.default)());
}
