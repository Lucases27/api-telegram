import { Request, Response } from 'express';
import db from '../../src/db.ts';

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurantes = await db('restaurants').select('*');
    res.json(restaurantes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener restaurantes' });
  }
};
