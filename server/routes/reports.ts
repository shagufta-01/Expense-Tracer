import { Router, Response } from 'express';
import { localDb, SEED_CATEGORIES } from '../db';
import { AuthRequest, requireAuth } from '../authMiddleware';
import { BalanceService } from '../balanceService';

const router = Router();

// GET /api/reports/analytics
router.get('/analytics', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const isOwner = req.user!.role === 'owner';

  // Base approved expenses
  let approvedExpenses = store.expenses.filter((e) => e.status === 'approved');

  if (!isOwner) {
    // Filter out other users' salary advance
    approvedExpenses = approvedExpenses.filter((e) => {
      if (e.categoryId === SEED_CATEGORIES.SALARY_ADVANCE) {
        return e.paidBy === req.user!.id;
      }
      return true;
    });
  }

  const usersMap = new Map(store.users.map((u) => [u._id || u.id, u]));
  const catMap = new Map(store.categories.map((c) => [c._id || c.id, c]));

  // Total Halalas
  let totalSpendHalalas = 0;
  const categoryHalalasMap: { [catId: string]: number } = {};
  const userSpendHalalasMap: { [userId: string]: number } = {};
  const monthlyMap: { [monthKey: string]: number } = {};

  approvedExpenses.forEach((e) => {
    const halalas = e.amountHalalas || BalanceService.sarToHalalas(e.amount);
    totalSpendHalalas += halalas;

    // Category
    categoryHalalasMap[e.categoryId] = (categoryHalalasMap[e.categoryId] || 0) + halalas;

    // User
    userSpendHalalasMap[e.paidBy] = (userSpendHalalasMap[e.paidBy] || 0) + halalas;

    // Month (YYYY-MM)
    const month = (e.date || '').slice(0, 7) || '2026-03';
    monthlyMap[month] = (monthlyMap[month] || 0) + halalas;
  });

  const totalSpendSAR = BalanceService.halalasToSar(totalSpendHalalas);

  // Category breakdown list
  const categoryBreakdown = Object.entries(categoryHalalasMap).map(([catId, halalas]) => {
    const cat = catMap.get(catId);
    const amountSAR = BalanceService.halalasToSar(halalas);
    const percentage = totalSpendHalalas > 0 ? Number(((halalas / totalSpendHalalas) * 100).toFixed(1)) : 0;
    return {
      categoryId: catId,
      name: cat ? cat.name : 'Other',
      icon: cat?.icon || 'Package',
      color: cat?.color || '#0284C7',
      amountSAR,
      percentage,
    };
  });
  categoryBreakdown.sort((a, b) => b.amountSAR - a.amountSAR);

  // User breakdown list
  const personBreakdown = Object.entries(userSpendHalalasMap).map(([userId, halalas]) => {
    const u = usersMap.get(userId);
    const amountSAR = BalanceService.halalasToSar(halalas);
    const percentage = totalSpendHalalas > 0 ? Number(((halalas / totalSpendHalalas) * 100).toFixed(1)) : 0;
    return {
      userId,
      name: u ? u.name : 'Unknown',
      role: u?.role || 'staff',
      avatar: u?.avatar,
      amountSAR,
      percentage,
    };
  });
  personBreakdown.sort((a, b) => b.amountSAR - a.amountSAR);

  // Monthly trend
  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, halalas]) => ({
      month,
      amountSAR: BalanceService.halalasToSar(halalas),
    }));

  // Jobs cost summary
  const jobCosts = store.jobs.map((j) => {
    const jid = j._id || j.id;
    const exps = approvedExpenses.filter((e) => e.jobId === jid);
    const jobHalalas = exps.reduce((sum, e) => sum + (e.amountHalalas || BalanceService.sarToHalalas(e.amount)), 0);
    return {
      jobId: jid,
      customerName: j.customerName,
      applianceType: j.applianceType,
      brand: j.brand,
      location: j.location,
      status: j.status,
      costSAR: BalanceService.halalasToSar(jobHalalas),
      expenseCount: exps.length,
    };
  });
  jobCosts.sort((a, b) => b.costSAR - a.costSAR);

  // Pending approvals
  const pendingApprovalsCount = store.expenses.filter((e) => e.status === 'pending').length;

  res.json({
    totalSpendSAR,
    approvedExpenseCount: approvedExpenses.length,
    pendingApprovalsCount,
    categoryBreakdown,
    personBreakdown,
    monthlyTrend,
    jobCosts,
    isOwner,
  });
});

export default router;
