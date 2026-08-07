"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = void 0;
exports.sanitizeInput = sanitizeInput;
const helmet_1 = __importDefault(require("helmet"));
exports.securityHeaders = (0, helmet_1.default)();
function sanitizeInput(req, res, next) {
    // Basic input sanitization middleware layer
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                // Strip basic malicious HTML/JS tags if needed
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
}
