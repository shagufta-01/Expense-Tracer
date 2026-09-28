import { Router, Response } from 'express';
import { localDb } from '../db';
import { AuthRequest, requireAuth, requireOwner } from '../authMiddleware';

const router = Router();

// GET /api/categories
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const categories = store.categories.filter((c) => c.isActive !== false);
  res.json(categories);
});

// POST /api/categories (Owner only)
router.post('/', requireOwner, (req: AuthRequest, res: Response) => {
  const { name, icon = 'Package', color = '#0284C7' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const store = localDb.getStore();
  const catId = `cat_${Date.now()}`;
  const newCat = {
    _id: catId,
    id: catId,
    name: name.trim(),
    icon,
    color,
    isActive: true,
  };

  store.categories.push(newCat);

  // Audit log
  store.auditLogs.unshift({
    _id: `log_${Date.now()}`,
    id: `log_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'create',
    entity: 'category',
    entityId: catId,
    before: null,
    after: newCat,
    timestamp: new Date(),
  });

  localDb.save();
  res.status(201).json(newCat);
});

// PUT /api/categories/:id (Owner only)
router.put('/:id', requireOwner, (req: AuthRequest, res: Response) => {
  const { name, icon, color } = req.body;
  const store = localDb.getStore();
  const cat = store.categories.find((c) => (c._id || c.id) === req.params.id);

  if (!cat) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  if (name) cat.name = name.trim();
  if (icon) cat.icon = icon;
  if (color) cat.color = color;

  localDb.save();
  res.json(cat);
});

// DELETE /api/categories/:id (Owner only)
router.delete('/:id', requireOwner, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const cat = store.categories.find((c) => (c._id || c.id) === req.params.id);

  if (!cat) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  cat.isActive = false;
  localDb.save();
  res.json({ message: 'Category removed' });
});

export default router;
