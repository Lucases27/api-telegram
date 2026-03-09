import { Router } from 'express';
import { registerUser, getMe } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../../src/middleware/auth.middleware.ts';

const router = Router();

router.post('/register', registerUser);
router.get('/me', authMiddleware, getMe);

export default router;
