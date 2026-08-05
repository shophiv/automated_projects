"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("./authService");
const validation_1 = require("../../shared/validation/validation");
class AuthController {
    authService;
    constructor() {
        this.authService = new authService_1.AuthService();
    }
    register = async (req, res) => {
        const validationError = (0, validation_1.validateRegistrationPayload)(req.body);
        if (validationError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: validationError } });
            return;
        }
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json({ status: 'success', data: result });
        }
        catch (error) {
            res.status(400).json({ error: { code: 'REGISTRATION_FAILED', message: error.message } });
        }
    };
    login = async (req, res) => {
        const validationError = (0, validation_1.validateLoginPayload)(req.body);
        if (validationError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: validationError } });
            return;
        }
        try {
            const result = await this.authService.login(req.body);
            res.status(200).json({ status: 'success', data: result });
        }
        catch (error) {
            res.status(401).json({ error: { code: 'AUTHENTICATION_FAILED', message: error.message } });
        }
    };
}
exports.AuthController = AuthController;
