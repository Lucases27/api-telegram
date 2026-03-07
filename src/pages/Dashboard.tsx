import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Store, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRestaurants: 0,
    todayReservations: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, resRest] = await Promise.all([
          axios.get('/api/reservations'),
          axios.get('/api/restaurants'),
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const todayRes = resRes.data.filter((r: any) => r.date === today).length;

        setStats({
          totalReservations: resRes.data.length,
          totalRestaurants: resRest.data.length,
          todayReservations: todayRes,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">Panel General</h1>
        <p className="text-zinc-500">Métricas e indicadores de tu sistema de reservas.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          title="Total Reservas" 
          value={stats.totalReservations} 
          icon={<Calendar className="text-emerald-500" />} 
          delay={0.1}
        />
        <StatCard 
          title="Restaurantes" 
          value={stats.totalRestaurants} 
          icon={<Store className="text-blue-500" />} 
          delay={0.2}
        />
        <StatCard 
          title="Reservas Hoy" 
          value={stats.todayReservations} 
          icon={<TrendingUp className="text-orange-500" />} 
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <p className="text-zinc-400 text-sm italic">Próximamente: Gráficos de actividad.</p>
          <div className="mt-4 h-48 bg-zinc-50 rounded-xl flex items-center justify-center border border-dashed border-zinc-200">
            <TrendingUp className="text-zinc-300 w-12 h-12" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Restaurantes Populares</h2>
          <p className="text-zinc-400 text-sm italic">Próximamente: Ranking de restaurantes.</p>
          <div className="mt-4 h-48 bg-zinc-50 rounded-xl flex items-center justify-center border border-dashed border-zinc-200">
            <Store className="text-zinc-300 w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4"
    >
      <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-zinc-900">{value}</p>
      </div>
    </motion.div>
  );
}
