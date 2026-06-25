import { Link } from 'react-router-dom';
import Icon from '../Icon';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'GridOutline' },
  { path: '/equipos', label: 'Equipos', icon: 'LaptopOutline' },
  { path: '/celulares', label: 'Celulares', icon: 'PhonePortraitOutline' },
  { path: '/equipos-disponibles', label: 'Disponibles', icon: 'CheckmarkCircleOutline' },
  { path: '/accesorios', label: 'Accesorios', icon: 'BuildOutline' },
  { path: '/nomenclaturas', label: 'Nomenclaturas', icon: 'PersonOutline' },
  { path: '/asignacion', label: 'Asignaciones', icon: 'LinkOutline' },
  { path: '/usuarios', label: 'Usuarios', icon: 'PersonCircleOutline' },
  { path: '/hoja-entrega', label: 'Entregas', icon: 'DocumentTextOutline' },
  { path: '/descargo', label: 'Descargos', icon: 'ArchiveOutline' },
  { path: '/bitacora', label: 'Bitácora', icon: 'DocumentTextOutline' },
];

const adminItems = [
  { path: '/admin-permisos', label: 'Gestión de Permisos', icon: 'ShieldCheckOutline' },
];

export default function Sidebar({ activePath }) {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold">A</div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">AUTOMÍA</p>
            <p className="text-base font-semibold text-slate-900">Mueve tu mundo ahora</p>
          </div>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activePath === item.path ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon name={item.icon} size="sm" color={activePath === item.path ? '#0f172a' : '#6b7280'} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-5">
        <Link to="/soporte" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
          <Icon name="HelpCircleOutline" size="sm" color="neutral" />
          Soporte
        </Link>

        {adminItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activePath === item.path ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon name={item.icon} size="sm" color={activePath === item.path ? '#0f172a' : '#6b7280'} />
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
        >
          <Icon name="ExitOutline" size="sm" color="neutral" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
