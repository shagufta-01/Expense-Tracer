import { Router, Response } from 'express';
import { localDb } from '../db';
import { AuthRequest, requireAuth } from '../authMiddleware';
import { BalanceService } from '../balanceService';

const router = Router();

// GET /api/jobs
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const usersMap = new Map(store.users.map((u) => [u._id || u.id, u]));

  const jobsWithStats = store.jobs.map((j) => {
    const jid = j._id || j.id;
    const linkedExpenses = store.expenses.filter((e) => e.jobId === jid && e.status === 'approved');

    let totalJobCostHalalas = 0;
    const categoryTotals: { [name: string]: number } = {};

    linkedExpenses.forEach((e) => {
      const halalas = e.amountHalalas || BalanceService.sarToHalalas(e.amount);
      totalJobCostHalalas += halalas;

      const cat = store.categories.find((c) => (c._id || c.id) === e.categoryId);
      const catName = cat ? cat.name : 'Other';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + e.amount;
    });

    const assignedStaff = (j.assignedTo || []).map((uid: string) => {
      const u = usersMap.get(uid);
      return {
        id: uid,
        name: u ? u.name : 'Unknown',
        avatar: u?.avatar,
      };
    });

    return {
      ...j,
      id: jid,
      totalCostSAR: BalanceService.halalasToSar(totalJobCostHalalas),
      expenseCount: linkedExpenses.length,
      categoryTotals,
      assignedStaff,
    };
  });

  res.json(jobsWithStats);
});

// POST /api/jobs
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { customerName, phone, applianceType, brand, location = 'Makkah', notes = '', assignedTo = [] } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer name is required.' });
  }
  if (!applianceType) {
    return res.status(400).json({ error: 'Appliance type is required.' });
  }

  const store = localDb.getStore();
  const jobId = `job_${Date.now()}`;
  const newJob = {
    _id: jobId,
    id: jobId,
    customerName: customerName.trim(),
    phone: phone ? phone.trim() : '',
    applianceType,
    brand: brand ? brand.trim() : '',
    location: location.trim(),
    status: 'active',
    assignedTo: Array.isArray(assignedTo) ? assignedTo : [req.user!.id],
    notes: notes.trim(),
    createdAt: new Date(),
  };

  store.jobs.unshift(newJob);

  // Audit log
  store.auditLogs.unshift({
    _id: `log_${Date.now()}`,
    id: `log_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'create',
    entity: 'job',
    entityId: jobId,
    before: null,
    after: newJob,
    timestamp: new Date(),
  });

  localDb.save();
  res.status(201).json(newJob);
});

// PUT /api/jobs/:id
router.put('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const job = store.jobs.find((j) => (j._id || j.id) === req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const { customerName, phone, applianceType, brand, location, status, notes, assignedTo } = req.body;
  if (customerName) job.customerName = customerName.trim();
  if (phone !== undefined) job.phone = phone.trim();
  if (applianceType) job.applianceType = applianceType;
  if (brand !== undefined) job.brand = brand.trim();
  if (location !== undefined) job.location = location.trim();
  if (status && ['active', 'completed', 'cancelled'].includes(status)) job.status = status;
  if (notes !== undefined) job.notes = notes.trim();
  if (assignedTo && Array.isArray(assignedTo)) job.assignedTo = assignedTo;

  localDb.save();
  res.json(job);
});

export default router;
