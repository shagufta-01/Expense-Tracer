import { localDb } from './db';

export interface UserBalanceSummary {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  avatar?: string;
  totalPaidHalalas: number;
  totalPaidSAR: number;
  totalShareHalalas: number;
  totalShareSAR: number;
  settlementsPaidHalalas: number;
  settlementsPaidSAR: number;
  settlementsReceivedHalalas: number;
  settlementsReceivedSAR: number;
  netHalalas: number;
  netSAR: number; // positive = owed money, negative = owes money
  status: 'owed' | 'owes' | 'settled';
}

export interface SimplifiedSettlementPlan {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amountHalalas: number;
  amountSAR: number;
}

export interface PairwiseDebt {
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  amountHalalas: number;
  amountSAR: number;
}

export class BalanceService {
  public static sarToHalalas(sar: number): number {
    return Math.round(Number(sar || 0) * 100);
  }

  public static halalasToSar(halalas: number): number {
    return Number((Number(halalas || 0) / 100).toFixed(2));
  }

  public static calculateAllBalances(): {
    userSummaries: UserBalanceSummary[];
    pairwiseDebts: PairwiseDebt[];
    simplifiedSettlements: SimplifiedSettlementPlan[];
    totalApprovedExpensesSAR: number;
    totalSettledSAR: number;
  } {
    const store = localDb.getStore();
    const users = store.users.filter((u) => u.isActive !== false);
    const approvedExpenses = store.expenses.filter((e) => e.status === 'approved');
    const settlements = store.settlements;

    const userMap = new Map<string, any>();
    users.forEach((u) => userMap.set(u._id || u.id, u));

    // Initialize ledger per user in integer halalas
    const ledger = new Map<
      string,
      {
        totalPaid: number;
        totalShare: number;
        settlementsPaid: number;
        settlementsReceived: number;
      }
    >();

    users.forEach((u) => {
      const uid = u._id || u.id;
      ledger.set(uid, {
        totalPaid: 0,
        totalShare: 0,
        settlementsPaid: 0,
        settlementsReceived: 0,
      });
    });

    // Pairwise directed debt tracking: pairDebts[debtorId][creditorId] = halalas
    const pairDebts: { [debtorId: string]: { [creditorId: string]: number } } = {};
    users.forEach((u1) => {
      const id1 = u1._id || u1.id;
      pairDebts[id1] = {};
      users.forEach((u2) => {
        const id2 = u2._id || u2.id;
        pairDebts[id1][id2] = 0;
      });
    });

    let totalApprovedHalalas = 0;
    // Process Approved Expenses
    approvedExpenses.forEach((exp) => {
      const payerId = exp.paidBy;
      const totalAmountHalalas = exp.amountHalalas || BalanceService.sarToHalalas(exp.amount);
      totalApprovedHalalas += totalAmountHalalas;

      if (!ledger.has(payerId)) {
        ledger.set(payerId, { totalPaid: 0, totalShare: 0, settlementsPaid: 0, settlementsReceived: 0 });
      }
      ledger.get(payerId)!.totalPaid += totalAmountHalalas;

      // Process splits
      (exp.splits || []).forEach((split: any) => {
        const memberId = split.userId;
        const shareHalalas = split.shareHalalas || BalanceService.sarToHalalas(split.shareAmount);

        if (!ledger.has(memberId)) {
          ledger.set(memberId, { totalPaid: 0, totalShare: 0, settlementsPaid: 0, settlementsReceived: 0 });
        }
        ledger.get(memberId)!.totalShare += shareHalalas;

        // If someone else paid for this member, member owes payer
        if (memberId !== payerId) {
          if (!pairDebts[memberId]) pairDebts[memberId] = {};
          pairDebts[memberId][payerId] = (pairDebts[memberId][payerId] || 0) + shareHalalas;
        }
      });
    });

    let totalSettledHalalas = 0;
    // Process Settlements
    settlements.forEach((stl: any) => {
      const fromId = stl.fromUser;
      const toId = stl.toUser;
      const amountHalalas = stl.amountHalalas || BalanceService.sarToHalalas(stl.amount);
      totalSettledHalalas += amountHalalas;

      if (ledger.has(fromId)) {
        ledger.get(fromId)!.settlementsPaid += amountHalalas;
      }
      if (ledger.has(toId)) {
        ledger.get(toId)!.settlementsReceived += amountHalalas;
      }

      // Paying a settlement reduces the fromId debt to toId
      if (!pairDebts[fromId]) pairDebts[fromId] = {};
      pairDebts[fromId][toId] = (pairDebts[fromId][toId] || 0) - amountHalalas;
    });

    // Compile User Balance Summaries
    const userSummaries: UserBalanceSummary[] = [];

    users.forEach((u) => {
      const uid = u._id || u.id;
      const l = ledger.get(uid) || {
        totalPaid: 0,
        totalShare: 0,
        settlementsPaid: 0,
        settlementsReceived: 0,
      };

      // Net = (Paid - Share) + (SettlementsPaid - SettlementsReceived)
      const netHalalas = (l.totalPaid - l.totalShare) + (l.settlementsPaid - l.settlementsReceived);
      const netSAR = BalanceService.halalasToSar(netHalalas);

      let status: 'owed' | 'owes' | 'settled' = 'settled';
      if (netHalalas > 0) status = 'owed';
      else if (netHalalas < 0) status = 'owes';

      userSummaries.push({
        userId: uid,
        userName: u.name,
        userEmail: u.email,
        userRole: u.role,
        avatar: u.avatar,
        totalPaidHalalas: l.totalPaid,
        totalPaidSAR: BalanceService.halalasToSar(l.totalPaid),
        totalShareHalalas: l.totalShare,
        totalShareSAR: BalanceService.halalasToSar(l.totalShare),
        settlementsPaidHalalas: l.settlementsPaid,
        settlementsPaidSAR: BalanceService.halalasToSar(l.settlementsPaid),
        settlementsReceivedHalalas: l.settlementsReceived,
        settlementsReceivedSAR: BalanceService.halalasToSar(l.settlementsReceived),
        netHalalas,
        netSAR,
        status,
      });
    });

    // Compute pairwise netted debts
    const pairwiseDebts: PairwiseDebt[] = [];
    const processedPairs = new Set<string>();

    users.forEach((u1) => {
      const id1 = u1._id || u1.id;
      users.forEach((u2) => {
        const id2 = u2._id || u2.id;
        if (id1 >= id2) return;

        const pairKey = `${id1}_${id2}`;
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        const d1to2 = (pairDebts[id1] && pairDebts[id1][id2]) || 0;
        const d2to1 = (pairDebts[id2] && pairDebts[id2][id1]) || 0;
        const diff = d1to2 - d2to1;

        if (diff > 0) {
          // id1 owes id2 diff
          pairwiseDebts.push({
            debtorId: id1,
            debtorName: u1.name,
            creditorId: id2,
            creditorName: u2.name,
            amountHalalas: diff,
            amountSAR: BalanceService.halalasToSar(diff),
          });
        } else if (diff < 0) {
          // id2 owes id1 -diff
          pairwiseDebts.push({
            debtorId: id2,
            debtorName: u2.name,
            creditorId: id1,
            creditorName: u1.name,
            amountHalalas: -diff,
            amountSAR: BalanceService.halalasToSar(-diff),
          });
        }
      });
    });

    // Simplified Debt Settlement Graph (Minimum number of transactions)
    // Separate into debtors (<0) and creditors (>0)
    type NodeBalance = { userId: string; userName: string; balance: number };
    const debtors: NodeBalance[] = [];
    const creditors: NodeBalance[] = [];

    userSummaries.forEach((u) => {
      if (u.netHalalas < -5) {
        debtors.push({ userId: u.userId, userName: u.userName, balance: u.netHalalas });
      } else if (u.netHalalas > 5) {
        creditors.push({ userId: u.userId, userName: u.userName, balance: u.netHalalas });
      }
    });

    // Sort: greatest debtor first, greatest creditor first
    debtors.sort((a, b) => a.balance - b.balance); // most negative first
    creditors.sort((a, b) => b.balance - a.balance); // most positive first

    const simplifiedSettlements: SimplifiedSettlementPlan[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const debtAmount = -debtor.balance;
      const creditAmount = creditor.balance;
      const settlementAmount = Math.min(debtAmount, creditAmount);

      if (settlementAmount > 0) {
        simplifiedSettlements.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amountHalalas: settlementAmount,
          amountSAR: BalanceService.halalasToSar(settlementAmount),
        });

        debtor.balance += settlementAmount;
        creditor.balance -= settlementAmount;
      }

      if (Math.abs(debtor.balance) < 5) dIdx++;
      if (Math.abs(creditor.balance) < 5) cIdx++;
    }

    return {
      userSummaries,
      pairwiseDebts,
      simplifiedSettlements,
      totalApprovedExpensesSAR: BalanceService.halalasToSar(totalApprovedHalalas),
      totalSettledSAR: BalanceService.halalasToSar(totalSettledHalalas),
    };
  }
}
