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
    const userId = req.user!.id;
    const [id] = await db('reservations').insert({ restaurantId, name, date, userId });
    res.json({ message: `Reserva confirmada para ${name} en ${restaurante.name} el ${date}`, id });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  const { search, date } = req.query;
  const user = req.user!;
  try {
    let query = db('reservations')
      .join('restaurants', 'reservations.restaurantId', 'restaurants.id')
      .leftJoin('users', 'reservations.userId', 'users.id')
      .select(
        'reservations.id',
        'reservations.name',
        'reservations.date',
        'restaurants.name as restaurantName',
        'reservations.restaurantId',
        'reservations.createdAt',
        'reservations.userId',
        'users.name as userName'
      );

    // Customers only see their own reservations
    if (user.role === 'customer') {
      query = query.where('reservations.userId', user.id);
    }

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
  const user = req.user!;
  try {
    const reserva = await db('reservations')
      .join('restaurants', 'reservations.restaurantId', 'restaurants.id')
      .select('reservations.id', 'reservations.name', 'reservations.date', 'restaurants.name as restaurantName', 'reservations.restaurantId', 'reservations.createdAt', 'reservations.userId')
      .where('reservations.id', id)
      .first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    if (user.role === 'customer' && reserva.userId !== user.id) {
      res.status(403).json({ error: 'No tenés permiso para ver esta reserva' }); return;
    }
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
};

export const updateReservation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { restaurantId, name, date } = req.body;
  const user = req.user!;
  if (!restaurantId || !name || !date) { res.status(400).json({ error: 'Faltan datos requeridos' }); return; }
  try {
    const reserva = await db('reservations').where({ id }).first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    if (user.role === 'customer' && reserva.userId !== user.id) {
      res.status(403).json({ error: 'No tenés permiso para editar esta reserva' }); return;
    }
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
  const user = req.user!;
  try {
    const reserva = await db('reservations').where({ id }).first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    if (user.role === 'customer' && reserva.userId !== user.id) {
      res.status(403).json({ error: 'No tenés permiso para eliminar esta reserva' }); return;
    }
    await db('reservations').where({ id }).del();
    res.json({ message: `Reserva #${id} eliminada` });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};
