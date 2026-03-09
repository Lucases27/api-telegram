import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Search, MessageSquare, UtensilsCrossed, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { appUser, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reservations', label: 'Reservas', icon: Calendar },
    { path: '/search', label: 'Búsqueda', icon: Search },
    { path: '/chat', label: 'Chat IA', icon: MessageSquare },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-surface-200 shadow-sm z-50 flex flex-col">
      <div className="p-6 border-b border-surface-100 flex items-center gap-3">
        <div className="bg-primary-500 text-white p-2 rounded-xl shadow-lg shadow-primary-500/30">
          <UtensilsCrossed size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl text-surface-900 leading-tight">GourmetBot</h1>
          <p className="text-xs text-surface-500 font-medium">Gestión de Reservas</p>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'
                }`} 
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-surface-100 space-y-3">
        {appUser && (
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow text-white flex-shrink-0">
                <User size={14} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-surface-900 truncate">{appUser.name}</p>
                <p className="text-xs text-surface-500 truncate">{appUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Shield size={12} className={appUser.role === 'admin' ? 'text-purple-600' : 'text-blue-500'} />
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${appUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {appUser.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-surface-500 hover:text-red-600 transition-colors text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-50"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
