import { Request, Response } from 'express';
import db from '../../src/db.ts';

export const createReservation = async (req: Request, res: Response): Promise<void> => {
  const { restaurantId, name, date } = req.body;
  if (!restaurantId || !name || !date) {
    res.status(400).json({ error: 'Faltan datos requeridos' }); return;
  }
  try {
    const restaurante = await db('restaurants').where({ id: restaurantId }).first();
    if (!restaurante) {
      res.status(400).json({ error: 'Restaurante no encontrado' }); return;
    }
    const [id] = await db('reservations').insert({ restaurantId, name, date });
    res.json({ message: `Reserva confirmada para ${name} en ${restaurante.name} el ${date}`, id });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  const { search, date } = req.query;
  try {
    let query = db('reservations').join('restaurants', 'reservations.restaurantId', 'restaurants.id')
      .select('reservations.id', 'reservations.name', 'reservations.date', 'restaurants.name as restaurantName', 'reservations.restaurantId', 'reservations.createdAt');
    if (search) {
      query = query.where('reservations.name', 'like', `%${search}%`);
    }
    if (date) {
      query = query.where('reservations.date', date);
    }
    const reservas = await query;
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

export const getReservationById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const reserva = await db('reservations')
      .join('restaurants', 'reservations.restaurantId', 'restaurants.id')
      .select('reservations.id', 'reservations.name', 'reservations.date', 'restaurants.name as restaurantName', 'reservations.restaurantId', 'reservations.createdAt')
      .where('reservations.id', id)
      .first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
};

export const updateReservation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { restaurantId, name, date } = req.body;
  if (!restaurantId || !name || !date) { res.status(400).json({ error: 'Faltan datos requeridos' }); return; }
  try {
    const reserva = await db('reservations').where({ id }).first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    const restaurante = await db('restaurants').where({ id: restaurantId }).first();
    if (!restaurante) { res.status(400).json({ error: 'Restaurante no encontrado' }); return; }
    await db('reservations').where({ id }).update({ restaurantId, name, date });
    res.json({ message: 'Reserva actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
};

export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const reserva = await db('reservations').where({ id }).first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    await db('reservations').where({ id }).del();
    res.json({ message: `Reserva #${id} eliminada` });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};
