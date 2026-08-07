"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = withTransaction;
const database_1 = __importDefault(require("../../config/database"));
async function withTransaction(fn) {
    return await database_1.default.$transaction(async (tx) => {
        return await fn(tx);
    });
}
