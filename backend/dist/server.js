"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
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
const supplierRoutes_1 = __importDefault(require("./routes/supplierRoutes"));
const purchaseOrderRoutes_1 = __importDefault(require("./routes/purchaseOrderRoutes"));
const dashboardRoutes_1 = require("./routes/dashboardRoutes");
const analyticsRoutes_1 = require("./routes/analyticsRoutes");
const accountingRoutes_1 = require("./routes/accountingRoutes");
const reportRoutes_1 = require("./routes/reportRoutes");
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const PORT = process.env.PORT || 5000;
security_1.securityMiddleware.forEach((mw) => app.use(mw));
app.use(rateLimiter_1.apiRateLimiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', async (_req, res) => {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';
    try {
        const client = await database_1.pool.connect();
        await client.query('SELECT 1');
        client.release();
        dbStatus = 'connected';
    }
    catch (err) {
        dbStatus = 'error';
    }
    try {
        if (redis_1.redisClient.isOpen) {
            await redis_1.redisClient.ping();
            redisStatus = 'connected';
        }
    }
    catch (err) {
        redisStatus = 'error';
    }
    const healthy = dbStatus === 'connected';
    res.status(healthy ? 200 : 503).json({
        success: healthy,
        timestamp: new Date().toISOString(),
        services: {
            database: dbStatus,
            redis: redisStatus,
            server: 'running',
        },
        uptime: process.uptime(),
    });
});
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/categories', categoryRoutes_1.default);
app.use('/api/v1/products', productRoutes_1.default);
app.use('/api/v1/inventory', inventoryRoutes_1.default);
app.use('/api/v1/pos', posRoutes_1.default);
app.use('/api/v1/sales', salesRoutes_1.default);
app.use('/api/v1/suppliers', supplierRoutes_1.default);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes_1.default);
app.use('/api/v1/dashboard', dashboardRoutes_1.dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes_1.analyticsRoutes);
app.use('/api/v1/accounting', accountingRoutes_1.accountingRoutes);
app.use('/api/v1/reports', reportRoutes_1.reportRoutes);
app.use('/api/v1/notifications', notificationRoutes_1.default);
app.use('/api/v1/settings', settingsRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use((err, req, res, _next) => {
    logger_1.logger.error(`Unhandled error on ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });
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
        await (0, redis_1.connectRedis)();
        server.listen(PORT, () => {
            logger_1.logger.info(`Smart Retail System Backend running on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
