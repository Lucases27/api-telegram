import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

const API_URL = 'http://localhost:3001/api';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '¡Hola! Soy tu asistente virtual de GourmetBot. Puedo ayudarte a consultar reservas, crear nuevas, modificarlas o cancelarlas. ¿En qué te puedo ayudar hoy?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: userMsg.text });
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: res.data.reply,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo. (' + (err.response?.data?.error || err.message) + ')',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('¿Estás seguro de que deseas limpiar el historial de chat?')) {
        setMessages([{
            id: 'welcome-reset',
            text: '¡Hola! Soy tu asistente virtual de GourmetBot. ¿En qué te puedo ayudar hoy?',
            sender: 'bot',
            timestamp: new Date(),
        }]);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight flex items-center gap-3">
            Asistente IA <span className="text-sm bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-md uppercase tracking-wider">Beta</span>
          </h1>
          <p className="text-surface-500 mt-1">Gestiona tus reservas conversando con nuestro asistente impulsado por Gemini.</p>
        </div>
        <button 
            onClick={clearChat}
            className="flex items-center gap-2 text-surface-400 hover:text-red-500 transition-colors bg-white px-3 py-2 rounded-lg border border-surface-200 shadow-sm"
        >
            <Trash2 size={16} /> <span className="text-sm font-medium">Limpiar</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-surface-200 flex flex-col overflow-hidden">
        {/* Messages Layout */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-surface-50/30">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={msg.id}
                className={`flex gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full shadow-sm text-white ${
                    isBot ? 'bg-gradient-to-br from-purple-500 to-primary-600' : 'bg-surface-800'
                }`}>
                  {isBot ? <Bot size={20} /> : <User size={20} />}
                </div>
                
                <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative ${
                    isBot 
                        ? 'bg-white border border-surface-200 text-surface-800 rounded-tl-sm' 
                        : 'bg-primary-600 text-white rounded-tr-sm'
                }`}>
                  {msg.text}
                  <span className={`block text-[10px] mt-2 font-medium opacity-70 ${isBot ? 'text-surface-400' : 'text-primary-200'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-primary-600 text-white shadow-sm">
                <Bot size={20} />
              </div>
              <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-surface-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej. Quiero reservar en Restaurante A para mañana a nombre de Carlos..."
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-4 bg-surface-50 border border-surface-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white outline-none transition disabled:opacity-75 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition shadow-sm"
            >
              <Send size={20} className={input.trim() && !isLoading ? 'translate-x-0.5' : ''} />
            </button>
          </form>
          <p className="text-center text-xs text-surface-400 mt-3 font-medium">
            AI can make mistakes. Consider verifying reservation details.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
