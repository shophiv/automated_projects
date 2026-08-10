"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const category_routes_1 = __importDefault(require("./modules/categories/category.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(rateLimiter_1.apiLimiter);
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, status: 'UP', timestamp: new Date().toISOString() });
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1', auth_routes_1.default); // for /users endpoint routed under api/v1
app.use('/api/v1/categories', category_routes_1.default);
app.use('/api/v1/products', product_routes_1.default);
app.use('/api/v1/pricing', product_routes_1.default); // pricing routes mounted under /api/v1/pricing via productRoutes
app.use(errorHandler_1.errorHandler);
exports.default = app;
