"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const database_1 = require("./config/database");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.get('/api/v1/health', async (req, res) => {
    try {
        await database_1.pool.query('SELECT 1');
        res.status(200).json({ status: 'healthy', database: 'connected' });
    }
    catch (error) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1', product_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
