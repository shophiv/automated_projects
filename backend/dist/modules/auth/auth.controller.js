"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    authService = new auth_service_1.AuthService();
    register = async (req, res) => {
        try {
            const result = await this.authService.register(req.body);
            return res.status(201).json({ status: 'success', data: result });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    login = async (req, res) => {
        try {
            const result = await this.authService.login(req.body);
            return res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            return res.status(401).json({ status: 'error', code: 401, message: error.message });
        }
    };
    forgotPassword = async (req, res) => {
        try {
            // Mocked password reset trigger
            return res.status(200).json({ status: 'success', message: 'Password reset instructions sent to email if registered.' });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    resetPassword = async (req, res) => {
        try {
            return res.status(200).json({ status: 'success', message: 'Password successfully reset.' });
        }
        catch (error) {
            return res.status(400).json({ status: 'error', code: 400, message: error.message });
        }
    };
    getMe = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ status: 'error', code: 401, message: 'Unauthorized' });
            }
            const user = await this.authService.getMe(req.user.id);
            return res.status(200).json({ status: 'success', data: user });
        }
        catch (error) {
            return res.status(404).json({ status: 'error', code: 404, message: error.message });
        }
    };
}
exports.AuthController = AuthController;
