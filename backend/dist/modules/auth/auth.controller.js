"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    authService = new auth_service_1.AuthService();
    register = async (req, res) => {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    login = async (req, res) => {
        try {
            const result = await this.authService.login(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    };
    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }
            const result = await this.authService.refreshToken(refreshToken);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(403).json({ error: err.message });
        }
    };
    passwordReset = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: 'Email is required' });
                return;
            }
            const result = await this.authService.requestPasswordReset(email);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AuthController = AuthController;
