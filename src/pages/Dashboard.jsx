import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Icon from '../components/Icon';

export default function Dashboard() {
  const [stats, setStats] = useState({
    equipos: 0,
    celulares: 0,
    nomenclaturas: 0,
    asignaciones: 0,
    disponibles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const equiposSnapshot = await getDocs(collection(db, 'equipos'));
      const celularesSnapshot = await getDocs(collection(db, 'celulares'));
      const nomenclaturaSnapshot = await getDocs(collection(db, 'nomenclaturas'));
      const asignacionesSnapshot = await getDocs(collection(db, 'asignaciones'));

      const totalEquipos = equiposSnapshot.size;
      const totalCelulares = celularesSnapshot.size;
      const asignacionesList = asignacionesSnapshot.docs.map(doc => doc.data());
      
      // Contar equipos asignados
      const equiposAsignados = asignacionesList.filter(a => a.sn && a.codActivoFijo).length;
      // Contar celulares asignados
      const celularesAsignados = asignacionesList.filter(a => a.serialCelular).length;

      const totalAsignaciones = asignacionesSnapshot.size;
      const totalDisponibles = (totalEquipos - equiposAsignados) + (totalCelulares - celularesAsignados);

      setStats({
        equipos: totalEquipos,
        celulares: totalCelulares,
        nomenclaturas: nomenclaturaSnapshot.size,
        asignaciones: totalAsignaciones,
        disponibles: Math.max(0, totalDisponibles)
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Equipos', value: stats.equipos, icon: 'LaptopOutline', bg: 'bg-blue-50', textColor: 'text-blue-600', gradStart: '#60a5fa', gradEnd: '#3b82f6', path: '/equipos' },
    { title: 'Celulares', value: stats.celulares, icon: 'PhonePortraitOutline', bg: 'bg-green-50', textColor: 'text-green-600', gradStart: '#34d399', gradEnd: '#10b981', path: '/celulares' },
    { title: 'Nomenclaturas', value: stats.nomenclaturas, icon: 'PeopleOutline', bg: 'bg-purple-50', textColor: 'text-purple-600', gradStart: '#c084fc', gradEnd: '#a855f7', path: '/nomenclaturas' },
    { title: 'Asignaciones', value: stats.asignaciones, icon: 'LinkOutline', bg: 'bg-yellow-50', textColor: 'text-yellow-600', gradStart: '#fcd34d', gradEnd: '#f59e0b', path: '/asignacion' },
    { title: 'Disponibles', value: stats.disponibles, icon: 'CheckmarkCircleOutline', bg: 'bg-pink-50', textColor: 'text-pink-600', gradStart: '#f472b6', gradEnd: '#ec4899', path: '/equipos-disponibles' },
  ];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-base">Cargando estadísticas...</p>
            </div>
          ) : (
            statCards.map((card, idx) => (
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
            <Link to="/equipos" className="group px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Icon name="AddOutline" size="sm" color="primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Registrar Equipo</p>
                <p className="text-sm text-gray-500">Agregar nuevo dispositivo</p>
              </div>
            </Link>

            <Link to="/celulares" className="group px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Icon name="AddOutline" size="sm" color="#10b981" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Registrar Celular</p>
                <p className="text-sm text-gray-500">Agregar nuevo teléfono</p>
              </div>
            </Link>

            <Link to="/nomenclaturas" className="group px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Icon name="AddOutline" size="sm" color="#a855f7" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Agregar Nomenclatura</p>
                <p className="text-sm text-gray-500">Nuevo nombre en el sistema</p>
              </div>
            </Link>
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
      </div>
    </div>
  );
}
