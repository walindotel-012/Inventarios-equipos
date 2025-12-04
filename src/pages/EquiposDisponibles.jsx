import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import { useToastManager } from '../hooks/useToastManager';

const TIPOS_DISPOSITIVOS = [
  'Monitor',
  'CPU',
  'Laptop',
  'UPS',
  'Switch',
  'Impresora',
  'Scanner',
  'Teléfono IP',
  'Headset',
  'Regleta',
  'Bocina',
  'Base para monitor',
  'Teclado',
  'Mouse',
  'Pistola (scanner)',
  'Wifi',
  'Gabinete',
  'Cámara',
  'NVR',
  'Cash Drawer',
  'Cable de Red'
];

export default function EquiposDisponibles() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [equipos, setEquipos] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos', 'equipos', 'celulares'
  const [tipoEspecifico, setTipoEspecifico] = useState(''); // Filtro para tipo específico de equipo o celular

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar equipos
      const equiposSnapshot = await getDocs(collection(db, 'equipos'));
      const equiposList = equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'equipo',
        ...doc.data()
      }));
      
      // Cargar celulares
      const celularesSnapshot = await getDocs(collection(db, 'celulares'));
      const celularesList = celularesSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'celular',
        ...doc.data()
      }));
      
      // Cargar asignaciones para identificar qué está asignado
      const asignacionesSnapshot = await getDocs(collection(db, 'asignaciones'));
      const asignacionesList = asignacionesSnapshot.docs.map(doc => doc.data());
      
      setEquipos(equiposList);
      setCelulares(celularesList);
      setAsignaciones(asignacionesList);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear un set de códigos/seriales asignados para búsqueda rápida y eficiente
  const codigosAsignados = new Set(asignaciones.map(a => a.codActivoFijo).filter(Boolean));
  const serialesAsignados = new Set(asignaciones.map(a => a.sn).filter(Boolean));
  const serialesCelularesAsignados = new Set(asignaciones.map(a => a.serialCelular).filter(Boolean));

  // Obtener equipos disponibles (no asignados)
  const equiposDisponibles = equipos.filter(equipo => {
    // Un equipo es disponible si su código Y serial NO están en los asignados
    const estaAsignado = codigosAsignados.has(equipo.codActivoFijo) && serialesAsignados.has(equipo.sn);
    return !estaAsignado;
  });

  // Obtener celulares disponibles (no asignados)
  const celularesDisponibles = celulares.filter(celular => {
    // Un celular es disponible si su serial NO está en los asignados
    const estaAsignado = serialesCelularesAsignados.has(celular.serial);
    return !estaAsignado;
  });

  // Filtrar según tipo seleccionado y tipo específico
  let dataFiltrada = [];
  if (tipoFiltro === 'todos') {
    dataFiltrada = [...equiposDisponibles, ...celularesDisponibles];
  } else if (tipoFiltro === 'equipos') {
    dataFiltrada = equiposDisponibles;
  } else if (tipoFiltro === 'celulares') {
    dataFiltrada = celularesDisponibles;
  }

  // Aplicar filtro de tipo específico
  if (tipoEspecifico) {
    dataFiltrada = dataFiltrada.filter(item => {
      if (item.tipo === 'equipo') {
        return item.tipoEquipo === tipoEspecifico;
      } else if (item.tipo === 'celular') {
        return item.marca === tipoEspecifico;
      }
      return false;
    });
  }

  // Aplicar búsqueda
  dataFiltrada = dataFiltrada.filter(item => {
    const termLower = searchTerm.toLowerCase();
    const codigo = item.codActivoFijo || item.serial || '';
    const serial = item.sn || item.serial || '';
    
    return (
      codigo.toLowerCase().includes(termLower) ||
      serial.toLowerCase().includes(termLower)
    );
  });

  // Columnas para equipos
  const columnasEquipo = [
    { key: 'codActivoFijo', label: 'Código' },
    { key: 'tipoEquipo', label: 'Tipo' },
    { key: 'condicion', label: 'Condición' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'sn', label: 'Serial' },
    { key: 'disco', label: 'Disco' },
    { key: 'memoria', label: 'Memoria' },
    { key: 'procesador', label: 'Procesador' },
  ];

  // Columnas para celulares
  const columnasCelular = [
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'condicion', label: 'Condición' },
    { key: 'restriccion', label: 'Restricción' },
    { key: 'serial', label: 'Serial' },
    { key: 'imei', label: 'IMEI' },
    { key: 'numero', label: 'Número' },
    { key: 'plan', label: 'Plan' },
  ];

  // Seleccionar columnas según tipo
  let columnasAMostrar = [];
  if (tipoFiltro === 'todos') {
    columnasAMostrar = [
      { key: 'tipo', label: 'Tipo' },
      ...columnasEquipo,
    ];
  } else if (tipoFiltro === 'equipos') {
    columnasAMostrar = columnasEquipo;
  } else if (tipoFiltro === 'celulares') {
    columnasAMostrar = columnasCelular;
  }

  const renderCell = (item, key) => {
    const value = item[key];
    if (key === 'tipo') {
      return item.tipo === 'equipo' ? '💻 Equipo' : '📱 Celular';
    }
    return value || '-';
  };

  // Obtener opciones dinámicas para el filtro de tipo específico
  const getOpcionesTipoEspecifico = () => {
    if (tipoFiltro === 'equipos') {
      // Obtener tipos únicos de equipos disponibles
      const tipos = new Set(equiposDisponibles.map(e => e.tipoEquipo).filter(Boolean));
      return Array.from(tipos).sort();
    } else if (tipoFiltro === 'celulares') {
      // Obtener marcas únicas de celulares disponibles
      const marcas = new Set(celularesDisponibles.map(c => c.marca).filter(Boolean));
      return Array.from(marcas).sort();
    }
    return [];
  };

  const opcionesTipoEspecifico = getOpcionesTipoEspecifico();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Equipos Disponibles</h1>
          <p className="text-gray-600 text-base">Visualiza todos los equipos y celulares sin asignar</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros y Controles */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Tipo Principal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
            <select
              value={tipoFiltro}
              onChange={(e) => {
                setTipoFiltro(e.target.value);
                setTipoEspecifico(''); // Resetear filtro específico
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="todos">Todos (Equipos y Celulares)</option>
              <option value="equipos">Solo Equipos</option>
              <option value="celulares">Solo Celulares</option>
            </select>
          </div>

          {/* Selector de Tipo Específico (dinámico) */}
          {(tipoFiltro === 'equipos' || tipoFiltro === 'celulares') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {tipoFiltro === 'equipos' ? 'Seleccionar tipo de equipo' : 'Seleccionar marca de celular'}
              </label>
              <select
                value={tipoEspecifico}
                onChange={(e) => setTipoEspecifico(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Ver todos</option>
                {opcionesTipoEspecifico.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar por Código o Serial</label>
            <input
              type="text"
              placeholder="Ej: ATM001 o ABC123456..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Resumen de Disponibilidad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card-saas bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Disponibles</p>
                <p className="text-3xl font-bold text-blue-600">{dataFiltrada.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="card-saas bg-green-50 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Equipos Disponibles</p>
                <p className="text-3xl font-bold text-green-600">
                  {tipoFiltro === 'todos' || tipoFiltro === 'equipos'
                    ? dataFiltrada.filter(d => d.tipo === 'equipo').length
                    : '-'}
                </p>
              </div>
              <div className="text-4xl">💻</div>
            </div>
          </div>

          <div className="card-saas bg-purple-50 border-l-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Celulares Disponibles</p>
                <p className="text-3xl font-bold text-purple-600">
                  {tipoFiltro === 'todos' || tipoFiltro === 'celulares'
                    ? dataFiltrada.filter(d => d.tipo === 'celular').length
                    : '-'}
                </p>
              </div>
              <div className="text-4xl">📱</div>
            </div>
          </div>
        </div>

        {/* Grid de Datos */}
        <div className="card-saas overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-gray-600 mt-4">Cargando datos...</p>
            </div>
          ) : dataFiltrada.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-600 text-lg">No hay equipos disponibles con los filtros seleccionados</p>
              {searchTerm && (
                <p className="text-gray-500 text-sm mt-2">Intenta cambiar los términos de búsqueda</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {columnasAMostrar.map(col => (
                      <th
                        key={col.key}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataFiltrada.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      {columnasAMostrar.map(col => (
                        <td
                          key={`${item.id}-${col.key}`}
                          className="px-6 py-4 text-sm text-gray-900"
                        >
                          {renderCell(item, col.key)}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => {
                            // Copiar a portapapeles
                            const serial = item.sn || item.serial;
                            navigator.clipboard.writeText(serial);
                            showToast('Serial copiado al portapapeles', 'success');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          📋 Copiar Serial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {dataFiltrada.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Mostrando {dataFiltrada.length} de {equiposDisponibles.length + celularesDisponibles.length} equipos disponibles</span>
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
