import { Router } from 'express';
import { getRestaurants } from '../controllers/restaurant.controller.ts';
import { createReservation, getReservations, getReservationById, updateReservation, deleteReservation } from '../controllers/reservation.controller.ts';
import { handleChat } from '../controllers/chat.controller.ts';

const router = Router();

router.get('/restaurants', getRestaurants);
router.post('/reservations', createReservation);
router.get('/reservations', getReservations);
router.get('/reservations/:id', getReservationById);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);
router.post('/chat', handleChat);

export default router;
