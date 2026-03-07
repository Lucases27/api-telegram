import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Search from './pages/Search';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="flex bg-surface-50 min-h-screen">
      <Navbar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto w-full transition-all">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/search" element={<Search />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
