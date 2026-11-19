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
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex h-full min-h-screen flex-col justify-between bg-[#1B2438] px-4 py-6 text-white">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#714B67]">A</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/55">AUTOMÍA</p>
            <p className="text-sm font-semibold text-white">Gestión de activos</p>
          </div>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activePath === item.path ? 'bg-white text-[#1B2438] shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon name={item.icon} size="sm" color={activePath === item.path ? '#714B67' : '#cbd5e1'} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-5">

        {adminItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              activePath === item.path ? 'bg-white text-[#1B2438] shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon name={item.icon} size="sm" color={activePath === item.path ? '#714B67' : '#cbd5e1'} />
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Icon name="ExitOutline" size="sm" color="#cbd5e1" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
