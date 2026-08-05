"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantContextMiddleware = void 0;
const tenantContextMiddleware = (req, res, next) => {
    if (!req.user || !req.user.tenantId) {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context missing or unauthorized.' } });
        return;
    }
    req.tenantId = req.user.tenantId;
    next();
};
exports.tenantContextMiddleware = tenantContextMiddleware;
