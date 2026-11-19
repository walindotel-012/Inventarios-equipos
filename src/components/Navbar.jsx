import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import Icon from './Icon';

export default function Navbar() {
  const { currentUser, logout, userPermissions } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
      console.log('Foto cargada:', currentUser.photoURL);
    } else {
      console.log('No hay photoURL disponible', currentUser);
      setPhotoURL(null);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const allNavLinks = [
    { path: '/', label: 'Dashboard', icon: 'GridOutline', moduloId: null },
    { path: '/equipos', label: 'Equipos', icon: 'LaptopOutline', moduloId: 'equipos' },
    { path: '/celulares', label: 'Celulares', icon: 'PhonePortraitOutline', moduloId: 'celulares' },
    { path: '/equipos-disponibles', label: 'Disponibles', icon: 'CheckmarkCircleOutline', moduloId: 'equipos-disponibles' },
    { path: '/accesorios', label: 'Accesorios', icon: 'BuildOutline', moduloId: 'accesorios' },
    { path: '/nomenclaturas', label: 'Nomenclaturas', icon: 'PersonOutline', moduloId: 'nomenclaturas' },
    { path: '/asignacion', label: 'Asignaciones', icon: 'LinkOutline', moduloId: 'asignacion' },
    { path: '/usuarios', label: 'Usuarios', icon: 'PersonCircleOutline', moduloId: 'usuarios' },
    { path: '/hoja-entrega', label: 'Entregas', icon: 'DocumentOutline', moduloId: 'hoja-entrega' },
    { path: '/descargo', label: 'Descargos', icon: 'ArrowRedoOutline', moduloId: 'descargo' },
    { path: '/bitacora', label: 'Bitácora', icon: 'DocumentTextOutline', moduloId: 'bitacora', adminOnly: true },
  ];

  // Filtrar módulos según permisos del usuario
  const getVisibleLinks = () => {
    // Verificar si es admin (por permisos en BD o email específico)
    const isAdmin = userPermissions?.isAdmin || currentUser?.email === 'walindotel@gmail.com';
    
    if (isAdmin) {
      return allNavLinks; // Los admins ven todos los módulos
    }

    // Los usuarios no-admin solo ven los módulos permitidos
    const modulosPermitidos = userPermissions?.modulos || [];
    return allNavLinks.filter(link => 
      !link.adminOnly && (link.moduloId === null || modulosPermitidos.includes(link.moduloId))
    );
  };

  const navLinks = getVisibleLinks();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-[#f8f9fb]/95 backdrop-blur-sm">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Botón de Retroceso - Izquierda */}
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                title="Volver atrás"
                className="mr-2 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#714B67] shadow-sm transition hover:bg-[#F5EFF3]"
                aria-label="Volver atrás"
              >
                <Icon name="ArrowBackOutline" size="md" color="#714B67" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex min-h-11 flex-shrink-0 items-center gap-3 rounded-xl px-1">
              <img 
                src={import.meta.env.BASE_URL + 'logo.png'} 
                alt="AUTOMÍA Logo"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '36px',
                  display: 'block'
                }} 
              />
              <span className="hidden text-base font-bold text-slate-900 sm:inline">Gestión de activos</span>
            </Link>

            {/* User Section & Mobile Menu */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* User Profile - Desktop */}
              {currentUser && (
                <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5EFF3] text-[#714B67]">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt={currentUser?.displayName || 'Usuario'} 
                        className="w-full h-full object-cover"
                        onError={() => setPhotoURL(null)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#F5EFF3] text-xs font-bold text-[#714B67]">
                        {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{currentUser?.displayName || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                </div>
              )}

              {/* Logout Button - Desktop */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                  className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 sm:flex"
                aria-label="Cambiar tema"
              >
                {isDark ? (
                  <Icon name="SunnyOutline" size="md" color="#f59e0b" />
                ) : (
                  <Icon name="MoonOutline" size="md" color="#714B67" />
                )}
              </button>

              {/* Logout Button - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:flex"
              >
                Salir
              </button>

              {/* Mobile Menu Button - Hamburguesa con Icono */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
                aria-label="Abrir menú"
              >
                <Icon 
                  name={mobileMenuOpen ? 'CloseOutline' : 'MenuOutline'} 
                  size="md" 
                  color="neutral"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Drawer - Se ajusta automáticamente al contenido */}
      {mobileMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer - Posicionado en la esquina superior derecha */}
          <div className="fixed right-4 top-16 z-40 w-[calc(100vw-2rem)] max-w-sm animate-in rounded-2xl border border-slate-200 bg-white shadow-xl slide-in-from-top-2 duration-300 sm:right-6 lg:right-8">
            <div className="px-2 sm:px-3 py-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* Botón de Retroceso en Móvil */}
              {location.pathname !== '/' && (
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <button
                    onClick={() => {
                      navigate(-1);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-all duration-200"
                  >
                    <Icon name="ArrowBackOutline" size="sm" color="neutral" />
                    <span>Volver atrás</span>
                  </button>
                </div>
              )}

              {/* Módulos Section */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Módulos</p>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(link.path)
                          ? 'bg-[#F5EFF3] text-[#714B67] border-l-2 border-[#714B67] pl-2'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon 
                        name={link.icon}
                        size="sm"
                        color={isActive(link.path) ? '#714B67' : 'neutral'}
                      />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 my-3" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-all duration-200"
              >
                {isDark ? (
                  <>
                    <Icon name="SunnyOutline" size="sm" color="#f59e0b" />
                    <span>Cambiar a tema claro</span>
                  </>
                ) : (
                  <>
                    <Icon name="MoonOutline" size="sm" color="#6366f1" />
                    <span>Cambiar a tema oscuro</span>
                  </>
                )}
              </button>

              {/* Divider */}

              {/* Admin Panel */}
              {(userPermissions?.isAdmin || currentUser?.email === 'walindotel@gmail.com') && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Administración</p>
                  <Link
                    to="/admin-permisos"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/admin-permisos')
                        ? 'bg-red-50 text-red-600 border-l-2 border-red-600 pl-2'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon 
                      name="SettingsOutline"
                      size="sm"
                      color={isActive('/admin-permisos') ? '#dc2626' : 'neutral'}
                    />
                    <span>Gestión de Permisos</span>
                  </Link>
                  <div className="h-px bg-gray-100 my-3" />
                </div>
              )}

              {/* Divider */}

              {/* User Section */}
              {currentUser && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-400 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt={currentUser?.displayName || 'Usuario'} 
                          className="w-full h-full object-cover"
                          onError={() => setPhotoURL(null)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || '👤'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{currentUser?.displayName || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 text-xs font-bold transition-all duration-200 border border-red-200 flex items-center justify-center gap-1"
                  >
                    <span>🚪</span>
                    <span>Salir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>,
        document.getElementById('portal') || document.body
      )}
    </>
  );
}
