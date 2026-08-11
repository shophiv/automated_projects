import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { connectDatabase, pool } from './config/database';
import { connectRedis, redisClient } from './config/redis';
import { logger } from './utils/logger';
import { securityMiddleware } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import posRoutes from './routes/posRoutes';
import salesRoutes from './routes/salesRoutes';
import supplierRoutes from './routes/supplierRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';
import { accountingRoutes } from './routes/accountingRoutes';
import { reportRoutes } from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import settingsRoutes from './routes/settingsRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

securityMiddleware.forEach((mw) => app.use(mw));
app.use(apiRateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      redisStatus = 'connected';
    }
  } catch (err) {
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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/accounting', accountingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error on ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });
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
    await connectDatabase();
    await connectRedis();

    server.listen(PORT, () => {
      logger.info(`Smart Retail System Backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };