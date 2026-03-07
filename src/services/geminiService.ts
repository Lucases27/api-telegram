import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import axios from 'axios';

const API_URL = '/api';

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
        restaurantId: { type: Type.INTEGER, description: "ID del restaurante." },
        name: { type: Type.STRING, description: "Nombre de la persona que reserva." },
        date: { type: Type.STRING, description: "Fecha de la reserva en formato YYYY-MM-DD." }
      },
      required: ["restaurantId", "name", "date"]
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
        restaurantId: { type: Type.INTEGER, description: "Nuevo ID del restaurante." },
        name: { type: Type.STRING, description: "Nuevo nombre." },
        date: { type: Type.STRING, description: "Nueva fecha (YYYY-MM-DD)." }
      },
      required: ["id", "restaurantId", "name", "date"]
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

export async function chatWithIA(message: string) {
  // Use process.env.GEMINI_API_KEY as per guidelines and vite.config.ts
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    console.error('GEMINI_API_KEY is not valid or defined in the frontend environment');
    throw new Error('Configuración de IA no disponible o clave de API inválida en el navegador');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const model = "gemini-3-flash-preview";

  try {
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
        const args = call.args as any;
        
        try {
          switch (call.name) {
            case 'list_restaurants':
              const restRes = await axios.get(`${API_URL}/restaurants`);
              result = restRes.data;
              break;
            case 'create_reservation':
              const createRes = await axios.post(`${API_URL}/reservations`, args);
              result = createRes.data;
              break;
            case 'list_reservations':
              const listRes = await axios.get(`${API_URL}/reservations`, { params: args });
              result = listRes.data;
              break;
            case 'update_reservation':
              const updateRes = await axios.put(`${API_URL}/reservations/${args.id}`, args);
              result = updateRes.data;
              break;
            case 'delete_reservation':
              const delRes = await axios.delete(`${API_URL}/reservations/${args.id}`);
              result = delRes.data;
              break;
          }
        } catch (err: any) {
          result = { error: err.response?.data?.error || 'Error al ejecutar la operación' };
        }

        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: { result },
            id: call.id
          }
        });
      }

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

    return finalResponseText || response.text || 'No pude procesar tu solicitud.';
  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
}
