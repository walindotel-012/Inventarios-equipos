import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipos from './pages/Equipos';
import Nomenclaturas from './pages/Nomenclaturas';
import Asignacion from './pages/Asignacion';
import Usuarios from './pages/Usuarios';
import HojaEntrega from './pages/HojaEntrega';
import Descargo from './pages/Descargo';
import Celulares from './pages/Celulares';
import Accesorios from './pages/Accesorios';
import EquiposDisponibles from './pages/EquiposDisponibles';
import IconShowcase from './pages/IconShowcase';
import AdminPermisos from './pages/AdminPermisos';
import Bitacora from './pages/Bitacora';
import UpdateAcesoriosPage from './pages/UpdateAcesoriosPage';
import Reportes from './pages/Reportes';
import Mantenimiento from './pages/Mantenimiento';
import Configuracion from './pages/Configuracion';
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
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/equipos" element={<Equipos />} />
                  <Route path="/celulares" element={<Celulares />} />
                  <Route path="/nomenclaturas" element={<Nomenclaturas />} />
                  <Route path="/asignacion" element={<Asignacion />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/equipos-disponibles" element={<EquiposDisponibles />} />
                  <Route path="/accesorios" element={<Accesorios />} />
                  <Route path="/hoja-entrega" element={<HojaEntrega />} />
                  <Route path="/descargo" element={<Descargo />} />
                  <Route path="/admin-permisos" element={<AdminPermisos />} />
                  <Route path="/bitacora" element={<Bitacora />} />
                  <Route path="/icon-showcase" element={<IconShowcase />} />
                  <Route path="/update-accesorios" element={<UpdateAcesoriosPage />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/mantenimiento" element={<Mantenimiento />} />
                  <Route path="/configuracion" element={<Configuracion />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;