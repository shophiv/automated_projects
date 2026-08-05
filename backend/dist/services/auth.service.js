"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';
class AuthService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async authenticate(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const tokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            email: user.email,
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        const { password_hash, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }
}
exports.AuthService = AuthService;
