import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { securityHeadersMiddleware, corsMiddleware, sanitizationMiddleware } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import { logger } from './utils/logger';
import { BackupService } from './utils/backup';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizationMiddleware);
app.use('/api/', apiRateLimiter);

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack || err.message);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred.',
    },
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    BackupService.scheduleDailyBackup();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();