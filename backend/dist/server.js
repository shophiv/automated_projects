"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const security_middleware_1 = require("./middleware/security.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const app = (0, express_1.default)();
app.use(security_middleware_1.securityHeaders);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(security_middleware_1.sanitizeInput);
app.use('/api', rateLimit_middleware_1.apiLimiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() });
});
// Mount Routes
app.use('/api/v1/auth', auth_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        code: err.status || 500,
        message: err.message || 'Internal Server Error'
    });
});
app.listen(env_1.ENV.PORT, () => {
    console.log(`Server is running on port ${env_1.ENV.PORT} in ${env_1.ENV.NODE_ENV} mode.`);
});
exports.default = app;
