import express from 'express';
import cors from 'cors';
import db from '../src/db.js';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const app = express();
app.use(express.json());
app.use(cors());

// --- API Endpoints ---

app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurantes = await db('restaurants').select('*');
    res.json(restaurantes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener restaurantes' });
  }
});

app.post('/api/reservations', async (req, res) => {
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
});

app.get('/api/reservations', async (req, res) => {
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
});

app.get('/api/reservations/:id', async (req, res) => {
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
});

app.put('/api/reservations/:id', async (req, res) => {
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
});

app.delete('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await db('reservations').where({ id }).first();
    if (!reserva) { res.status(404).json({ error: 'Reserva no encontrada' }); return; }
    await db('reservations').where({ id }).del();
    res.json({ message: `Reserva #${id} eliminada` });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

// --- Chat with IA (Gemini) ---

const tools: FunctionDeclaration[] = [
  {
    name: "list_restaurants",
    description: "Obtener la lista de todos los restaurantes disponibles.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "create_reservation",
    description: "Crear una nueva reserva en un restaurante.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        restaurantName: { type: Type.STRING, description: "Nombre exacto del restaurante (ej. 'Restaurante A')." },
        name: { type: Type.STRING, description: "Nombre de la persona que reserva." },
        date: { type: Type.STRING, description: "Fecha de la reserva en formato YYYY-MM-DD." }
      },
      required: ["restaurantName", "name", "date"]
    }
  },
  {
    name: "list_reservations",
    description: "Consultar las reservas existentes. Se puede filtrar por nombre o fecha.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: { type: Type.STRING, description: "Nombre a buscar." },
        date: { type: Type.STRING, description: "Fecha a buscar (YYYY-MM-DD)." }
      }
    }
  },
  {
    name: "update_reservation",
    description: "Actualizar una reserva existente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER, description: "ID de la reserva a actualizar." },
        restaurantName: { type: Type.STRING, description: "Nuevo nombre del restaurante (ej. 'Restaurante A')." },
        name: { type: Type.STRING, description: "Nuevo nombre." },
        date: { type: Type.STRING, description: "Nueva fecha (YYYY-MM-DD)." }
      },
      required: ["id", "restaurantName", "name", "date"]
    }
  },
  {
    name: "delete_reservation",
    description: "Eliminar una reserva existente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER, description: "ID de la reserva a eliminar." }
      },
      required: ["id"]
    }
  }
];

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) { res.status(400).json({ error: 'Mensaje requerido' }); return; }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    console.error('GEMINI_API_KEY is not valid or defined in the environment');
    return res.status(500).json({ error: 'Configuración de IA no disponible o clave de API inválida en el servidor' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction: "Eres un asistente de reservas para restaurantes. Puedes listar restaurantes, crear, consultar, editar y eliminar reservas. Usa las herramientas proporcionadas para interactuar con la base de datos. Responde siempre de forma amable y en español. Si falta información para una reserva (como la fecha o el nombre), pídela. La fecha actual es: " + new Date().toISOString().split('T')[0],
        tools: [{ functionDeclarations: tools }]
      }
    });

    let finalResponseText = response.text;
    const functionCalls = response.functionCalls;

    if (functionCalls) {
      const toolResponses = [];
      for (const call of functionCalls) {
        let result;
        try {
          switch (call.name) {
            case 'list_restaurants':
              result = await db('restaurants').select('*');
              break;
            case 'create_reservation':
              const { restaurantId, name, date } = call.args as any;
              const restaurante = await db('restaurants').where({ id: restaurantId }).first();
              if (!restaurante) {
                result = { error: 'Restaurante no encontrado' };
              } else {
                const [id] = await db('reservations').insert({ restaurantId, name, date });
                result = { message: `Reserva confirmada para ${name} en ${restaurante.name} el ${date}`, id };
              }
              break;
            case 'list_reservations':
              const { search, date: searchDate } = call.args as any;
              let query = db('reservations').join('restaurants', 'reservations.restaurantId', 'restaurants.id')
                .select('reservations.id', 'reservations.name', 'reservations.date', 'restaurants.name as restaurantName');
              if (search) query = query.where('reservations.name', 'like', `%${search}%`);
              if (searchDate) query = query.where('reservations.date', searchDate);
              result = await query;
              break;
            case 'update_reservation':
              const { id: upId, restaurantName: upRestName, name: upName, date: upDate } = call.args as any;
              const restToUpdate = await db('restaurants').where('name', 'like', `%${upRestName}%`).first();
              if (!restToUpdate) {
                result = { error: `Restaurante no encontrado con el nombre "${upRestName}"` };
              } else {
                await db('reservations').where({ id: upId }).update({ restaurantId: restToUpdate.id, name: upName, date: upDate });
                result = { message: 'Reserva actualizada correctamente' };
              }
              break;
            case 'delete_reservation':
              const { id: delId } = call.args as any;
              await db('reservations').where({ id: delId }).del();
              result = { message: `Reserva #${delId} eliminada` };
              break;
          }
        } catch (dbErr) {
          console.error('DB Error in tool call:', dbErr);
          result = { error: 'Error al acceder a la base de datos' };
        }

        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: { result },
            id: call.id
          }
        });
      }

      // Send tool responses back to model to get final text
      const finalResponse = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: message }] },
          { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
          { role: 'user', parts: toolResponses as any }
        ],
        config: {
          systemInstruction: "Eres un asistente de reservas para restaurantes. Responde siempre de forma amable y en español. Si acabas de realizar una acción (como crear una reserva), confirma los detalles al usuario."
        }
      });
      finalResponseText = finalResponse.text;
    }

    res.json({ reply: finalResponseText || response.text || 'No pude procesar tu solicitud.' });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Error en el chat con IA: ' + (err.message || 'Error desconocido') });
  }
});

export default app;
