import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { securityHeadersMiddleware, corsMiddleware, sanitizationMiddleware } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import posRoutes from './routes/posRoutes';
import salesRoutes from './routes/salesRoutes';
import supplierRoutes from './routes/supplierRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(sanitizationMiddleware);

app.use('/api', apiRateLimiter);

app.get('/health', async (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack || err.message);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;