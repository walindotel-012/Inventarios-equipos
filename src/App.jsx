import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Nomenclaturas from './pages/Nomenclaturas';
import Asignacion from './pages/Asignacion';
import HojaEntrega from './pages/HojaEntrega';
import Descargo from './pages/Descargo';
import Celulares from './pages/Celulares';
import EquiposDisponibles from './pages/EquiposDisponibles';
import IconShowcase from './pages/IconShowcase';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-white font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/equipos" element={<Equipos />} />
                      <Route path="/celulares" element={<Celulares />} />
                      <Route path="/nomenclaturas" element={<Nomenclaturas />} />
                      <Route path="/asignacion" element={<Asignacion />} />
                      <Route path="/equipos-disponibles" element={<EquiposDisponibles />} />
                      <Route path="/hoja-entrega" element={<HojaEntrega />} />
                      <Route path="/descargo" element={<Descargo />} />
                      <Route path="/icon-showcase" element={<IconShowcase />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;