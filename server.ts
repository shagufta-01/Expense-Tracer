import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { initDatabase } from './server/db';
import { authMiddleware } from './server/authMiddleware';
import authRoutes from './server/routes/auth';
import expensesRoutes from './server/routes/expenses';
import settlementsRoutes from './server/routes/settlements';
import balancesRoutes from './server/routes/balances';
import categoriesRoutes from './server/routes/categories';
import jobsRoutes from './server/routes/jobs';
import groupsRoutes from './server/routes/groups';
import reportsRoutes from './server/routes/reports';
import notificationsRoutes from './server/routes/notifications';
import auditLogsRoutes from './server/routes/auditLogs';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize DB (MongoDB Atlas or persistent local fallback)
  await initDatabase();

  // Basic middleware
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Attach auth context from Bearer token
  app.use(authMiddleware as any);

  // Mount API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expensesRoutes);
  app.use('/api/settlements', settlementsRoutes);
  app.use('/api/balances', balancesRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/jobs', jobsRoutes);
  app.use('/api/groups', groupsRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/audit-logs', auditLogsRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      company: 'MADAR AL-TASIS (Makkah, KSA)',
      managingDirector: 'Imtiyaz Alam',
      time: new Date(),
    });
  });

  // Frontend routing & Vite integration
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MADAR AL-TASIS Expense Tracker running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
