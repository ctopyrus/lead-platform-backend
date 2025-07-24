// src/routes/authRoutes.ts
import express from 'express';
import { login, signup, getMe } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);


export default router;
