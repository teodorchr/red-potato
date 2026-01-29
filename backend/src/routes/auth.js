import express from 'express';
import { login, register, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { loginSchema, registerSchema } from '../utils/validators.js';

const router = express.Router();

// POST /api/auth/login - Login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/register - Register new user (admin only)
router.post('/register', authenticateToken, requireAdmin, validate(registerSchema), register);

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, getCurrentUser);

// POST /api/auth/logout - Logout
router.post('/logout', authenticateToken, logout);

export default router;
