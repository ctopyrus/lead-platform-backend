// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, password: hashed } });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Signup failed', error: err });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, createdAt: true },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching user', error: err });
    }
};
