import { Request, Response } from 'express';
import admin from '../../src/firebase-admin.ts';
import db from '../../src/db.ts';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' }); return;
  }
  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'El campo "name" es requerido' }); return;
    }

    const existing = await db('users').where({ firebaseUid: uid }).first();
    if (existing) {
      res.status(409).json({ error: 'El usuario ya está registrado' }); return;
    }

    const [id] = await db('users').insert({
      firebaseUid: uid,
      email: email!,
      name,
      role: 'customer',
    });

    const newUser = await db('users').where({ id }).first();
    res.status(201).json(newUser);
  } catch (err: any) {
    console.error('Register error:', err);
    // If it's a Firebase token error, return 401. Otherwise 500.
    if (err?.errorInfo || err?.code?.startsWith?.('auth/')) {
      res.status(401).json({ error: 'Token inválido o expirado' });
    } else {
      res.status(500).json({ error: 'Error interno al registrar el usuario' });
    }
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json(req.user);
};
