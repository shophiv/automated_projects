import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { securityHeadersMiddleware, corsMiddleware, sanitizationMiddleware } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import posRoutes from './routes/posRoutes';
import salesRoutes from './routes/salesRoutes';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(sanitizationMiddleware);
app.use('/api/', apiRateLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/sales', salesRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack || err.message);
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
    try {
      await connectRedis();
    } catch (redisErr) {
      logger.warn('Redis connection failed, continuing without cache layer.', redisErr);
    }

    app.listen(port, () => {
      logger.info(`Smart Retail Server is running on port ${port}`);
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