import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';

const MODULOS = {
  Equipos: 'Equipos',
  Asignaciones: 'Asignaciones',
  Celulares: 'Celulares',
  Nomenclaturas: 'Nomenclaturas',
  Descargas: 'Descargas',
  AdminPermisos: 'Admin de Permisos',
};

const ACCIONES = {
  CREATE: { label: 'Crear', color: 'green', icon: 'PlusOutline' },
  UPDATE: { label: 'Actualizar', color: 'blue', icon: 'PencilOutline' },
  DELETE: { label: 'Eliminar', color: 'red', icon: 'TrashOutline' },
  EXPORT: { label: 'Exportar', color: 'purple', icon: 'ArrowDownTrayOutline' },
  IMPORT: { label: 'Importar', color: 'indigo', icon: 'ArrowUpTrayOutline' },
  VIEW: { label: 'Ver', color: 'gray', icon: 'EyeOutline' },
  DOWNLOAD: { label: 'Descargar', color: 'cyan', icon: 'DownloadOutline' },
};

export default function AuditLog() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    modulo: '',
    accion: '',
    usuario: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // Obtener logs en tiempo real
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const logsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(logsList);
        
        // Extraer usuarios únicos
        const usuariosUnicos = [...new Set(logsList.map(log => log.userName))].filter(Boolean).sort();
        setUsuarios(usuariosUnicos);
      } catch (error) {
        console.error('Error loading audit logs:', error);
        showToast('Error al cargar la bitácora', 'error');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error in audit log listener:', error);
      showToast('Error en la conexión de datos', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const logsFiltrados = logs.filter(log => {
    const matchModulo = !filtros.modulo || log.module === filtros.modulo;
    const matchAccion = !filtros.accion || log.action === filtros.accion;
    const matchUsuario = !filtros.usuario || log.userName === filtros.usuario;
    
    // Filtro por fecha
    let matchFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      try {
        const logDate = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        const logTime = logDate.getTime();
        
        if (filtros.fechaInicio) {
          const fechaInicio = new Date(filtros.fechaInicio);
          fechaInicio.setHours(0, 0, 0, 0);
          matchFecha = matchFecha && logTime >= fechaInicio.getTime();
        }
        
        if (filtros.fechaFin) {
          const fechaFin = new Date(filtros.fechaFin);
          fechaFin.setHours(23, 59, 59, 999);
          matchFecha = matchFecha && logTime <= fechaFin.getTime();
        }
      } catch (e) {
        matchFecha = true;
      }
    }
    
    return matchModulo && matchAccion && matchUsuario && matchFecha;
  });

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('es-ES');
    } catch {
      return '-';
    }
  };

  const getColorAccion = (accion) => {
    return ACCIONES[accion]?.color || 'gray';
  };

  const getIconoAccion = (accion) => {
    return ACCIONES[accion]?.icon || 'QuestionMarkCircleOutline';
  };

  const getEtiquetaAccion = (accion) => {
    return ACCIONES[accion]?.label || accion;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {toast && <Toast {...toast} onClose={hideToast} />}
      
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Icon name="DocumentTextOutline" size="lg" color="#1f2937" />
            Bitácora de Actividades
          </h1>
          <p className="text-gray-600 mt-2">Registro de todas las operaciones realizadas en el sistema</p>
        </div>

        {/* Filtros */}
        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Filtro por Módulo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Módulo</label>
                <select
                  value={filtros.modulo}
                  onChange={(e) => setFiltros({...filtros, modulo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Todos los módulos</option>
                  {Object.values(MODULOS).map(mod => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Acción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Acción</label>
                <select
                  value={filtros.accion}
                  onChange={(e) => setFiltros({...filtros, accion: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Todas las acciones</option>
                  {Object.entries(ACCIONES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Usuario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
                <select
                  value={filtros.usuario}
                  onChange={(e) => setFiltros({...filtros, usuario: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Fecha Inicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Filtro por Fecha Fin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Botón Limpiar */}
              <div className="flex items-end">
                {(filtros.modulo || filtros.accion || filtros.usuario || filtros.fechaInicio || filtros.fechaFin) && (
                  <button
                    onClick={() => setFiltros({modulo: '', accion: '', usuario: '', fechaInicio: '', fechaFin: ''})}
                    className="w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium border border-red-200"
                  >
                    ✕ Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Logs */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin">
              <Icon name="ArrowPathOutline" size="lg" color="#3b82f6" />
            </div>
            <p className="text-gray-600 mt-4">Cargando bitácora...</p>
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Icon name="InformationCircleOutline" size="lg" color="#9ca3af" />
            <p className="text-gray-600 mt-4">
              {logs.length === 0 ? 'No hay registros de auditoría aún' : 'No hay resultados que coincidan con los filtros'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Fecha y Hora</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Usuario</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Módulo</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Acción</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Registro ID</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {logsFiltrados.map((log, index) => (
                    <tr 
                      key={log.id || index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-900 font-medium whitespace-nowrap">
                        {formatearFecha(log.timestamp)}
                      </td>
                      <td className="p-4 text-gray-600">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {log.userName || 'Sistema'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                          {log.module}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full flex items-center gap-1.5 w-fit text-xs font-medium bg-${getColorAccion(log.action)}-50 text-${getColorAccion(log.action)}-700`}>
                          <Icon name={getIconoAccion(log.action)} size="sm" />
                          {getEtiquetaAccion(log.action)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-xs">
                        {log.recordId || '-'}
                      </td>
                      <td className="p-4 text-gray-600">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 font-medium">
                            Ver detalles
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                            {Object.keys(log.details || {}).length > 0 ? JSON.stringify(log.details, null, 2) : 'Sin detalles adicionales'}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{logsFiltrados.length}</span> de <span className="font-semibold">{logs.length}</span> registros
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
