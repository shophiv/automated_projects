import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { categoryRoutes } from './modules/categories/category.routes';
import { productRoutes } from './modules/products/product.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

app.use(errorMiddleware);

export default app;