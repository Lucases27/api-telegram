import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CalendarDays, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReservations: 0,
    todayReservations: 0,
    totalRestaurants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reservationsRes, restaurantsRes] = await Promise.all([
          api.get('/reservations'),
          api.get('/restaurants'),
        ]);

        const reservations = reservationsRes.data;
        const restaurants = restaurantsRes.data;

        const today = new Date().toISOString().split('T')[0];
        const todayRes = reservations.filter((r: any) => r.date === today);

        setStats({
          totalReservations: reservations.length,
          todayReservations: todayRes.length,
          totalRestaurants: restaurants.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Reservas',
      value: stats.totalReservations,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Reservas Hoy',
      value: stats.todayReservations,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Restaurantes Activos',
      value: stats.totalRestaurants,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-surface-500 mt-1">Bienvenido al sistema de gestión de reservas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500 mb-1">{card.title}</p>
                  <h3 className="text-3xl font-bold text-surface-900">{card.value}</h3>
                </div>
                <div className={`${card.bg} ${card.color} p-4 rounded-xl`}>
                  <Icon size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Decorative empty state to make it look premium */}
      <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-bold mb-2">Asistente IA Disponible</h2>
            <p className="text-primary-100 mb-6 leading-relaxed">
              Prueba nuestro chatbot impulsado por Gemini. Puedes gestionar reservas usando lenguaje natural, tal como lo harías con un asistente humano.
            </p>
            <button 
              onClick={() => window.location.href = '/chat'}
              className="bg-white text-primary-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-sm"
            >
              Probar Chat IA
            </button>
         </div>
         {/* Decorative circles */}
         <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
         <div className="absolute bottom-0 right-32 translate-y-1/2 w-48 h-48 bg-purple-500/30 rounded-full blur-xl"></div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
