import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { localDb } from '../db';
import { AuthRequest, generateToken, requireAuth } from '../authMiddleware';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const store = localDb.getStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive !== false
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      language: user.language,
      avatar: user.avatar,
    },
  });
});

// Demo switch user (quick role toggle for testing Owner vs Staff)
router.post('/switch-demo-user', async (req, res) => {
  const { userId } = req.body;
  const store = localDb.getStore();
  const user = store.users.find((u) => (u._id || u.id) === userId && u.isActive !== false);

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found.' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      language: user.language,
      avatar: user.avatar,
    },
  });
});

// Get current user profile
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update profile / language
router.put('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  const { name, phone, language } = req.body;
  const store = localDb.getStore();
  const user = store.users.find((u) => (u._id || u.id) === req.user!.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (language && ['en', 'hi', 'ur', 'ar'].includes(language)) {
    user.language = language;
  }

  localDb.save();

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      language: user.language,
      avatar: user.avatar,
    },
  });
});

// List all users
router.get('/users', requireAuth, (req: AuthRequest, res: Response) => {
  const store = localDb.getStore();
  const users = store.users
    .filter((u) => u.isActive !== false)
    .map((u) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      language: u.language,
      avatar: u.avatar,
    }));
  res.json(users);
});

export default router;
