"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
class Database {
    static instance;
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new client_1.PrismaClient();
        }
        return Database.instance;
    }
}
exports.db = Database.getInstance();
