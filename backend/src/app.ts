import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { pool } from './config/database';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/api/v1/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

export default app;