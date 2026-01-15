import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { userPermissions, currentUser } = useAuth();
  const [stats, setStats] = useState({
    equipos: 0,
    celulares: 0,
    nomenclaturas: 0,
    asignaciones: 0,
    disponibles: 0,
    entregas: 0,
    descargos: 0
  });
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadStats();
    
    // Recargar estadísticas cuando el usuario vuelve a la pestaña/ventana
    window.addEventListener('focus', loadStats);
    return () => window.removeEventListener('focus', loadStats);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const equiposSnapshot = await getDocs(collection(db, 'equipos'));
      const celularesSnapshot = await getDocs(collection(db, 'celulares'));
      const nomenclaturaSnapshot = await getDocs(collection(db, 'nomenclaturas'));
      const asignacionesSnapshot = await getDocs(collection(db, 'asignaciones'));
      const descargosSnapshot = await getDocs(collection(db, 'descargos'));

      const equiposList = equiposSnapshot.docs.map(doc => doc.data());
      const celularesList = celularesSnapshot.docs.map(doc => doc.data());
      const asignacionesList = asignacionesSnapshot.docs.map(doc => doc.data());

      // Contar equipos disponibles (usando el estado de la tabla de equipos como fuente de verdad)
      const equiposDisponibles = equiposList.filter(e => !e.asignado || e.estado === 'disponible').length;
      // Contar celulares disponibles (usando el estado de la tabla de celulares como fuente de verdad)
      const celularesDisponibles = celularesList.filter(c => !c.asignado || c.estado === 'disponible').length;

      const totalDisponibles = equiposDisponibles + celularesDisponibles;

      // Contar entregas: igual al total de asignaciones
      const entregasCount = asignacionesList.length;

      setStats({
        equipos: equiposList.length,
        celulares: celularesList.length,
        nomenclaturas: nomenclaturaSnapshot.size,
        asignaciones: asignacionesSnapshot.size,
        disponibles: totalDisponibles,
        entregas: entregasCount,
        descargos: descargosSnapshot.size
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    try {
      setIsClearing(true);
      const collections = ['equipos', 'celulares', 'nomenclaturas', 'asignaciones', 'entregas', 'descargos'];
      
      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        for (const doc of querySnapshot.docs) {
          await deleteDoc(doc.ref);
        }
      }
      
      setShowClearConfirm(false);
      loadStats();
      alert('✓ Base de datos limpiada exitosamente');
    } catch (error) {
      console.error('Error al limpiar base de datos:', error);
      alert('✗ Error al limpiar la base de datos: ' + error.message);
    } finally {
      setIsClearing(false);
    }
  };

  const statCards = [
    { title: 'Equipos', value: stats.equipos, icon: 'LaptopOutline', bg: 'bg-blue-50', textColor: 'text-blue-600', gradStart: '#60a5fa', gradEnd: '#3b82f6', path: '/equipos', moduloId: 'equipos' },
    { title: 'Celulares', value: stats.celulares, icon: 'PhonePortraitOutline', bg: 'bg-green-50', textColor: 'text-green-600', gradStart: '#34d399', gradEnd: '#10b981', path: '/celulares', moduloId: 'celulares' },
    { title: 'Nomenclaturas', value: stats.nomenclaturas, icon: 'PeopleOutline', bg: 'bg-purple-50', textColor: 'text-purple-600', gradStart: '#c084fc', gradEnd: '#a855f7', path: '/nomenclaturas', moduloId: 'nomenclaturas' },
    { title: 'Asignaciones', value: stats.asignaciones, icon: 'LinkOutline', bg: 'bg-yellow-50', textColor: 'text-yellow-600', gradStart: '#fcd34d', gradEnd: '#f59e0b', path: '/asignacion', moduloId: 'asignacion' },
    { title: 'Disponibles', value: stats.disponibles, icon: 'CheckmarkCircleOutline', bg: 'bg-pink-50', textColor: 'text-pink-600', gradStart: '#f472b6', gradEnd: '#ec4899', path: '/equipos-disponibles', moduloId: 'equipos-disponibles' },
    { title: 'Entregas', value: stats.entregas, icon: 'DocumentOutline', bg: 'bg-orange-50', textColor: 'text-orange-600', gradStart: '#fb923c', gradEnd: '#f97316', path: '/hoja-entrega', moduloId: 'hoja-entrega' },
    { title: 'Descargos', value: stats.descargos, icon: 'TrashOutline', bg: 'bg-red-50', textColor: 'text-red-600', gradStart: '#f87171', gradEnd: '#ef4444', path: '/descargo', moduloId: 'descargo' },
  ];

  // Acciones rápidas disponibles
  const allQuickActions = [
    { id: 'equipos', path: '/equipos?form=true', title: 'Registrar Equipo', description: 'Agregar nuevo dispositivo', icon: 'AddOutline', bg: 'bg-blue-100', color: 'primary', hoverColor: 'bg-blue-200', borderColor: 'hover:border-blue-300' },
    { id: 'celulares', path: '/celulares?form=true', title: 'Registrar Celular', description: 'Agregar nuevo teléfono', icon: 'AddOutline', bg: 'bg-green-100', color: '#10b981', hoverColor: 'bg-green-200', borderColor: 'hover:border-green-300' },
    { id: 'asignacion', path: '/asignacion?form=true', title: 'Registrar Asignación', description: 'Vincular bienes a usuarios', icon: 'AddOutline', bg: 'bg-purple-100', color: '#a855f7', hoverColor: 'bg-purple-200', borderColor: 'hover:border-purple-300' },
  ];

  // Filtrar acciones rápidas según permisos
  const getVisibleQuickActions = () => {
    const isAdmin = userPermissions?.isAdmin || currentUser?.email === 'walindotel@gmail.com';
    
    if (isAdmin) {
      return allQuickActions; // Los admins ven todas las acciones
    }

    // Los usuarios no-admin solo ven las acciones de módulos permitidos
    const modulosPermitidos = userPermissions?.modulos || [];
    return allQuickActions.filter(action => 
      modulosPermitidos.includes(action.id)
    );
  };

  // Filtrar tarjetas de estadísticas según permisos
  const getVisibleStatCards = () => {
    const isAdmin = userPermissions?.isAdmin || currentUser?.email === 'walindotel@gmail.com';
    
    if (isAdmin) {
      return statCards; // Los admins ven todas las tarjetas
    }

    // Los usuarios no-admin solo ven las tarjetas de módulos permitidos
    const modulosPermitidos = userPermissions?.modulos || [];
    return statCards.filter(card => 
      modulosPermitidos.includes(card.moduloId)
    );
  };

  const quickActions = getVisibleQuickActions();
  const visibleStatCards = getVisibleStatCards();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 font-manrope mb-2">Dashboard</h1>
          <p className="text-gray-600 text-base">Bienvenido al sistema de gestión de inventario</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-base">Cargando estadísticas...</p>
            </div>
          ) : visibleStatCards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Icon name="PeopleOutline" size="lg" color="gray" className="mx-auto mb-4" />
              <p className="text-gray-500 text-base">No tienes módulos asignados. Contacta al administrador.</p>
            </div>
          ) : (
            visibleStatCards.map((card, idx) => (
              <Link
                key={idx}
                to={card.path}
                className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`card-saas ${card.bg} border-2 border-transparent hover:border-gray-200`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${card.gradStart}, ${card.gradEnd})`
                      }}
                    >
                      <Icon name={card.icon} size="md" color="white" />
                    </div>
                    <Icon name="ChevronForwardOutline" size="sm" color="neutral" className="group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-gray-600 text-sm font-semibold mb-1">{card.title}</h3>
                  <p className={`text-4xl font-bold ${card.textColor} font-manrope`}>{card.value}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 font-manrope mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map(action => (
              <Link key={action.id} to={action.path} className={`group px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl ${action.borderColor} hover:shadow-md transition-all flex items-center gap-3`}>
                <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center group-hover:${action.hoverColor} transition-colors`}>
                  <Icon name={action.icon} size="sm" color={action.color} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-saas bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-900 font-manrope mb-2 flex items-center gap-2">
                <Icon name="InformationCircleOutline" size="md" color="#1e3a8a" />
                Módulos Disponibles
              </h3>
              <p className="text-blue-700 text-sm">Tu sistema tiene acceso a estos módulos:</p>
            </div>
            <div className="space-y-2">
              <p className="text-blue-600 text-sm">• <span className="font-semibold">Equipos</span> - Gestión de dispositivos</p>
              <p className="text-blue-600 text-sm">• <span className="font-semibold">Celulares</span> - Gestión de teléfonos</p>
              <p className="text-blue-600 text-sm">• <span className="font-semibold">Nomenclaturas</span> - Base de datos de usuarios</p>
              <p className="text-blue-600 text-sm">• <span className="font-semibold">Asignaciones</span> - Vinculación de bienes</p>
              <p className="text-blue-600 text-sm">• <span className="font-semibold">Entregas</span> - Generación de hojas</p>
            </div>
          </div>

          <div className="card-saas bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-green-900 font-manrope mb-2 flex items-center gap-2">
                <Icon name="CheckmarkCircleOutline" size="md" color="#15803d" />
                Tips de Uso
              </h3>
              <p className="text-green-700 text-sm">Consejos para optimizar tu experiencia:</p>
            </div>
            <div className="space-y-2">
              <p className="text-green-600 text-sm">• Registra todos tus equipos antes de hacer asignaciones</p>
              <p className="text-green-600 text-sm">• Usa descripciones claras en los campos de especificaciones</p>
              <p className="text-green-600 text-sm">• Guarda copias de las hojas de entrega generadas</p>
              <p className="text-green-600 text-sm">• Mantén actualizado el estado y condición de los equipos</p>
              <p className="text-green-600 text-sm">• Exporta datos regularmente para respaldo</p>
            </div>
          </div>
        </div>

       {/* Admin Section - Oculto */}
        {/* <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Administración</h2>
          <div className="card-saas bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 font-manrope mb-2 flex items-center gap-2">
                  <Icon name="TrashOutline" size="md" color="#991b1b" />
                  Limpiar Base de Datos
                </h3>
                <p className="text-red-700 text-sm mb-4">Elimina todos los registros del sistema. <span className="font-semibold">Esta acción no se puede deshacer.</span></p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearing}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Icon name="TrashOutline" size="sm" color="white" />
                {isClearing ? 'Limpiando...' : 'Limpiar'}
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Clear Confirmation Modal - Oculto */}
      {/* {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="AlertCircleOutline" size="md" color="#991b1b" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">⚠️ Confirmar eliminación</h2>
            </div>
            
            <p className="text-gray-700 text-sm mb-2">Esta acción eliminará <span className="font-semibold">TODOS</span> los registros de:</p>
            <ul className="text-gray-600 text-sm space-y-1 mb-6 pl-4">
              <li>• Equipos ({stats.equipos})</li>
              <li>• Celulares ({stats.celulares})</li>
              <li>• Nomenclaturas ({stats.nomenclaturas})</li>
              <li>• Asignaciones ({stats.asignaciones})</li>
              <li>• Entregas ({stats.entregas})</li>
              <li>• Descargos ({stats.descargos})</li>
            </ul>

            <p className="text-red-700 font-semibold text-sm mb-6">⚠️ Esta acción NO se puede deshacer.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={clearAllData}
                disabled={isClearing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isClearing ? 'Limpiando...' : 'Eliminar Todo'}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
