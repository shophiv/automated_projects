"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const validation_js_1 = require("../utils/validation.js");
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const missing = (0, validation_js_1.validateRequiredFields)(['email', 'password'], req.body);
            if (missing.length > 0) {
                res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
                return;
            }
            if (!(0, validation_js_1.validateEmail)(email)) {
                res.status(400).json({ error: 'Invalid email format' });
                return;
            }
            const result = await this.authService.authenticate(email, password);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message || 'Authentication failed' });
        }
    };
}
exports.AuthController = AuthController;
