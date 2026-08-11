"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
            return;
        }
        const result = await database_1.pool.query('SELECT id, type, message, read_status, created_at FROM notifications WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user.tenantId]);
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
});
router.put('/:id/read', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
            return;
        }
        await database_1.pool.query('UPDATE notifications SET read_status = true WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenantId]);
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
});
exports.default = router;
