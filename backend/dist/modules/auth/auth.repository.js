"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = __importDefault(require("../../config/database"));
const client_1 = require("@prisma/client");
class AuthRepository {
    async findTenantByEmail(email) {
        return await database_1.default.tenant.findUnique({ where: { email } });
    }
    async findUserByEmail(email) {
        return await database_1.default.user.findUnique({ where: { email } });
    }
    async findUserById(id) {
        return await database_1.default.user.findUnique({ where: { id } });
    }
    async createTenantAndOwner(data) {
        return await database_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    business_name: data.businessName,
                    owner_name: data.ownerName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                },
            });
            const user = await tx.user.create({
                data: {
                    tenant_id: tenant.id,
                    name: data.ownerName,
                    email: data.email,
                    password_hash: data.passwordHash,
                    role: client_1.Role.OWNER,
                },
            });
            return { tenant, user };
        });
    }
    async updateLastLogin(userId) {
        return await database_1.default.user.update({
            where: { id: userId },
            data: { last_login: new Date() },
        });
    }
    async updatePassword(userId, passwordHash) {
        return await database_1.default.user.update({
            where: { id: userId },
            data: { password_hash: passwordHash },
        });
    }
}
exports.AuthRepository = AuthRepository;
