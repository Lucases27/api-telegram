import { Request, Response, NextFunction } from 'express';
import admin from '../firebase-admin.ts';
import db from '../db.ts';

export interface AuthUser {
  id: number;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await db('users').where({ firebaseUid: decodedToken.uid }).first();

    if (!user) {
      res.status(401).json({ error: 'Usuario no registrado. Por favor, completa el proceso de registro.' });
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
