import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';

const API_URL = 'http://localhost:3001/api';

const Search = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', date: '' });
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.date) params.append('date', filters.date);
      
      const res = await axios.get(`${API_URL}/reservations?${params.toString()}`);
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (filters.search || filters.date) {
        fetchResults();
      } else if (hasSearched) {
          fetchResults(); // Fetch all if cleared
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Búsqueda y Filtros</h1>
        <p className="text-surface-500 mt-1">Encuentra reservas específicas rápidamente</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre de cliente..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-surface-50 focus:bg-white"
            />
          </div>

          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-surface-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div>
        {loading ? (
             <div className="flex justify-center p-12">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {hasSearched && reservations.length === 0 ? (
                <div className="col-span-full bg-surface-50 border border-surface-200 rounded-2xl p-12 text-center text-surface-500">
                  <SearchIcon className="mx-auto h-12 w-12 text-surface-300 mb-4" />
                  <p className="font-medium text-lg text-surface-900">No se encontraron resultados</p>
                  <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
                </div>
              ) : (
                reservations.map((reserva) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={reserva.id}
                    className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <CalendarIcon size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-surface-900">{reserva.name}</h3>
                            <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded-md">
                                #{reserva.id}
                            </span>
                        </div>
                        <div className="space-y-2 text-surface-600 text-sm">
                            <p className="flex justify-between">
                                <span className="font-medium">Restaurante:</span>
                                <span>{reserva.restaurantName}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium">Fecha:</span>
                                <span>{reserva.date}</span>
                            </p>
                        </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
        )}
      </div>

    </motion.div>
  );
};

export default Search;
