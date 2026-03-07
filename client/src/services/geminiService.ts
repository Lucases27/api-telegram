import axios from 'axios';

const API_URL = '/api';

export async function chatWithIA(message: string) {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message });
    return response.data.reply;
  } catch (error: any) {
    console.error('Chat Error:', error);
    throw new Error(error.response?.data?.error || 'Error al procesar el chat con la IA');
  }
}
