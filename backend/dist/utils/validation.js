"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequiredFields = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validateRequiredFields = (fields, data) => {
    const missingFields = [];
    for (const field of fields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missingFields.push(field);
        }
    }
    return missingFields;
};
exports.validateRequiredFields = validateRequiredFields;
