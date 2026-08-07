"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const migrate_1 = require("./shared/database/migrate");
const startServer = async () => {
    try {
        await (0, migrate_1.runMigrations)();
        app_1.default.listen(env_1.ENV.PORT, () => {
            logger_1.logger.info(`Server running on port ${env_1.ENV.PORT} in ${env_1.ENV.NODE_ENV} mode`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
