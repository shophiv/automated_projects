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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(sanitizationMiddleware);
app.use('/api/', apiRateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/barcode', inventoryRoutes); // barcode endpoints mounted under inventory/barcode as well
app.use('/api/v1/pricing', inventoryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();