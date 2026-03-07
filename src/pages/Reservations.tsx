import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, User, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<any>(null);
  const [formData, setFormData] = useState({
    restaurantId: '',
    name: '',
    date: '',
  });

  const fetchReservations = async () => {
    try {
      const res = await axios.get('/api/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/api/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchRestaurants();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingRes) {
        await axios.put(`/api/reservations/${editingRes.id}`, formData);
      } else {
        await axios.post('/api/reservations', formData);
      }
      setIsModalOpen(false);
      setEditingRes(null);
      setFormData({ restaurantId: '', name: '', date: '' });
      fetchReservations();
    } catch (err) {
      alert('Error al guardar reserva');
    }
  };

  const handleEdit = (res: any) => {
    setEditingRes(res);
    setFormData({
      restaurantId: res.restaurantId.toString(),
      name: res.name,
      date: res.date,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      fetchReservations();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">Reservas</h1>
          <p className="text-zinc-500">Gestiona todas las reservas del sistema.</p>
        </div>
        <button 
          onClick={() => { setEditingRes(null); setFormData({ restaurantId: '', name: '', date: '' }); setIsModalOpen(true); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={20} />
          Nueva Reserva
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-bottom border-zinc-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Restaurante</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {reservations.map((res: any) => (
              <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-500 font-mono">#{res.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                      <User size={14} />
                    </div>
                    <span className="font-medium text-zinc-900">{res.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Store size={14} />
                    {res.restaurantName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <CalendarIcon size={14} />
                    {res.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(res)} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(res.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">{editingRes ? 'Editar Reserva' : 'Nueva Reserva'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Restaurante</label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                  >
                    <option value="">Selecciona un restaurante</option>
                    {restaurants.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre del Cliente</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Fecha</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {editingRes ? 'Actualizar' : 'Crear Reserva'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
