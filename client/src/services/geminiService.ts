import { api } from './api';

export async function chatWithIA(message: string) {
  try {
    const response = await api.post('/chat', { message });
    return response.data.reply;
  } catch (error: any) {
    console.error('Chat Error:', error);
    throw new Error(error.response?.data?.error || 'Error al procesar el chat con la IA');
  }
}
