import { Router, Response } from 'express';
import { localDb } from '../db';
import { AuthRequest, requireAuth } from '../authMiddleware';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const userId = req.user!.id;
  const notifs = store.notifications.filter((n) => n.userId === userId);

  // Sort by date descending
  notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(notifs);
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const notif = store.notifications.find(
    (n) => (n._id || n.id) === req.params.id && n.userId === req.user!.id
  );

  if (notif) {
    notif.isRead = true;
    localDb.save();
  }

  res.json({ success: true });
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const userId = req.user!.id;

  store.notifications.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });

  localDb.save();
  res.json({ success: true });
});

export default router;
