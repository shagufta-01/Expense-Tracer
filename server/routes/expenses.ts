import { Router, Response } from 'express';
import { localDb, SEED_CATEGORIES } from '../db';
import { AuthRequest, requireAuth, requireOwner } from '../authMiddleware';
import { BalanceService } from '../balanceService';

const router = Router();

// Helper: Calculate splits in integer halalas
function calculateSplits(
  amountHalalas: number,
  splitType: 'equal' | 'custom' | 'percentage' | 'company',
  rawSplits: any[],
  ownerUserId: string
): any[] {
  if (splitType === 'company') {
    return [
      {
        userId: ownerUserId,
        shareHalalas: amountHalalas,
        shareAmount: BalanceService.halalasToSar(amountHalalas),
        percentage: 100,
      },
    ];
  }

  if (splitType === 'equal') {
    const memberIds: string[] = rawSplits.map((s) => (typeof s === 'string' ? s : s.userId));
    if (!memberIds.length) {
      throw new Error('At least one member is required for split.');
    }
    const count = memberIds.length;
    const baseHalalas = Math.floor(amountHalalas / count);
    let remainder = amountHalalas % count;

    return memberIds.map((userId) => {
      const share = baseHalalas + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      return {
        userId,
        shareHalalas: share,
        shareAmount: BalanceService.halalasToSar(share),
        percentage: Number(((share / amountHalalas) * 100).toFixed(1)),
      };
    });
  }

  if (splitType === 'custom') {
    let sumHalalas = 0;
    const splits = rawSplits.map((s) => {
      const shareHalalas = BalanceService.sarToHalalas(Number(s.shareAmount || 0));
      sumHalalas += shareHalalas;
      return {
        userId: s.userId,
        shareHalalas,
        shareAmount: BalanceService.halalasToSar(shareHalalas),
        percentage: amountHalalas > 0 ? Number(((shareHalalas / amountHalalas) * 100).toFixed(1)) : 0,
      };
    });

    if (Math.abs(sumHalalas - amountHalalas) > 1) {
      throw new Error(`Split shares total (${BalanceService.halalasToSar(sumHalalas)} SAR) does not match expense amount (${BalanceService.halalasToSar(amountHalalas)} SAR).`);
    }
    return splits;
  }

  if (splitType === 'percentage') {
    let allocatedHalalas = 0;
    const splits = rawSplits.map((s, idx) => {
      const pct = Number(s.percentage || 0);
      let share = Math.round((amountHalalas * pct) / 100);
      if (idx === rawSplits.length - 1) {
        share = amountHalalas - allocatedHalalas; // adjust rounding delta
      } else {
        allocatedHalalas += share;
      }
      return {
        userId: s.userId,
        shareHalalas: share,
        shareAmount: BalanceService.halalasToSar(share),
        percentage: pct,
      };
    });
    return splits;
  }

  return [];
}

