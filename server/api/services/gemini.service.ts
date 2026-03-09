import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import db from '../../src/db.ts';

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

export const processChatMessage = async (message: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    throw new Error('Configuración de IA no disponible o clave de API inválida en el servidor');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const model = "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: message,
    config: {
      systemInstruction: "Eres un asistente de reservas para restaurantes. Puedes listar restaurantes, crear, consultar, editar y eliminar reservas. Usa las herramientas proporcionadas para interactuar con la base de datos. Responde siempre de forma amable y en español. Si falta información para una reserva (como la fecha o el nombre), pídela. La fecha actual es: " + new Date().toISOString().split('T')[0],
      tools: [{ functionDeclarations: tools }]
    }
  });

  const functionCalls = response.functionCalls;

  if (!functionCalls || functionCalls.length === 0) {
    return response.text || 'No pude procesar tu solicitud.';
  }

  const toolResponseParts: any[] = [];
  for (const call of functionCalls) {
    let result;
    try {
      switch (call.name) {
        case 'list_restaurants':
          result = await db('restaurants').select('*');
          break;
        case 'create_reservation': {
          const { restaurantName: restName, name, date } = call.args as any;
          const restaurante = await db('restaurants').where('name', 'like', `%${restName}%`).first();
          if (!restaurante) {
            result = { error: `Restaurante no encontrado con el nombre "${restName}"` };
          } else {
            const [id] = await db('reservations').insert({ restaurantId: restaurante.id, name, date });
            result = { message: `Reserva confirmada para ${name} en ${restaurante.name} el ${date}`, id };
          }
          break;
        }
        case 'list_reservations': {
          const { search, date: searchDate } = call.args as any;
          let query = db('reservations').join('restaurants', 'reservations.restaurantId', 'restaurants.id')
            .select('reservations.id', 'reservations.name', 'reservations.date', 'restaurants.name as restaurantName');
          if (search) query = query.where('reservations.name', 'like', `%${search}%`);
          if (searchDate) query = query.where('reservations.date', searchDate);
          result = await query;
          break;
        }
        case 'update_reservation': {
          const { id: upId, restaurantName: upRestName, name: upName, date: upDate } = call.args as any;
          const restToUpdate = await db('restaurants').where('name', 'like', `%${upRestName}%`).first();
          if (!restToUpdate) {
            result = { error: `Restaurante no encontrado con el nombre "${upRestName}"` };
          } else {
            await db('reservations').where({ id: upId }).update({ restaurantId: restToUpdate.id, name: upName, date: upDate });
            result = { message: 'Reserva actualizada correctamente' };
          }
          break;
        }
        case 'delete_reservation': {
          const { id: delId } = call.args as any;
          await db('reservations').where({ id: delId }).del();
          result = { message: `Reserva #${delId} eliminada` };
          break;
        }
      }
    } catch (dbErr) {
      console.error('DB Error in tool call:', dbErr);
      result = { error: 'Error al acceder a la base de datos' };
    }

    toolResponseParts.push({
      functionResponse: {
        name: call.name,
        response: { result }
      }
    });
  }

  const modelParts = response.candidates?.[0]?.content?.parts || [];
  const finalResponse = await ai.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: modelParts },
      { role: 'user', parts: toolResponseParts }
    ],
    config: {
      systemInstruction: "Eres un asistente de reservas para restaurantes. Responde siempre de forma amable y en español. Si acabas de realizar una acción (como crear una reserva), confirma los detalles al usuario."
    }
  });

  return finalResponse.text || 'Acción realizada correctamente.';
};
