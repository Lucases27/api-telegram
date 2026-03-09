import { Request, Response } from 'express';
import { processChatMessage } from '../services/gemini.service.ts';

export const handleChat = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;
  if (!message) { 
    res.status(400).json({ error: 'Mensaje requerido' }); 
    return;
  }

  try {
    const reply = await processChatMessage(message, req.user);
    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Error en el chat con IA: ' + (err.message || 'Error desconocido') });
  }
};
