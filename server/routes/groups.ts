import { Router, Response } from 'express';
import { localDb } from '../db';
import { AuthRequest, requireAuth, requireOwner } from '../authMiddleware';

const router = Router();

// GET /api/groups
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const usersMap = new Map(store.users.map((u) => [u._id || u.id, u]));

  const groups = store.groups.map((g) => {
    const memberObjects = (g.members || []).map((uid: string) => {
      const u = usersMap.get(uid);
      return {
        id: uid,
        name: u ? u.name : 'Unknown',
        role: u?.role,
        avatar: u?.avatar,
      };
    });

    const expensesForGroup = store.expenses.filter(
      (e) => e.groupId === (g._id || g.id) && e.status === 'approved'
    );
    const totalSpend = expensesForGroup.reduce((sum, e) => sum + e.amount, 0);

    return {
      ...g,
      id: g._id || g.id,
      membersCount: g.members?.length || 0,
      memberList: memberObjects,
      totalSpendSAR: Number(totalSpend.toFixed(2)),
      expenseCount: expensesForGroup.length,
    };
  });

  res.json(groups);
});

// POST /api/groups (Owner only)
router.post('/', requireOwner, (req: AuthRequest, res: Response) => {
  const { name, description = '', members = [] } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Team name is required.' });
  }

  const store = localDb.getStore();
  const groupId = `group_${Date.now()}`;
  const newGroup = {
    _id: groupId,
    id: groupId,
    name: name.trim(),
    description: description.trim(),
    members: members.length > 0 ? members : store.users.map((u) => u._id || u.id),
    createdBy: req.user!.id,
    createdAt: new Date(),
  };

  store.groups.push(newGroup);
  localDb.save();
  res.status(201).json(newGroup);
});

export default router;
