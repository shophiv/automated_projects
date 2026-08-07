import app from './app';
import { ENV } from './config/env';
import { logger } from './config/logger';
import { runMigrations } from './shared/database/migrate';

const startServer = async () => {
  try {
    await runMigrations();
    app.listen(ENV.PORT, () => {
      logger.info(`Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();