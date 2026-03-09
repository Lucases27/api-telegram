import { Router } from 'express';
import { getRestaurants } from '../controllers/restaurant.controller.ts';
import { createReservation, getReservations, getReservationById, updateReservation, deleteReservation } from '../controllers/reservation.controller.ts';
import { handleChat } from '../controllers/chat.controller.ts';
import { authMiddleware } from '../../src/middleware/auth.middleware.ts';
import authRoutes from './auth.routes.ts';

const router = Router();

// Auth (no auth required for register, me is protected inside auth.routes)
router.use('/auth', authRoutes);

// Protected endpoints
router.get('/restaurants', authMiddleware, getRestaurants);
router.post('/reservations', authMiddleware, createReservation);
router.get('/reservations', authMiddleware, getReservations);
router.get('/reservations/:id', authMiddleware, getReservationById);
router.put('/reservations/:id', authMiddleware, updateReservation);
router.delete('/reservations/:id', authMiddleware, deleteReservation);
router.post('/chat', authMiddleware, handleChat);

export default router;