// GET /api/expenses
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const { status, categoryId, paidBy, jobId, groupId, search, startDate, endDate } = req.query;

  let expenses = [...store.expenses];

  // Role privacy: Staff cannot see other people's Salary Advance
  if (req.user!.role === 'staff') {
    expenses = expenses.filter((e) => {
      if (e.categoryId === SEED_CATEGORIES.SALARY_ADVANCE) {
        return e.paidBy === req.user!.id || e.createdBy === req.user!.id;
      }
      return true;
    });
  }

  // Filters
  if (status && status !== 'all') {
    expenses = expenses.filter((e) => e.status === status);
  }
  if (categoryId && categoryId !== 'all') {
    expenses = expenses.filter((e) => e.categoryId === categoryId);
  }
  if (paidBy && paidBy !== 'all') {
    expenses = expenses.filter((e) => e.paidBy === paidBy);
  }
  if (jobId && jobId !== 'all') {
    expenses = expenses.filter((e) => e.jobId === jobId);
  }
  if (groupId && groupId !== 'all') {
    expenses = expenses.filter((e) => e.groupId === groupId);
  }
  if (startDate) {
    expenses = expenses.filter((e) => e.date >= String(startDate));
  }
  if (endDate) {
    expenses = expenses.filter((e) => e.date <= String(endDate));
  }
  if (search) {
    const q = String(search).toLowerCase();
    expenses = expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        String(e.amount).includes(q)
    );
  }

  // Populate helper info for frontend
  const usersMap = new Map(store.users.map((u) => [u._id || u.id, u]));
  const catMap = new Map(store.categories.map((c) => [c._id || c.id, c]));
  const jobMap = new Map(store.jobs.map((j) => [j._id || j.id, j]));
  const groupMap = new Map(store.groups.map((g) => [g._id || g.id, g]));

  const populated = expenses.map((e) => {
    const payer = usersMap.get(e.paidBy);
    const category = catMap.get(e.categoryId);
    const job = e.jobId ? jobMap.get(e.jobId) : null;
    const group = groupMap.get(e.groupId);
    const approver = e.approvedBy ? usersMap.get(e.approvedBy) : null;

    return {
      ...e,
      id: e._id || e.id,
      paidByName: payer ? payer.name : 'Unknown',
      paidByAvatar: payer?.avatar,
      categoryName: category ? category.name : 'Unknown',
      categoryIcon: category?.icon || 'Package',
      categoryColor: category?.color || '#64748B',
      jobName: job ? `${job.customerName} (${job.applianceType})` : null,
      jobLocation: job?.location,
      groupName: group ? group.name : 'General',
      approvedByName: approver ? approver.name : null,
      splits: (e.splits || []).map((s: any) => {
        const u = usersMap.get(s.userId);
        return {
          ...s,
          userName: u ? u.name : 'Unknown',
          userAvatar: u?.avatar,
        };
      }),
    };
  });

  // Sort descending by date
  populated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(populated);
});

// POST /api/expenses
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      amount,
      date,
      description,
      categoryId,
      paidBy,
      groupId,
      jobId,
      splitType = 'company',
      splits = [],
      receiptUrl = '',
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount in SAR.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required.' });
    }

    const store = localDb.getStore();
    const ownerUser = store.users.find((u) => u.role === 'owner') || store.users[0];
    const ownerId = ownerUser._id || ownerUser.id;

    const amountHalalas = BalanceService.sarToHalalas(Number(amount));
    const normalizedSplits = calculateSplits(amountHalalas, splitType, splits, ownerId);

    // Initial status: Owner expenses are automatically approved, Staff are pending
    const isOwner = req.user!.role === 'owner';
    const status = isOwner ? 'approved' : 'pending';

    const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newExpense = {
      _id: expenseId,
      id: expenseId,
      amount: Number(amount),
      amountHalalas,
      currency: 'SAR',
      date: date || new Date().toISOString().split('T')[0],
      description: description.trim(),
      categoryId,
      paidBy: paidBy || req.user!.id,
      groupId: groupId || store.groups[0]?._id || 'general',
      jobId: jobId || null,
      splitType,
      splits: normalizedSplits,
      receiptUrl: receiptUrl || '',
      status,
      approvedBy: isOwner ? req.user!.id : null,
      reviewComment: isOwner ? 'Auto-approved (Owner Entry)' : null,
      createdBy: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.expenses.unshift(newExpense);

    // Audit log
    store.auditLogs.unshift({
      _id: `log_${Date.now()}`,
      id: `log_${Date.now()}`,
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'create',
      entity: 'expense',
      entityId: expenseId,
      before: null,
      after: {
        description: newExpense.description,
        amount: newExpense.amount,
        status: newExpense.status,
      },
      timestamp: new Date(),
    });

    // Notify owner if created by staff
    if (!isOwner) {
      store.notifications.unshift({
        _id: `notif_${Date.now()}`,
        id: `notif_${Date.now()}`,
        userId: ownerId,
        type: 'expense_added',
        message: `${req.user!.name} added expense: "${newExpense.description}" (${newExpense.amount.toFixed(2)} SAR) for approval.`,
        data: { expenseId },
        isRead: false,
        createdAt: new Date(),
      });
    }

    localDb.save();
    res.status(201).json(newExpense);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create expense.' });
  }
});

