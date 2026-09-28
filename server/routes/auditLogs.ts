import { Router, Response } from 'express';
import { localDb } from '../db';
import { AuthRequest, requireOwner } from '../authMiddleware';

const router = Router();

// GET /api/audit-logs (Owner only)
router.get('/', requireOwner, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const logs = [...store.auditLogs];

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(logs);
});

export default router;
