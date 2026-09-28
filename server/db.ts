import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Seed IDs for reliable references
export const SEED_USERS = {
  OWNER: 'user_imtiyaz_alam',
  STAFF_TARIQ: 'user_tariq_khan',
  STAFF_BILAL: 'user_bilal_ahmed',
  STAFF_SALMAN: 'user_salman_farooq',
};

export const SEED_GROUPS = {
  AC_TEAM: 'group_ac_team',
  WM_TEAM: 'group_wm_team',
  OFFICE: 'group_office',
};

export const SEED_CATEGORIES = {
  SPARE_PARTS: 'cat_spare_parts',
  GAS_REFRIGERANT: 'cat_gas_refrigerant',
  FUEL: 'cat_fuel',
  TOOLS: 'cat_tools',
  TRANSPORT: 'cat_transport',
  FOOD: 'cat_food',
  SALARY_ADVANCE: 'cat_salary_advance',
  OFFICE: 'cat_office',
  OTHER: 'cat_other',
};

export const SEED_JOBS = {
  JOB_AZIZIYAH: 'job_makkah_aziziyah_ac',
  JOB_JABAL_AL_NOUR: 'job_makkah_jabal_nour_wm',
  JOB_KAKIYYAH: 'job_makkah_kakiyyah_ac',
  JOB_SHAWQIYYAH: 'job_makkah_shawqiyyah_wm',
};

export interface DatabaseStore {
  users: any[];
  groups: any[];
  categories: any[];
  jobs: any[];
  expenses: any[];
  settlements: any[];
  notifications: any[];
  auditLogs: any[];
}

