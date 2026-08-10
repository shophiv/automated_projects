"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const security_1 = __importDefault(require("./middleware/security"));
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
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, security_1.default)(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/', rateLimiter_1.apiRateLimiter);
app.get('/health', async (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
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
        await (0, redis_1.connectRedis)();
        app.listen(PORT, () => {
            logger_1.logger.info(`Server is running on port ${PORT}`);
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
