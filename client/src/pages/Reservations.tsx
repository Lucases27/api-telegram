import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = 'http://localhost:3001/api';

const Reservations = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, restaurantId: '', name: '', date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, restRes] = await Promise.all([
        axios.get(`${API_URL}/reservations`),
        axios.get(`${API_URL}/restaurants`),
      ]);
      setReservations(resRes.data);
      setRestaurants(restRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (formData.id) {
        await axios.put(`${API_URL}/reservations/${formData.id}`, formData);
      } else {
        await axios.post(`${API_URL}/reservations`, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error saving reservation');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        await axios.delete(`${API_URL}/reservations/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEdit = (reserva: any) => {
    setFormData({
      id: reserva.id,
      restaurantId: reserva.restaurantId,
      name: reserva.name,
      date: reserva.date,
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ id: null, restaurantId: '', name: '', date: '' });
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Reservas</h1>
          <p className="text-surface-500 mt-1">Gestiona todas las reservas del sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Nueva Reserva
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 border-b border-surface-200 text-sm font-semibold text-surface-600">
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Restaurante</th>
                <th className="p-4">Fecha</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-surface-500">
                    No hay reservas registradas.
                  </td>
                </tr>
              ) : (
                reservations.map((reserva) => (
                  <tr key={reserva.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                    <td className="p-4 text-surface-500">#{reserva.id}</td>
                    <td className="p-4 font-medium text-surface-900">{reserva.name}</td>
                    <td className="p-4 text-surface-700">
                      <span className="bg-surface-100 text-surface-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {reserva.restaurantName}
                      </span>
                    </td>
                    <td className="p-4 text-surface-600 font-medium">{reserva.date}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(reserva)}
                          className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(reserva.id)}
                          className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-surface-200"
            >
              <div className="p-6 border-b border-surface-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-surface-900">
                  {formData.id ? 'Editar Reserva' : 'Nueva Reserva'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-surface-400 hover:text-surface-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Restaurante</label>
                  <select
                    required
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    className="w-full border border-surface-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  >
                    <option value="">Selecciona un restaurante...</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-surface-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-surface-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-surface-200 text-surface-600 rounded-xl font-medium hover:bg-surface-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Reservations;
