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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(security_1.securityHeadersMiddleware);
app.use(security_1.corsMiddleware);
app.use(express_1.default.json());
app.use(security_1.sanitizationMiddleware);
app.use('/api/', rateLimiter_1.apiRateLimiter);
// Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/categories', categoryRoutes_1.default);
app.use('/api/v1/products', productRoutes_1.default);
app.use('/api/v1/inventory', inventoryRoutes_1.default);
app.use('/api/v1/barcode', inventoryRoutes_1.default); // barcode endpoints mounted under inventory/barcode as well
app.use('/api/v1/pricing', inventoryRoutes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await (0, redis_1.connectRedis)();
        app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
