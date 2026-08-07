import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { securityHeaders, sanitizeInput } from './middleware/security.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/category.routes';
import productRoutes from './modules/products/product.routes';

const app = express();

app.use(securityHeaders);
app.use(cors());
app.use(express.json());
app.use(sanitizeInput);
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    code: err.status || 500,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
});

export default app;