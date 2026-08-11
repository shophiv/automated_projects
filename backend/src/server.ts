import app from './app';
import { db } from './config/database';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await db.$connect();
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();