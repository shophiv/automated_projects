"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const admin_routes_1 = require("./modules/admin/admin.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
app.use('/api/v1/auth', auth_routes_1.authRoutes);
app.use('/api/v1/admin', admin_routes_1.adminRoutes);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
