import { Router, Response } from 'express';
import { localDb } from '../db';
import { AuthRequest, requireAuth } from '../authMiddleware';
import { BalanceService } from '../balanceService';

const router = Router();

// GET /api/settlements
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const usersMap = new Map(store.users.map((u) => [u._id || u.id, u]));

  const settlements = store.settlements.map((s) => {
    const from = usersMap.get(s.fromUser);
    const to = usersMap.get(s.toUser);
    return {
      ...s,
      id: s._id || s.id,
      fromUserName: from ? from.name : 'Unknown',
      fromUserAvatar: from?.avatar,
      toUserName: to ? to.name : 'Unknown',
      toUserAvatar: to?.avatar,
    };
  });

  // Sort by date descending
  settlements.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

  res.json(settlements);
});

// POST /api/settlements
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { fromUser, toUser, amount, method = 'cash', note = '', date } = req.body;

  if (!fromUser || !toUser) {
    return res.status(400).json({ error: 'Both sender and receiver are required.' });
  }
  if (fromUser === toUser) {
    return res.status(400).json({ error: 'Sender and receiver cannot be the same person.' });
  }
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Please enter a valid settlement amount.' });
  }

  const store = localDb.getStore();
  const from = store.users.find((u) => (u._id || u.id) === fromUser);
  const to = store.users.find((u) => (u._id || u.id) === toUser);

  if (!from || !to) {
    return res.status(404).json({ error: 'User not found in system.' });
  }

  const amountHalalas = BalanceService.sarToHalalas(Number(amount));
  const settlementId = `stl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newSettlement = {
    _id: settlementId,
    id: settlementId,
    fromUser,
    toUser,
    amount: Number(amount),
    amountHalalas,
    method,
    note: note ? note.trim() : '',
    date: date || new Date().toISOString().split('T')[0],
    createdBy: req.user!.id,
    createdAt: new Date(),
  };

  store.settlements.unshift(newSettlement);

  // Audit log
  store.auditLogs.unshift({
    _id: `log_${Date.now()}`,
    id: `log_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'settle',
    entity: 'settlement',
    entityId: settlementId,
    before: null,
    after: {
      fromUser: from.name,
      toUser: to.name,
      amount: newSettlement.amount,
      method: newSettlement.method,
    },
    timestamp: new Date(),
  });

  // Notify recipient
  store.notifications.unshift({
    _id: `notif_${Date.now()}`,
    id: `notif_${Date.now()}`,
    userId: toUser,
    type: 'settlement_received',
    message: `${from.name} recorded a payment of ${Number(amount).toFixed(2)} SAR to you via ${method.replace('_', ' ').toUpperCase()}.`,
    data: { settlementId },
    isRead: false,
    createdAt: new Date(),
  });

  localDb.save();

  res.status(201).json({
    ...newSettlement,
    fromUserName: from.name,
    toUserName: to.name,
  });
});

export default router;
