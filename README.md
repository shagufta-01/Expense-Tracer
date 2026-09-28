# MADAR AL-TASIS - Shared Expense Tracker (Makkah, KSA)

A responsive, PWA-ready full-stack web application built specifically for **MADAR AL-TASIS**, an Air Conditioner and Washing Machine service company based in **Jabal Al-Nour, Makkah, Saudi Arabia**.
**Managing Director:** Imtiyaz Alam.

---

## 📌 Problem Solved
Field technicians and staff frequently spend personal funds out of pocket on company operations:
- Refrigerant gas refills (R22, R410A, R32)
- AC copper piping, capacitors, fan motors, washing machine inlet valves, drain pumps, inverter boards
- Fuel for service vans, Makkah highway tolls, vehicle transport
- Tool replacements (manifold gauges, vacuum pumps, multimeter)
- On-site meals during long shifts across Makkah neighborhoods (Al-Aziziyah, Jabal Al-Nour, Al-Kakiyyah, Al-Naseem)

This app ensures:
1. Every expense is logged with amount (SAR), receipt photo, customer job link, and team group.
2. Fair splits: Equal split, custom SAR split, percentage split, or **Company Expense** (where company/owner bears 100%).
3. Robust approval workflow: Staff expenses start as `pending`; Owner approves/rejects with a review note. Only approved expenses enter the balance ledger.
4. Integer-accurate balance calculation in **Halalas** (1 SAR = 100 Halalas) avoiding float rounding errors.
5. Debt minimization algorithm: computes optimal "Who Pays Whom" with the fewest number of transactions.
6. Offline-first PWA: Queue entries locally when in basements/remote sites and sync automatically when internet is back.
7. Multi-language support: English, Hindi, Urdu, and Arabic with true Right-to-Left (RTL) layout.

---

## 👥 Users & Roles
| Role | User | Email | Default Password | Permissions |
|---|---|---|---|---|
| **Owner (Managing Director)** | Imtiyaz Alam | `imtiyaz@madaraltasis.com` | `admin123` | Full access, approves/rejects, all reports & P&L impact, category management, audit logs, team control |
| **Staff (Senior AC Tech)** | Tariq Khan | `tariq@madaraltasis.com` | `staff123` | Adds own expenses, views own balance & shared team expenses. Cannot see company P&L or private salary advances |
| **Staff (Washing Machine Tech)** | Bilal Ahmed | `bilal@madaraltasis.com` | `staff123` | Adds expenses, tracks WM team jobs, logs receipts, settles balances |
| **Staff (Field Technician)** | Salman Farooq | `salman@madaraltasis.com` | `staff123` | Adds expenses, records customer jobs, views who owes whom |

---

## 🗄️ Database Architecture (MongoDB & Mongoose)
Collections & Schemas:
- `users`: name, email, passwordHash, role (`owner` | `staff`), phone, language, isActive, createdAt
- `groups`: name, members [userId], createdBy, createdAt
- `categories`: name, icon, color, isActive
- `jobs`: customerName, phone, applianceType, brand, location, status, createdAt
- `expenses`: amount, amountHalalas, currency ("SAR"), date, description, categoryId, paidBy, groupId, jobId, splitType (`equal` | `custom` | `percentage` | `company`), splits [{userId, shareHalalas, shareAmount}], receiptUrl, status (`pending` | `approved` | `rejected`), approvedBy, reviewComment, createdBy, createdAt, updatedAt
  - Indexes: `(groupId, date)`, `(paidBy)`, `(status)`
- `settlements`: fromUser, toUser, amount, amountHalalas, method, note, date, createdBy
  - Indexes: `(fromUser, toUser)`
- `notifications`: userId, type, message, isRead, createdAt
- `auditLogs`: userId, action, entity, entityId, before, after, timestamp

*Note: If `MONGODB_URI` is provided, Mongoose connects to MongoDB Atlas. If omitted or during local prototyping, the backend automatically uses its persistent local database engine with pre-seeded data, ensuring zero-configuration startup.*

---

## 🚀 Getting Started

### 1. Setup Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Optionally provide your MongoDB Atlas connection string in `MONGODB_URI`.

### 2. Start Application
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Quick Role Testing
Use the **Demo Switcher** at the top or in the Settings tab to switch between Imtiyaz Alam (Owner) and Tariq Khan / Bilal Ahmed / Salman Farooq (Staff) with one click to observe role-based permissions in real-time.
