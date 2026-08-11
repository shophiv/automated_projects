import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const result = await pool.query(
      'SELECT id, type, message, read_status, created_at FROM notifications WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.tenantId]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    await pool.query('UPDATE notifications SET read_status = true WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenantId]);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;