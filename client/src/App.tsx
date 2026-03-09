import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Search from './pages/Search';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={firebaseUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={firebaseUser ? <Navigate to="/" replace /> : <Register />} />

      {/* Protected routes with Navbar layout */}
      <Route path="/*" element={
        <ProtectedRoute>
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
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
