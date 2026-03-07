import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Calendar, User, Store, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function Search() {
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    date: '',
  });

  const fetchResults = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.date) params.append('date', filters.date);
      
      const res = await axios.get(`/api/reservations?${params.toString()}`);
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filters]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">Búsqueda y Filtros</h1>
        <p className="text-zinc-500">Consulta reservas con filtros combinados.</p>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <SearchIcon size={14} /> Buscar por nombre
          </label>
          <input 
            type="text"
            placeholder="Ej: Juan..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Calendar size={14} /> Filtrar por fecha
          </label>
          <input 
            type="date"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </div>
        <button 
          onClick={() => setFilters({ search: '', date: '' })}
          className="px-6 py-3 rounded-xl font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all flex items-center gap-2"
        >
          <Filter size={18} />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.length > 0 ? (
          reservations.map((res: any) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={res.id}
              className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <User size={20} />
                </div>
                <span className="text-xs font-mono text-zinc-400">#{res.id}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{res.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Store size={14} />
                  {res.restaurantName}
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Calendar size={14} />
                  {res.date}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
              <SearchIcon size={32} />
            </div>
            <p className="text-zinc-400">No se encontraron reservas con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
