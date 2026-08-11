"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const AppError_1 = require("../../shared/errors/AppError");
class AuthService {
    async registerTenant(dto) {
        const existingUser = await database_1.db.user.findUnique({ where: { email: dto.email } });
        const existingTenant = await database_1.db.tenant.findUnique({ where: { email: dto.email } });
        if (existingUser || existingTenant) {
            throw new AppError_1.AppError('Email is already registered', 400);
        }
        const saltRounds = 10;
        const password_hash = await bcrypt_1.default.hash(dto.password, saltRounds);
        const result = await database_1.db.$transaction(async (prisma) => {
            const tenant = await prisma.tenant.create({
                data: {
                    business_name: dto.business_name,
                    owner_name: dto.owner_name,
                    email: dto.email,
                    phone: dto.phone,
                    address: dto.address,
                    status: 'PENDING',
                },
            });
            const user = await prisma.user.create({
                data: {
                    tenant_id: tenant.id,
                    name: dto.owner_name,
                    email: dto.email,
                    password_hash,
                    role: 'OWNER',
                    phone: dto.phone,
                },
            });
            await prisma.auditLog.create({
                data: {
                    tenant_id: tenant.id,
                    user_id: user.id,
                    action: 'REGISTER_TENANT',
                    details: `Tenant ${tenant.business_name} registered successfully.`,
                },
            });
            return { tenant, user };
        });
        const token = this.generateToken({
            id: result.user.id,
            tenant_id: result.tenant.id,
            email: result.user.email,
            role: result.user.role,
        });
        return {
            token,
            tenant: result.tenant,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
            },
        };
    }
    async login(dto) {
        const user = await database_1.db.user.findUnique({ where: { email: dto.email } });
        let admin = null;
        if (!user) {
            admin = await database_1.db.admin.findUnique({ where: { email: dto.email } });
            if (!admin) {
                throw new AppError_1.AppError('Invalid email or password', 401);
            }
            const isPasswordValid = await bcrypt_1.default.compare(dto.password, admin.password_hash);
            if (!isPasswordValid) {
                throw new AppError_1.AppError('Invalid email or password', 401);
            }
            const token = this.generateToken({
                id: admin.id,
                email: admin.email,
                role: 'ADMIN',
            });
            return {
                token,
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'ADMIN',
                },
            };
        }
        const isPasswordValid = await bcrypt_1.default.compare(dto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError_1.AppError('Invalid email or password', 401);
        }
        const tenant = await database_1.db.tenant.findUnique({ where: { id: user.tenant_id } });
        if (tenant && tenant.status === 'SUSPENDED') {
            throw new AppError_1.AppError('Tenant account is suspended. Contact administrator.', 403);
        }
        const token = this.generateToken({
            id: user.id,
            tenant_id: user.tenant_id,
            email: user.email,
            role: user.role,
        });
        return {
            token,
            tenant,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async forgotPassword(email) {
        const user = await database_1.db.user.findUnique({ where: { email } });
        if (!user) {
            return;
        }
    }
    async resetPassword(dto) {
        const user = await database_1.db.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new AppError_1.AppError('Invalid user or token', 400);
        }
        const saltRounds = 10;
        const password_hash = await bcrypt_1.default.hash(dto.new_password, saltRounds);
        await database_1.db.user.update({
            where: { email: dto.email },
            data: { password_hash },
        });
    }
    generateToken(payload) {
        const secret = process.env.JWT_SECRET || 'supersecretkey';
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
    }
}
exports.AuthService = AuthService;
