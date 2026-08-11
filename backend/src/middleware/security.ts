import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet(),
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];