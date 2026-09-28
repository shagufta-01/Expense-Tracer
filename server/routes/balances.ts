import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../authMiddleware';
import { BalanceService } from '../balanceService';

const router = Router();

// GET /api/balances
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const result = BalanceService.calculateAllBalances();
  const currentUserId = req.user!.id;
  const myBalance = result.userSummaries.find((u) => u.userId === currentUserId) || null;

  res.json({
    ...result,
    myBalance,
  });
});

export default router;