// In-memory or file-backed database storage engine
class LocalDbEngine {
  private data: DatabaseStore = {
    users: [],
    groups: [],
    categories: [],
    jobs: [],
    expenses: [],
    settlements: [],
    notifications: [],
    auditLogs: [],
  };
  private filePath = path.resolve(process.cwd(), 'data', 'db.json');

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (e) {
      console.warn('Local database load error, initializing fresh seed data:', e);
      this.seedInitialData();
    }
  }

  public save() {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving local db:', e);
    }
  }

  public getStore(): DatabaseStore {
    return this.data;
  }

  public seedInitialData() {
    const ownerHash = bcrypt.hashSync('admin123', 10);
    const staffHash = bcrypt.hashSync('staff123', 10);

    this.data.users = [
      {
        _id: SEED_USERS.OWNER,
        id: SEED_USERS.OWNER,
        name: 'Imtiyaz Alam',
        email: 'imtiyaz@madaraltasis.com',
        passwordHash: ownerHash,
        role: 'owner',
        phone: '+966 50 123 4567',
        language: 'ar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: new Date('2026-01-01T08:00:00Z'),
      },
      {
        _id: SEED_USERS.STAFF_TARIQ,
        id: SEED_USERS.STAFF_TARIQ,
        name: 'Tariq Khan',
        email: 'tariq@madaraltasis.com',
        passwordHash: staffHash,
        role: 'staff',
        phone: '+966 55 987 6543',
        language: 'ur',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: new Date('2026-01-10T09:00:00Z'),
      },
      {
        _id: SEED_USERS.STAFF_BILAL,
        id: SEED_USERS.STAFF_BILAL,
        name: 'Bilal Ahmed',
        email: 'bilal@madaraltasis.com',
        passwordHash: staffHash,
        role: 'staff',
        phone: '+966 54 321 0987',
        language: 'hi',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: new Date('2026-01-15T09:00:00Z'),
      },
      {
        _id: SEED_USERS.STAFF_SALMAN,
        id: SEED_USERS.STAFF_SALMAN,
        name: 'Salman Farooq',
        email: 'salman@madaraltasis.com',
        passwordHash: staffHash,
        role: 'staff',
        phone: '+966 56 654 3210',
        language: 'en',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: new Date('2026-01-20T10:00:00Z'),
      },
    ];

    this.data.groups = [
      {
        _id: SEED_GROUPS.AC_TEAM,
        id: SEED_GROUPS.AC_TEAM,
        name: 'AC Service Team',
        description: 'Split AC, Window AC, Duct and Central cooling field jobs across Makkah',
        members: [SEED_USERS.OWNER, SEED_USERS.STAFF_TARIQ, SEED_USERS.STAFF_SALMAN],
        createdBy: SEED_USERS.OWNER,
        createdAt: new Date('2026-01-01T08:00:00Z'),
      },
      {
        _id: SEED_GROUPS.WM_TEAM,
        id: SEED_GROUPS.WM_TEAM,
        name: 'Washing Machine Team',
        description: 'Automatic front-load, top-load, semi-automatic motor & drum repairs',
        members: [SEED_USERS.OWNER, SEED_USERS.STAFF_BILAL, SEED_USERS.STAFF_SALMAN],
        createdBy: SEED_USERS.OWNER,
        createdAt: new Date('2026-01-01T08:00:00Z'),
      },
      {
        _id: SEED_GROUPS.OFFICE,
        id: SEED_GROUPS.OFFICE,
        name: 'Jabal Al-Nour Office / General',
        description: 'Shop utilities, shared tea, rent, office supplies and fuel pool',
        members: [SEED_USERS.OWNER, SEED_USERS.STAFF_TARIQ, SEED_USERS.STAFF_BILAL, SEED_USERS.STAFF_SALMAN],
        createdBy: SEED_USERS.OWNER,
        createdAt: new Date('2026-01-01T08:00:00Z'),
      },
    ];

    this.data.categories = [
      { _id: SEED_CATEGORIES.SPARE_PARTS, id: SEED_CATEGORIES.SPARE_PARTS, name: 'Spare Parts', icon: 'Wrench', color: '#0284C7', isActive: true },
      { _id: SEED_CATEGORIES.GAS_REFRIGERANT, id: SEED_CATEGORIES.GAS_REFRIGERANT, name: 'Gas/Refrigerant', icon: 'Flame', color: '#0EA5E9', isActive: true },
      { _id: SEED_CATEGORIES.FUEL, id: SEED_CATEGORIES.FUEL, name: 'Fuel', icon: 'Fuel', color: '#F59E0B', isActive: true },
      { _id: SEED_CATEGORIES.TOOLS, id: SEED_CATEGORIES.TOOLS, name: 'Tools', icon: 'Hammer', color: '#6366F1', isActive: true },
      { _id: SEED_CATEGORIES.TRANSPORT, id: SEED_CATEGORIES.TRANSPORT, name: 'Transport', icon: 'Truck', color: '#10B981', isActive: true },
      { _id: SEED_CATEGORIES.FOOD, id: SEED_CATEGORIES.FOOD, name: 'Food on Site', icon: 'Utensils', color: '#EC4899', isActive: true },
      { _id: SEED_CATEGORIES.SALARY_ADVANCE, id: SEED_CATEGORIES.SALARY_ADVANCE, name: 'Salary Advance', icon: 'Banknote', color: '#8B5CF6', isActive: true },
      { _id: SEED_CATEGORIES.OFFICE, id: SEED_CATEGORIES.OFFICE, name: 'Office Supplies', icon: 'Building', color: '#64748B', isActive: true },
      { _id: SEED_CATEGORIES.OTHER, id: SEED_CATEGORIES.OTHER, name: 'Other', icon: 'Package', color: '#78716C', isActive: true },
    ];

    this.data.jobs = [
      {
        _id: SEED_JOBS.JOB_AZIZIYAH,
        id: SEED_JOBS.JOB_AZIZIYAH,
        customerName: 'Sheikh Abdullah Al-Harthy',
        phone: '+966 50 777 8899',
        applianceType: 'Air Conditioner',
        brand: 'Gree 2.5 Ton Split',
        location: 'Al-Aziziyah, Makkah',
        status: 'active',
        assignedTo: [SEED_USERS.STAFF_TARIQ, SEED_USERS.STAFF_SALMAN],
        notes: 'Low cooling, R410A gas refill needed and outdoor fan capacitor replaced.',
        createdAt: new Date('2026-03-01T10:00:00Z'),
      },
      {
        _id: SEED_JOBS.JOB_JABAL_AL_NOUR,
        id: SEED_JOBS.JOB_JABAL_AL_NOUR,
        customerName: 'Hotel Al-Manar Building 4',
        phone: '+966 55 444 3322',
        applianceType: 'Washing Machine',
        brand: 'LG Front Load 10kg',
        location: 'Jabal Al-Nour, Makkah',
        status: 'active',
        assignedTo: [SEED_USERS.STAFF_BILAL],
        notes: 'OE drain error, drain pump motor jammed with lint/coins.',
        createdAt: new Date('2026-03-05T14:30:00Z'),
      },
      {
        _id: SEED_JOBS.JOB_KAKIYYAH,
        id: SEED_JOBS.JOB_KAKIYYAH,
        customerName: 'Hajj Villa Abu Fahad',
        phone: '+966 54 888 1234',
        applianceType: 'Air Conditioner',
        brand: 'Daikin Inverter 3 Ton',
        location: 'Al-Kakiyyah, Makkah',
        status: 'completed',
        assignedTo: [SEED_USERS.STAFF_TARIQ],
        notes: 'Indoor coil high pressure wash, filter replaced, cooling optimal.',
        createdAt: new Date('2026-02-20T09:00:00Z'),
      },
      {
        _id: SEED_JOBS.JOB_SHAWQIYYAH,
        id: SEED_JOBS.JOB_SHAWQIYYAH,
        customerName: 'Dr. Tariq Al-Omari',
        phone: '+966 56 111 2233',
        applianceType: 'Washing Machine',
        brand: 'Samsung EcoBubble 8kg',
        location: 'Al-Shawqiyyah, Makkah',
        status: 'active',
        assignedTo: [SEED_USERS.STAFF_BILAL, SEED_USERS.STAFF_SALMAN],
        notes: 'Heavy spin vibration, shock absorbers and drum spider replacement.',
        createdAt: new Date('2026-03-10T11:00:00Z'),
      },
    ];

    // Seed Expenses:
    // 1. Tariq paid 280 SAR for R410A gas refill (Job: Aziziyah) -> Company Expense -> Approved
    // 2. Bilal paid 160 SAR for LG Drain pump replacement (Job: Jabal Al-Nour) -> Company Expense -> Approved
    // 3. Tariq paid 120 SAR for Petrol van refill -> Equal split between Tariq & Salman -> Approved
    // 4. Salman paid 75 SAR for Shawarma & Tea lunch on site -> Equal split Tariq, Bilal, Salman -> Approved
    // 5. Tariq paid 350 SAR for AC Vacuum Pump Gauge -> Company expense -> Pending review by Owner
    this.data.expenses = [
      {
        _id: 'exp_001_gas_refill',
        id: 'exp_001_gas_refill',
        amount: 280.0,
        amountHalalas: 28000,
        currency: 'SAR',
        date: '2026-03-15',
        description: 'R410A Original Honeywell Refrigerant Cylinder Refill',
        categoryId: SEED_CATEGORIES.GAS_REFRIGERANT,
        paidBy: SEED_USERS.STAFF_TARIQ,
        groupId: SEED_GROUPS.AC_TEAM,
        jobId: SEED_JOBS.JOB_AZIZIYAH,
        splitType: 'company',
        splits: [
          {
            userId: SEED_USERS.OWNER,
            shareHalalas: 28000,
            shareAmount: 280.0,
            percentage: 100,
          },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4966668834?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        approvedBy: SEED_USERS.OWNER,
        reviewComment: 'Approved. Essential refrigerant for Al-Aziziyah contract.',
        createdBy: SEED_USERS.STAFF_TARIQ,
        createdAt: new Date('2026-03-15T11:30:00Z'),
        updatedAt: new Date('2026-03-15T13:00:00Z'),
      },
      {
        _id: 'exp_002_wm_pump',
        id: 'exp_002_wm_pump',
        amount: 160.0,
        amountHalalas: 16000,
        currency: 'SAR',
        date: '2026-03-16',
        description: 'LG Original Inverter Washing Machine Drain Motor & Filter',
        categoryId: SEED_CATEGORIES.SPARE_PARTS,
        paidBy: SEED_USERS.STAFF_BILAL,
        groupId: SEED_GROUPS.WM_TEAM,
        jobId: SEED_JOBS.JOB_JABAL_AL_NOUR,
        splitType: 'company',
        splits: [
          {
            userId: SEED_USERS.OWNER,
            shareHalalas: 16000,
            shareAmount: 160.0,
            percentage: 100,
          },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        approvedBy: SEED_USERS.OWNER,
        reviewComment: 'Approved. Bill verified with customer warranty card.',
        createdBy: SEED_USERS.STAFF_BILAL,
        createdAt: new Date('2026-03-16T15:00:00Z'),
        updatedAt: new Date('2026-03-16T16:20:00Z'),
      },
      {
        _id: 'exp_003_fuel_van',
        id: 'exp_003_fuel_van',
        amount: 120.0,
        amountHalalas: 12000,
        currency: 'SAR',
        date: '2026-03-18',
        description: 'Fuel 91 Octane for Service Van (Makkah Ring Road 3)',
        categoryId: SEED_CATEGORIES.FUEL,
        paidBy: SEED_USERS.STAFF_TARIQ,
        groupId: SEED_GROUPS.AC_TEAM,
        jobId: null,
        splitType: 'equal',
        splits: [
          { userId: SEED_USERS.STAFF_TARIQ, shareHalalas: 6000, shareAmount: 60.0, percentage: 50 },
          { userId: SEED_USERS.STAFF_SALMAN, shareHalalas: 6000, shareAmount: 60.0, percentage: 50 },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1527018607616-a656a38047a7?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        approvedBy: SEED_USERS.OWNER,
        reviewComment: 'Approved field team transport.',
        createdBy: SEED_USERS.STAFF_TARIQ,
        createdAt: new Date('2026-03-18T09:15:00Z'),
        updatedAt: new Date('2026-03-18T10:00:00Z'),
      },
      {
        _id: 'exp_004_lunch',
        id: 'exp_004_lunch',
        amount: 75.0,
        amountHalalas: 7500,
        currency: 'SAR',
        date: '2026-03-20',
        description: 'Bukhari Rice & Chicken lunch during emergency maintenance shift',
        categoryId: SEED_CATEGORIES.FOOD,
        paidBy: SEED_USERS.STAFF_SALMAN,
        groupId: SEED_GROUPS.OFFICE,
        jobId: null,
        splitType: 'equal',
        splits: [
          { userId: SEED_USERS.STAFF_TARIQ, shareHalalas: 2500, shareAmount: 25.0, percentage: 33.33 },
          { userId: SEED_USERS.STAFF_BILAL, shareHalalas: 2500, shareAmount: 25.0, percentage: 33.33 },
          { userId: SEED_USERS.STAFF_SALMAN, shareHalalas: 2500, shareAmount: 25.0, percentage: 33.34 },
        ],
        receiptUrl: '',
        status: 'approved',
        approvedBy: SEED_USERS.OWNER,
        reviewComment: 'Approved team lunch.',
        createdBy: SEED_USERS.STAFF_SALMAN,
        createdAt: new Date('2026-03-20T14:00:00Z'),
        updatedAt: new Date('2026-03-20T14:30:00Z'),
      },
      {
        _id: 'exp_005_vacuum_gauge',
        id: 'exp_005_vacuum_gauge',
        amount: 350.0,
        amountHalalas: 35000,
        currency: 'SAR',
        date: '2026-03-24',
        description: 'Digital HVAC Manifold Gauge Set with Charging Hoses',
        categoryId: SEED_CATEGORIES.TOOLS,
        paidBy: SEED_USERS.STAFF_TARIQ,
        groupId: SEED_GROUPS.AC_TEAM,
        jobId: null,
        splitType: 'company',
        splits: [
          {
            userId: SEED_USERS.OWNER,
            shareHalalas: 35000,
            shareAmount: 350.0,
            percentage: 100,
          },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        status: 'pending',
        approvedBy: null,
        reviewComment: null,
        createdBy: SEED_USERS.STAFF_TARIQ,
        createdAt: new Date('2026-03-24T16:00:00Z'),
        updatedAt: new Date('2026-03-24T16:00:00Z'),
      },
    ];

    // Seed Settlement:
    // Owner settled 200 SAR with Tariq via STC Pay
    this.data.settlements = [
      {
        _id: 'stl_001_stc_pay',
        id: 'stl_001_stc_pay',
        fromUser: SEED_USERS.OWNER,
        toUser: SEED_USERS.STAFF_TARIQ,
        amount: 200.0,
        amountHalalas: 20000,
        method: 'stc_pay',
        note: 'Reimbursement for R410A refrigerant cylinder via STC Pay Ref #889921',
        date: '2026-03-17',
        createdBy: SEED_USERS.OWNER,
        createdAt: new Date('2026-03-17T18:00:00Z'),
      },
    ];

    this.data.notifications = [
      {
        _id: 'notif_001',
        id: 'notif_001',
        userId: SEED_USERS.OWNER,
        type: 'expense_added',
        message: 'Tariq Khan submitted a new expense: "Digital HVAC Manifold Gauge Set" (350.00 SAR) awaiting your approval.',
        data: { expenseId: 'exp_005_vacuum_gauge' },
        isRead: false,
        createdAt: new Date('2026-03-24T16:01:00Z'),
      },
      {
        _id: 'notif_002',
        id: 'notif_002',
        userId: SEED_USERS.STAFF_TARIQ,
        type: 'settlement_received',
        message: 'Imtiyaz Alam sent you 200.00 SAR via STC Pay.',
        data: { settlementId: 'stl_001_stc_pay' },
        isRead: true,
        createdAt: new Date('2026-03-17T18:02:00Z'),
      },
      {
        _id: 'notif_003',
        id: 'notif_003',
        userId: SEED_USERS.STAFF_BILAL,
        type: 'expense_approved',
        message: 'Your expense "LG Drain Motor & Filter" (160.00 SAR) was approved by Imtiyaz Alam.',
        data: { expenseId: 'exp_002_wm_pump' },
        isRead: true,
        createdAt: new Date('2026-03-16T16:21:00Z'),
      },
    ];

    this.data.auditLogs = [
      {
        _id: 'log_001',
        id: 'log_001',
        userId: SEED_USERS.STAFF_TARIQ,
        userName: 'Tariq Khan',
        action: 'create',
        entity: 'expense',
        entityId: 'exp_001_gas_refill',
        before: null,
        after: { amount: 280, description: 'R410A Refrigerant Refill' },
        timestamp: new Date('2026-03-15T11:30:00Z'),
      },
      {
        _id: 'log_002',
        id: 'log_002',
        userId: SEED_USERS.OWNER,
        userName: 'Imtiyaz Alam',
        action: 'approve',
        entity: 'expense',
        entityId: 'exp_001_gas_refill',
        before: { status: 'pending' },
        after: { status: 'approved' },
        timestamp: new Date('2026-03-15T13:00:00Z'),
      },
      {
        _id: 'log_003',
        id: 'log_003',
        userId: SEED_USERS.OWNER,
        userName: 'Imtiyaz Alam',
        action: 'settle',
        entity: 'settlement',
        entityId: 'stl_001_stc_pay',
        before: null,
        after: { from: 'Imtiyaz Alam', to: 'Tariq Khan', amount: 200, method: 'stc_pay' },
        timestamp: new Date('2026-03-17T18:00:00Z'),
      },
    ];
  }
}

// Global local database instance
export const localDb = new LocalDbEngine();

export let isUsingMongo = false;

// Connect to MongoDB Atlas if MONGODB_URI is provided
export async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim().length > 0) {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isUsingMongo = true;
      console.log('Successfully connected to MongoDB Atlas!');
    } catch (err) {
      console.warn('MongoDB Atlas connection failed. Falling back to persistent local storage.', err);
      isUsingMongo = false;
    }
  } else {
    console.log('No MONGODB_URI found in env. Running with built-in persistent local database store.');
    isUsingMongo = false;
  }
}