// POST /api/expenses/:id/approve (Owner only)
router.post('/:id/approve', requireOwner, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const expense = store.expenses.find((e) => (e._id || e.id) === req.params.id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const { reviewComment } = req.body;
  const beforeState = { status: expense.status, reviewComment: expense.reviewComment };

  expense.status = 'approved';
  expense.approvedBy = req.user!.id;
  expense.reviewComment = reviewComment ? reviewComment.trim() : 'Approved by Managing Director';
  expense.updatedAt = new Date();

  // Audit log
  store.auditLogs.unshift({
    _id: `log_${Date.now()}`,
    id: `log_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'approve',
    entity: 'expense',
    entityId: expense._id || expense.id,
    before: beforeState,
    after: { status: 'approved', reviewComment: expense.reviewComment },
    timestamp: new Date(),
  });

  // Notify creator
  if (expense.createdBy !== req.user!.id) {
    store.notifications.unshift({
      _id: `notif_${Date.now()}`,
      id: `notif_${Date.now()}`,
      userId: expense.createdBy,
      type: 'expense_approved',
      message: `Your expense "${expense.description}" (${expense.amount.toFixed(2)} SAR) has been approved by ${req.user!.name}.`,
      data: { expenseId: expense._id || expense.id },
      isRead: false,
      createdAt: new Date(),
    });
  }

  localDb.save();
  res.json({ message: 'Expense approved successfully', expense });
});

// POST /api/expenses/:id/reject (Owner only)
router.post('/:id/reject', requireOwner, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const expense = store.expenses.find((e) => (e._id || e.id) === req.params.id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const { reviewComment } = req.body;
  const beforeState = { status: expense.status };

  expense.status = 'rejected';
  expense.approvedBy = req.user!.id;
  expense.reviewComment = reviewComment ? reviewComment.trim() : 'Rejected by Owner';
  expense.updatedAt = new Date();

  // Audit log
  store.auditLogs.unshift({
    _id: `log_${Date.now()}`,
    id: `log_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'reject',
    entity: 'expense',
    entityId: expense._id || expense.id,
    before: beforeState,
    after: { status: 'rejected', reviewComment: expense.reviewComment },
    timestamp: new Date(),
  });

  // Notify creator
  if (expense.createdBy !== req.user!.id) {
    store.notifications.unshift({
      _id: `notif_${Date.now()}`,
      id: `notif_${Date.now()}`,
      userId: expense.createdBy,
      type: 'expense_rejected',
      message: `Your expense "${expense.description}" (${expense.amount.toFixed(2)} SAR) was rejected: ${expense.reviewComment}`,
      data: { expenseId: expense._id || expense.id },
      isRead: false,
      createdAt: new Date(),
    });
  }

  localDb.save();
  res.json({ message: 'Expense rejected', expense });
});

// DELETE /api/expenses/:id
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const index = store.expenses.findIndex((e) => (e._id || e.id) === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const expense = store.expenses[index];

  // Authorization: Owner can delete any; Staff can only delete their own if still pending
  if (req.user!.role !== 'owner') {
    if (expense.createdBy !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own expenses.' });
    }
    if (expense.status !== 'pending') {
      return res.status(400).json({ error: 'Approved or rejected expenses cannot be deleted by staff.' });
    }
  }

  const deletedExpense = store.expenses.splice(index, 1)[0];

  // Audit log
  store.auditLogs.unshift({
    _id: `log_${Date.now()}`,
    id: `log_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'delete',
    entity: 'expense',
    entityId: req.params.id,
    before: { description: deletedExpense.description, amount: deletedExpense.amount },
    after: null,
    timestamp: new Date(),
  });

  localDb.save();
  res.json({ message: 'Expense deleted successfully' });
});

export default router;
