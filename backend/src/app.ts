import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/products/category.routes';
import productRoutes from './modules/products/product.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import pricingRoutes from './modules/pricing/pricing.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import posRoutes from './modules/pos/pos.routes';
import poRoutes from './modules/suppliers/po.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import accountingRoutes from './modules/accounting/accounting.routes';
import reportRoutes from './modules/reports/report.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import settingsRoutes from './modules/settings/settings.routes';
import adminRoutes from './modules/admin/admin.routes';
import { limiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/purchase-orders', poRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/accounting', accountingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;