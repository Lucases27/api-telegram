import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Search, MessageSquare } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-zinc-900 text-white p-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Calendar size={20} />
          </div>
          ReservaBot
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/reservations" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <Calendar size={18} />
            <span className="hidden sm:inline">Reservas</span>
          </Link>
          <Link to="/search" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <Search size={18} />
            <span className="hidden sm:inline">Búsqueda</span>
          </Link>
          <Link to="/chat" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <MessageSquare size={18} />
            <span className="hidden sm:inline">Chat IA</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
