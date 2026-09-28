import { LanguageCode } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  location: string;
  managingDirector: string;
  directorName: string;
  navDashboard: string;
  navExpenses: string;
  navSettleUp: string;
  navJobs: string;
  navTeams: string;
  navReports: string;
  navAuditLogs: string;
  navCategories: string;
  navSettings: string;
  addExpense: string;
  settleNow: string;
  totalExpensesThisMonth: string;
  myBalance: string;
  youAreOwed: string;
  youOwe: string;
  allSettled: string;
  pendingApprovals: string;
  activeCustomerJobs: string;
  whoPaysWhom: string;
  simplifiedSettlements: string;
  recentExpenses: string;
  categoryBreakdown: string;
  monthlyTrend: string;
  viewAll: string;
  filterByStatus: string;
  all: string;
  pending: string;
  approved: string;
  rejected: string;
  searchPlaceholder: string;
  category: string;
  paidBy: string;
  amountSAR: string;
  date: string;
  description: string;
  customerJob: string;
  teamGroup: string;
  splitType: string;
  companyExpense: string;
  companyBears100: string;
  equalSplit: string;
  customSplit: string;
  percentageSplit: string;
  receiptPhoto: string;
  uploadReceipt: string;
  takePhoto: string;
  removePhoto: string;
  saveExpense: string;
  saving: string;
  cancel: string;
  approve: string;
  reject: string;
  reviewComment: string;
  delete: string;
  confirmDelete: string;
  fromUser: string;
  toUser: string;
  paymentMethod: string;
  cash: string;
  bankTransfer: string;
  stcPay: string;
  urpay: string;
  other: string;
  referenceNote: string;
  recordSettlement: string;
  recording: string;
  settlementRecorded: string;
  balanceLedger: string;
  settlementHistory: string;
  totalPaid: string;
  totalShare: string;
  netBalance: string;
  customerName: string;
  phone: string;
  applianceType: string;
  brand: string;
  addNewJob: string;
  createJob: string;
  exportCSV: string;
  exportPDF: string;
  exportSuccess: string;
  offlineNotice: string;
  syncNow: string;
  syncing: string;
  syncedSuccess: string;
  demoSwitcher: string;
  ownerRole: string;
  staffRole: string;
  switchUser: string;
  notifications: string;
  markAllRead: string;
  noNotifications: string;
  auditTimeline: string;
  auditAction: string;
  auditEntity: string;
  auditTime: string;
  auditBeforeAfter: string;
  installApp: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: 'MADAR AL-TASIS',
    tagline: 'AC & Washing Machine Service',
    location: 'Jabal Al-Nour, Makkah, KSA',
    managingDirector: 'Managing Director',
    directorName: 'Imtiyaz Alam',
    navDashboard: 'Dashboard',
    navExpenses: 'Expenses',
    navSettleUp: 'Settle Up',
    navJobs: 'Customer Jobs',
    navTeams: 'Teams',
    navReports: 'Reports & P&L',
    navAuditLogs: 'Audit Logs',
    navCategories: 'Categories',
    navSettings: 'Settings',
    addExpense: '+ Add Expense',
    settleNow: 'Settle Now',
    totalExpensesThisMonth: 'Total Shared This Month',
    myBalance: 'My Balance',
    youAreOwed: 'You are owed',
    youOwe: 'You owe',
    allSettled: 'All balances settled',
    pendingApprovals: 'Pending Approvals',
    activeCustomerJobs: 'Active Makkah Jobs',
    whoPaysWhom: 'Who Pays Whom',
    simplifiedSettlements: 'Simplified Settlement (Min Transactions)',
    recentExpenses: 'Recent Expenses',
    categoryBreakdown: 'Expense Breakdown by Category',
    monthlyTrend: 'Monthly Spending Trend',
    viewAll: 'View All',
    filterByStatus: 'Status',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    searchPlaceholder: 'Search expenses, parts, receipts...',
    category: 'Category',
    paidBy: 'Paid By',
    amountSAR: 'Amount (SAR)',
    date: 'Date',
    description: 'Description',
    customerJob: 'Linked Customer Job (Optional)',
    teamGroup: 'Team / Group',
    splitType: 'Split Type',
    companyExpense: 'Company Expense',
    companyBears100: 'Owner/Company bears 100%',
    equalSplit: 'Equal Split',
    customSplit: 'Custom Amount',
    percentageSplit: 'Percentage (%)',
    receiptPhoto: 'Receipt Photo / Bill',
    uploadReceipt: 'Upload Bill / Receipt',
    takePhoto: 'Take Photo',
    removePhoto: 'Remove',
    saveExpense: 'Save Expense',
    saving: 'Saving...',
    cancel: 'Cancel',
    approve: 'Approve',
    reject: 'Reject',
    reviewComment: 'Review Comment (Optional)',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this expense?',
    fromUser: 'Payer (From)',
    toUser: 'Receiver (To)',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer (IBAN)',
    stcPay: 'STC Pay',
    urpay: 'UrPay / Digital Wallet',
    other: 'Other Method',
    referenceNote: 'Reference Note (e.g. STC Pay Ref #, Cheque)',
    recordSettlement: 'Record Settlement Payment',
    recording: 'Recording...',
    settlementRecorded: 'Settlement recorded successfully!',
    balanceLedger: 'Balances Ledger (All Personnel)',
    settlementHistory: 'Settlement History',
    totalPaid: 'Total Paid Out',
    totalShare: 'Total Split Share',
    netBalance: 'Net Balance',
    customerName: 'Customer Name',
    phone: 'Phone Number',
    applianceType: 'Appliance Type',
    brand: 'Brand / Model',
    addNewJob: '+ New Customer Job',
    createJob: 'Create Job',
    exportCSV: 'Export to CSV / Excel',
    exportPDF: 'Print / Save PDF Report',
    exportSuccess: 'Report exported successfully!',
    offlineNotice: 'Offline Mode: Changes will sync automatically when online.',
    syncNow: 'Sync Queue Now',
    syncing: 'Syncing...',
    syncedSuccess: 'Offline expenses synced successfully!',
    demoSwitcher: 'Demo Role Switcher',
    ownerRole: 'Owner (Full Access)',
    staffRole: 'Staff Technician',
    switchUser: 'Switch User',
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    auditTimeline: 'System Audit Log (Owner Only)',
    auditAction: 'Action',
    auditEntity: 'Entity',
    auditTime: 'Timestamp',
    auditBeforeAfter: 'Details',
    installApp: 'Install App (PWA)',
  },
  ar: {
    appName: 'مدار التأسيس',
    tagline: 'صيانة وتصليح أجهزة التكييف والغسالات',
    location: 'جبل النور، مكة المكرمة، السعودية',
    managingDirector: 'المدير العام',
    directorName: 'امتياز عالم',
    navDashboard: 'لوحة التحكم',
    navExpenses: 'المصروفات',
    navSettleUp: 'تسوية الحسابات',
    navJobs: 'طلبات العملاء',
    navTeams: 'فرق العمل',
    navReports: 'التقارير والأرباح',
    navAuditLogs: 'سجل التدقيق',
    navCategories: 'التصنيفات',
    navSettings: 'الإعدادات',
    addExpense: '+ إضافة مصروف',
    settleNow: 'تسوية الآن',
    totalExpensesThisMonth: 'إجمالي المصروفات هذا الشهر',
    myBalance: 'رصيدي',
    youAreOwed: 'مستحق لك',
    youOwe: 'عليك دفع',
    allSettled: 'تمت تسوية جميع الحسابات',
    pendingApprovals: 'بانتظار الاعتماد',
    activeCustomerJobs: 'مشاريع مكة النشطة',
    whoPaysWhom: 'من يدفع لمن',
    simplifiedSettlements: 'التسوية المبسطة (أقل عدد من التحويلات)',
    recentExpenses: 'آخر المصروفات',
    categoryBreakdown: 'توزيع المصاريف حسب الصنف',
    monthlyTrend: 'مؤشر الإنفاق الشهري',
    viewAll: 'عرض الكل',
    filterByStatus: 'الحالة',
    all: 'الكل',
    pending: 'قيد المراجعة',
    approved: 'معتمد',
    rejected: 'مرفوض',
    searchPlaceholder: 'البحث عن مصروف، قطع غيار، فواتير...',
    category: 'الصنف',
    paidBy: 'دفع بواسطة',
    amountSAR: 'المبلغ (ريال)',
    date: 'التاريخ',
    description: 'الوصف',
    customerJob: 'ربط بطلب عميل (اختياري)',
    teamGroup: 'الفريق / المجموعة',
    splitType: 'طريقة التقسيم',
    companyExpense: 'مصروف شركة',
    companyBears100: 'تتحمله الشركة بنسبة 100%',
    equalSplit: 'تقسيم بالتساوي',
    customSplit: 'مبلغ مخصص',
    percentageSplit: 'نسبة مئوية (%)',
    receiptPhoto: 'صورة الفاتورة / الإيصال',
    uploadReceipt: 'رفع صورة الفاتورة',
    takePhoto: 'التقاط صورة',
    removePhoto: 'حذف',
    saveExpense: 'حفظ المصروف',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    approve: 'اعتماد',
    reject: 'رفض',
    reviewComment: 'ملاحظة المراجعة (اختياري)',
    delete: 'حذف',
    confirmDelete: 'هل أنت متأكد من حذف هذا المصروف؟',
    fromUser: 'الدافع (من)',
    toUser: 'المستلم (إلى)',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقداً (كاش)',
    bankTransfer: 'تحويل بنكي (آيبان)',
    stcPay: 'إس تي سي باي (STC Pay)',
    urpay: 'يورباي / محفظة رقمية',
    other: 'طريقة أخرى',
    referenceNote: 'رقم المرجع / الملاحظة',
    recordSettlement: 'تسجيل دفعة تسوية',
    recording: 'جاري التسجيل...',
    settlementRecorded: 'تم تسجيل التسوية بنجاح!',
    balanceLedger: 'كشف الأرصدة (جميع الفنيين)',
    settlementHistory: 'سجل التسويات السابقة',
    totalPaid: 'إجمالي المدفوع',
    totalShare: 'الحصة المستحقة',
    netBalance: 'صافي الرصيد',
    customerName: 'اسم العميل',
    phone: 'رقم الجوال',
    applianceType: 'نوع الجهاز',
    brand: 'الماركة / الموديل',
    addNewJob: '+ طلب عميل جديد',
    createJob: 'إنشاء الطلب',
    exportCSV: 'تصدير إكسل / CSV',
    exportPDF: 'طباعة / حفظ تقرير PDF',
    exportSuccess: 'تم تصدير التقرير بنجاح!',
    offlineNotice: 'وضع عدم الاتصال: ستتم المزامنة تلقائياً فور توفر الإنترنت.',
    syncNow: 'مزامنة الآن',
    syncing: 'جاري المزامنة...',
    syncedSuccess: 'تمت مزامنة العمليات المعلقة بنجاح!',
    demoSwitcher: 'تبديل المستخدم للتجربة',
    ownerRole: 'المالك (صلاحيات كاملة)',
    staffRole: 'فني الصيانة',
    switchUser: 'تبديل المستخدم',
    notifications: 'التنبيهات',
    markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد تنبيهات',
    auditTimeline: 'سجل تدقيق النظام (للمدير فقط)',
    auditAction: 'الإجراء',
    auditEntity: 'العنصر',
    auditTime: 'الوقت',
    auditBeforeAfter: 'التفاصيل',
    installApp: 'تثبيت التطبيق (PWA)',
  },
  ur: {
    appName: 'مدار التأسیس',
    tagline: 'ایئر کنڈیشنر اور واشنگ مشین سروسز',
    location: 'جبل النور، مکہ مکرمہ، سعودی عرب',
    managingDirector: 'منیجنگ ڈائریکٹر',
    directorName: 'امتیاز عالم',
    navDashboard: 'ڈیش بورڈ',
    navExpenses: 'اخراجات',
    navSettleUp: 'حساب بے باق (سیٹل اپ)',
    navJobs: 'کسٹمر جابس',
    navTeams: 'ٹیمیں',
    navReports: 'رپورٹس اور منافع',
    navAuditLogs: 'آڈٹ لاگ',
    navCategories: 'کیٹیگریز',
    navSettings: 'سیٹنگز',
    addExpense: '+ خرچہ درج کریں',
    settleNow: 'ابھی ادائیگی کریں',
    totalExpensesThisMonth: 'اس مہینے کے کل اخراجات',
    myBalance: 'میرا بقایا بیلنس',
    youAreOwed: 'آپ کو ملنے ہیں',
    youOwe: 'آپ نے دینے ہیں',
    allSettled: 'تمام حساب برابر ہے',
    pendingApprovals: 'منظوری کے منتظر',
    activeCustomerJobs: 'مکہ کی جاری جابس',
    whoPaysWhom: 'کون کسے ادا کرے',
    simplifiedSettlements: 'آسان ترین طریقہ (کم سے کم ٹرانزیکشن)',
    recentExpenses: 'حالیہ اخراجات',
    categoryBreakdown: 'کیٹیگری کے لحاظ سے اخراجات',
    monthlyTrend: 'ماہانہ خرچ کا گراف',
    viewAll: 'سب دیکھیں',
    filterByStatus: 'اسٹیٹس',
    all: 'سب',
    pending: 'زیرِ جائزہ',
    approved: 'منظور شدہ',
    rejected: 'مسترد',
    searchPlaceholder: 'خرچہ، اسپیئر پارٹ یا بل تلاش کریں...',
    category: 'کیٹیگری',
    paidBy: 'کس نے ادا کیا',
    amountSAR: 'رقم (سعودی ریال)',
    date: 'تاریخ',
    description: 'تفصیل',
    customerJob: 'کسٹمر جاب سے لنک کریں (اختیاری)',
    teamGroup: 'ٹیم / گروپ',
    splitType: 'تقسیم کا طریقہ',
    companyExpense: 'کمپنی کا خرچہ',
    companyBears100: 'کمپنی/مالک 100% برداشت کرے گا',
    equalSplit: 'برابر تقسیم',
    customSplit: 'مخصوص رقم',
    percentageSplit: 'فیصد کے حساب سے (%)',
    receiptPhoto: 'رسید / بل کی تصویر',
    uploadReceipt: 'بل کی تصویر اپ لوڈ کریں',
    takePhoto: 'تصویر کھینچیں',
    removePhoto: 'ہٹائیں',
    saveExpense: 'خرچہ محفوظ کریں',
    saving: 'محفوظ ہو رہا ہے...',
    cancel: 'منسوخ',
    approve: 'منظور کریں',
    reject: 'مسترد کریں',
    reviewComment: 'مالک کا تبصرہ (اختیاری)',
    delete: 'ڈیلیٹ کریں',
    confirmDelete: 'کیا آپ واقعی اس خرچے کو حذف کرنا چاہتے ہیں؟',
    fromUser: 'ادائیگی کنندہ (کس نے دی)',
    toUser: 'وصول کنندہ (کس کو ملی)',
    paymentMethod: 'ادائیگی کا ذریعہ',
    cash: 'نقد (کیش)',
    bankTransfer: 'بینک ٹرانسفر',
    stcPay: 'ایس ٹی سی پے (STC Pay)',
    urpay: 'یو آر پے (UrPay)',
    other: 'دیگر ذریعہ',
    referenceNote: 'ریفرنس نمبر یا نوٹ',
    recordSettlement: 'حساب بے باق کی ادائیگی درج کریں',
    recording: 'درج ہو رہا ہے...',
    settlementRecorded: 'ادائیگی کامیابی سے درج ہو گئی!',
    balanceLedger: 'بیلنس لیجر (تمام اسٹاف)',
    settlementHistory: 'ادائیگیوں کی ہسٹری',
    totalPaid: 'کل ادا کردہ',
    totalShare: 'کل حصہ',
    netBalance: 'خالص بیلنس',
    customerName: 'گاہک کا نام',
    phone: 'موبائل نمبر',
    applianceType: 'مشین کی قسم',
    brand: 'برانڈ / ماڈل',
    addNewJob: '+ نئی کسٹمر جاب',
    createJob: 'جاب بنائیں',
    exportCSV: 'ایکسل / CSV ڈاؤن لوڈ',
    exportPDF: 'پی ڈی ایف رپورٹ بنائیں',
    exportSuccess: 'رپورٹ کامیابی سے ڈاؤن لوڈ ہو گئی!',
    offlineNotice: 'آف لائن موڈ: انٹرنیٹ بحال ہونے پر خودکار ہم آہنگ ہو جائے گا۔',
    syncNow: 'ابھی سنک کریں',
    syncing: 'سنک ہو رہا ہے...',
    syncedSuccess: 'آف لائن اخراجات کامیابی سے اپ ڈیٹ ہو گئے!',
    demoSwitcher: 'صارف کا کردار بدلیں',
    ownerRole: 'مالک (مکمل رسائی)',
    staffRole: 'ٹیکنیشن اسٹاف',
    switchUser: 'یوزر تبدیل کریں',
    notifications: 'نوٹیفیکیشنز',
    markAllRead: 'سب پڑھ لیا گیا',
    noNotifications: 'کوئی نیا نوٹیفکیشن نہیں',
    auditTimeline: 'سسٹم آڈٹ لاگ (صرف مالک)',
    auditAction: 'ایکشن',
    auditEntity: 'شعبہ',
    auditTime: 'وقت',
    auditBeforeAfter: 'تفصیلات',
    installApp: 'ایپ انسٹال کریں (PWA)',
  },
  hi: {
    appName: 'मदार अल-तासीस',
    tagline: 'एसी और वाशिंग मशीन रिपेयरिंग सर्विसेज',
    location: 'जबल अल-नूर, मक्का मुकर्रमा, सऊदी अरब',
    managingDirector: 'मैनेजिंग डायरेक्टर',
    directorName: 'इम्तियाज़ आलम',
    navDashboard: 'डैशबोर्ड',
    navExpenses: 'खर्चे (Expenses)',
    navSettleUp: 'हिसाब चुकता (Settle Up)',
    navJobs: 'ग्राहक जॉब्स',
    navTeams: 'टीमें',
    navReports: 'रिपोर्ट्स और मुनाफा',
    navAuditLogs: 'ऑडिट लॉग',
    navCategories: 'कैटेगरी',
    navSettings: 'सेटिंग्स',
    addExpense: '+ नया खर्चा जोड़ें',
    settleNow: 'अभी चुकता करें',
    totalExpensesThisMonth: 'इस महीने का कुल शेयर्ड खर्चा',
    myBalance: 'मेरा बैलेंस',
    youAreOwed: 'आपको मिलने हैं',
    youOwe: 'आपको देने हैं',
    allSettled: 'सभी हिसाब चुकता है',
    pendingApprovals: 'मंजूरी के लिए पेंडिंग',
    activeCustomerJobs: 'मक्का में एक्टिव जॉब्स',
    whoPaysWhom: 'कौन किसको पैसे देगा',
    simplifiedSettlements: 'आसान पेमेंट प्लान (कम से कम लेनदेन)',
    recentExpenses: 'हालिया खर्चे',
    categoryBreakdown: 'कैटेगरी अनुसार खर्च',
    monthlyTrend: 'मासिक खर्च ट्रेंड',
    viewAll: 'सभी देखें',
    filterByStatus: 'स्टेटस',
    all: 'सभी',
    pending: 'पेंडिंग',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    searchPlaceholder: 'खर्चा, पार्ट्स या बिल खोजें...',
    category: 'कैटेगरी',
    paidBy: 'किसने दिया',
    amountSAR: 'रकम (रियाल)',
    date: 'तारीख',
    description: 'विवरण',
    customerJob: 'कस्टमर जॉब से लिंक करें (वैकल्पिक)',
    teamGroup: 'टीम / ग्रुप',
    splitType: 'बंटवारे का तरीका',
    companyExpense: 'कंपनी का खर्चा',
    companyBears100: 'कंपनी / मालिक 100% खर्च वहन करेगा',
    equalSplit: 'बराबर बंटवारा',
    customSplit: 'तयशुदा रकम',
    percentageSplit: 'प्रतिशत (%) बंटवारा',
    receiptPhoto: 'बिल / रसीद की फोटो',
    uploadReceipt: 'बिल की फोटो अपलोड करें',
    takePhoto: 'फोटो खींचे',
    removePhoto: 'हटाएं',
    saveExpense: 'खर्चा सेव करें',
    saving: 'सेव हो रहा है...',
    cancel: 'रद्द करें',
    approve: 'मंजूर करें',
    reject: 'खारिज करें',
    reviewComment: 'मालिक की टिप्पणी (वैकल्पिक)',
    delete: 'हटाएं',
    confirmDelete: 'क्या आप वाकई इस खर्च को हटाना चाहते हैं?',
    fromUser: 'भुगतानकर्ता (किसने दिया)',
    toUser: 'प्राप्तकर्ता (किसको मिला)',
    paymentMethod: 'भुगतान का तरीका',
    cash: 'नकद (Cash)',
    bankTransfer: 'बैंक ट्रांसफर (IBAN)',
    stcPay: 'एसटीसी पे (STC Pay)',
    urpay: 'यूरपे (UrPay)',
    other: 'अन्य माध्यम',
    referenceNote: 'रेफरेंस नंबर या नोट',
    recordSettlement: 'हिसाब चुकता दर्ज करें',
    recording: 'दर्ज हो रहा है...',
    settlementRecorded: 'भुगतान सफलतापूर्वक दर्ज हुआ!',
    balanceLedger: 'बैलेंस लेजर (सभी स्टाफ)',
    settlementHistory: 'भुगतान का इतिहास',
    totalPaid: 'कुल चुकाया गया',
    totalShare: 'कुल हिस्सा',
    netBalance: 'नेट बैलेंस',
    customerName: 'ग्राहक का नाम',
    phone: 'मोबाइल नंबर',
    applianceType: 'मशीन का प्रकार',
    brand: 'ब्रांड / मॉडल',
    addNewJob: '+ नई कस्टमर जॉब',
    createJob: 'जॉब बनाएं',
    exportCSV: 'एक्सेल / CSV डाउनलोड',
    exportPDF: 'पीडीएफ रिपोर्ट बनाएं',
    exportSuccess: 'रिपोर्ट सफलतापूर्वक डाउनलोड हुई!',
    offlineNotice: 'ऑफ़लाइन मोड: इंटरनेट आने पर डेटा स्वतः सिंक हो जाएगा।',
    syncNow: 'अभी सिंक करें',
    syncing: 'सिंक हो रहा है...',
    syncedSuccess: 'ऑफ़लाइन खर्चे सिंक हो गए!',
    demoSwitcher: 'डेमो रोल बदलें',
    ownerRole: 'मालिक (पूर्ण अधिकार)',
    staffRole: 'स्टाफ टेक्नीशियन',
    switchUser: 'यूज़र बदलें',
    notifications: 'सूचनाएं (Notifications)',
    markAllRead: 'सभी को पढ़ा हुआ मार्क करें',
    noNotifications: 'कोई नई सूचना नहीं है',
    auditTimeline: 'सिस्टम ऑडिट लॉग (केवल मालिक)',
    auditAction: 'एक्शन',
    auditEntity: 'एंटिटी',
    auditTime: 'समय',
    auditBeforeAfter: 'विवरण',
    installApp: 'ऐप इंस्टॉल करें (PWA)',
  },
};
