"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const category_routes_1 = __importDefault(require("./modules/products/category.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const supplier_routes_1 = __importDefault(require("./modules/suppliers/supplier.routes"));
const pricing_routes_1 = __importDefault(require("./modules/pricing/pricing.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const pos_routes_1 = __importDefault(require("./modules/pos/pos.routes"));
const po_routes_1 = __importDefault(require("./modules/suppliers/po.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const accounting_routes_1 = __importDefault(require("./modules/accounting/accounting.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(rateLimit_middleware_1.limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/categories', category_routes_1.default);
app.use('/api/v1/products', product_routes_1.default);
app.use('/api/v1/suppliers', supplier_routes_1.default);
app.use('/api/v1/pricing', pricing_routes_1.default);
app.use('/api/v1/inventory', inventory_routes_1.default);
app.use('/api/v1/pos', pos_routes_1.default);
app.use('/api/v1/purchase-orders', po_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.use('/api/v1/accounting', accounting_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
app.use('/api/v1/settings', settings_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
