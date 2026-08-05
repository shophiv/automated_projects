"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTenant = void 0;
const resolveTenant = (req, res, next) => {
    if (req.user) {
        req.tenantId = req.user.tenantId;
        if (req.user.role !== 'admin' && !req.tenantId) {
            res.status(403).json({ error: 'Tenant context could not be resolved' });
            return;
        }
    }
    next();
};
exports.resolveTenant = resolveTenant;
