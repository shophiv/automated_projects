"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = require("./utils/logger");
const security_1 = require("./middleware/security");
const rateLimiter_1 = require("./middleware/rateLimiter");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const posRoutes_1 = __importDefault(require("./routes/posRoutes"));
const salesRoutes_1 = __importDefault(require("./routes/salesRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '5000', 10);
app.use(security_1.securityHeadersMiddleware);
app.use(security_1.corsMiddleware);
app.use(express_1.default.json());
app.use(security_1.sanitizationMiddleware);
app.use('/api/', rateLimiter_1.apiRateLimiter);
// Health check endpoint
app.get('/health', async (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/categories', categoryRoutes_1.default);
app.use('/api/v1/products', productRoutes_1.default);
app.use('/api/v1/inventory', inventoryRoutes_1.default);
app.use('/api/v1/pos', posRoutes_1.default);
app.use('/api/v1/sales', salesRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    logger_1.logger.error(err.stack || err.message);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected error occurred',
        },
    });
});
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        try {
            await (0, redis_1.connectRedis)();
        }
        catch (redisErr) {
            logger_1.logger.warn('Redis connection failed, continuing without cache layer.', redisErr);
        }
        app.listen(port, () => {
            logger_1.logger.info(`Smart Retail Server is running on port ${port}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
exports.default = app;
