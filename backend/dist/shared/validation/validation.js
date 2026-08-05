"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLoginPayload = exports.validateRegistrationPayload = exports.isValidEmail = void 0;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const validateRegistrationPayload = (body) => {
    if (!body.tenantName || typeof body.tenantName !== 'string' || body.tenantName.trim() === '') {
        return 'Tenant name is required and must be a non-empty string.';
    }
    if (!body.email || !(0, exports.isValidEmail)(body.email)) {
        return 'A valid email is required.';
    }
    if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
        return 'Password is required and must be at least 6 characters long.';
    }
    return null;
};
exports.validateRegistrationPayload = validateRegistrationPayload;
const validateLoginPayload = (body) => {
    if (!body.email || !(0, exports.isValidEmail)(body.email)) {
        return 'A valid email is required.';
    }
    if (!body.password || typeof body.password !== 'string') {
        return 'Password is required.';
    }
    return null;
};
exports.validateLoginPayload = validateLoginPayload;
