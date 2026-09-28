import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'staff';
  phone: string;
  language: 'en' | 'hi' | 'ur' | 'ar';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
  phone: { type: String, default: '' },
  language: { type: String, enum: ['en', 'hi', 'ur', 'ar'], default: 'en' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Group Schema
export interface IGroup extends Document {
  name: string;
  members: string[];
  description: string;
  createdBy: string;
  createdAt: Date;
}

export const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  description: { type: String, default: '' },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Category Schema
export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  icon: { type: String, default: 'Wrench' },
  color: { type: String, default: '#0284C7' },
  isActive: { type: Boolean, default: true },
});

// Job Schema
export interface IJob extends Document {
  customerName: string;
  phone: string;
  applianceType: string;
  brand: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  assignedTo: string[];
  notes?: string;
  createdAt: Date;
}

export const JobSchema = new Schema<IJob>({
  customerName: { type: String, required: true },
  phone: { type: String, default: '' },
  applianceType: { type: String, required: true },
  brand: { type: String, default: '' },
  location: { type: String, default: 'Makkah' },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  assignedTo: [{ type: String }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Expense Split item
export interface IExpenseSplit {
  userId: string;
  shareHalalas: number; // Integer (1 SAR = 100 Halalas)
  shareAmount: number; // Float in SAR for display
  percentage?: number;
}

// Expense Schema
export interface IExpense extends Document {
  amount: number; // SAR float e.g. 150.50
  amountHalalas: number; // Integer e.g. 15050
  currency: string;
  date: string; // YYYY-MM-DD
  description: string;
  categoryId: string;
  paidBy: string;
  groupId: string;
  jobId: string | null;
  splitType: 'equal' | 'custom' | 'percentage' | 'company';
  splits: IExpenseSplit[];
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  reviewComment: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ExpenseSchema = new Schema<IExpense>({
  amount: { type: Number, required: true },
  amountHalalas: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  date: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: { type: String, required: true },
  paidBy: { type: String, required: true, ref: 'User' },
  groupId: { type: String, required: true, ref: 'Group' },
  jobId: { type: String, default: null, ref: 'Job' },
  splitType: {
    type: String,
    enum: ['equal', 'custom', 'percentage', 'company'],
    default: 'company',
  },
  splits: [
    {
      userId: { type: String, required: true },
      shareHalalas: { type: Number, required: true },
      shareAmount: { type: Number, required: true },
      percentage: { type: Number },
    },
  ],
  receiptUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: { type: String, default: null },
  reviewComment: { type: String, default: null },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes as requested:
ExpenseSchema.index({ groupId: 1, date: -1 });
ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ status: 1 });

// Settlement Schema
export interface ISettlement extends Document {
  fromUser: string;
  toUser: string;
  amount: number;
  amountHalalas: number;
  method: 'cash' | 'bank_transfer' | 'stc_pay' | 'urpay' | 'other';
  note: string;
  date: string;
  createdBy: string;
  createdAt: Date;
}

export const SettlementSchema = new Schema<ISettlement>({
  fromUser: { type: String, required: true, ref: 'User' },
  toUser: { type: String, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  amountHalalas: { type: Number, required: true },
  method: {
    type: String,
    enum: ['cash', 'bank_transfer', 'stc_pay', 'urpay', 'other'],
    default: 'cash',
  },
  note: { type: String, default: '' },
  date: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Indexes as requested:
SettlementSchema.index({ fromUser: 1, toUser: 1 });

// Notification Schema
export interface INotification extends Document {
  userId: string;
  type: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// AuditLog Schema
export interface IAuditLog extends Document {
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  before: any;
  after: any;
  timestamp: Date;
}

export const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  before: { type: Schema.Types.Mixed, default: null },
  after: { type: Schema.Types.Mixed, default: null },
  timestamp: { type: Date, default: Date.now, index: true },
});

// Model instantiations
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const GroupModel = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const JobModel = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export const SettlementModel = mongoose.models.Settlement || mongoose.model<ISettlement>('Settlement', SettlementSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
