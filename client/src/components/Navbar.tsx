import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Search, MessageSquare, UtensilsCrossed } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

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

      <div className="p-6 border-t border-surface-100">
        <div className="bg-surface-50 rounded-xl p-4 border border-surface-200/50">
          <p className="text-xs text-surface-500 font-medium mb-2">Powered by</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-inner">
               <span className="text-[10px] text-white font-bold">AI</span>
            </div>
            <span className="text-sm font-semibold text-surface-700">Gemini</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
