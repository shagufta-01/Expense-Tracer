export type UserRole = 'owner' | 'staff';
export type LanguageCode = 'en' | 'hi' | 'ur' | 'ar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  language?: LanguageCode;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface Job {
  id: string;
  customerName: string;
  phone: string;
  applianceType: string;
  brand: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  assignedTo: string[];
  assignedStaff?: { id: string; name: string; avatar?: string }[];
  totalCostSAR?: number;
  expenseCount?: number;
  notes?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  memberList?: { id: string; name: string; role?: string; avatar?: string }[];
  membersCount?: number;
  totalSpendSAR?: number;
  expenseCount?: number;
  createdAt: string;
}

export interface ExpenseSplit {
  userId: string;
  userName?: string;
  userAvatar?: string;
  shareHalalas: number;
  shareAmount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  amount: number;
  amountHalalas: number;
  currency: string;
  date: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  paidBy: string;
  paidByName?: string;
  paidByAvatar?: string;
  groupId: string;
  groupName?: string;
  jobId: string | null;
  jobName?: string | null;
  jobLocation?: string;
  splitType: 'equal' | 'custom' | 'percentage' | 'company';
  splits: ExpenseSplit[];
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  approvedByName?: string | null;
  reviewComment?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  fromUser: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  toUser: string;
  toUserName?: string;
  toUserAvatar?: string;
  amount: number;
  amountHalalas: number;
  method: 'cash' | 'bank_transfer' | 'stc_pay' | 'urpay' | 'other';
  note: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface UserBalance {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
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
  netSAR: number;
  status: 'owed' | 'owes' | 'settled';
}

export interface SimplifiedSettlement {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amountHalalas: number;
  amountSAR: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  before: any;
  after: any;
  timestamp: string;
}
