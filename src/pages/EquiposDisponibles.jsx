import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';
import * as XLSX from 'xlsx';
import { getAccesorioIdentifiers, getAccesoriosFromAsignacion } from '../utils/accesorioState';

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
  const [accesorios, setAccesorios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos', 'equipos', 'celulares', 'accesorios'
  const [tipoEspecifico, setTipoEspecifico] = useState(''); // Filtro para tipo específico de equipo o celular
  const [searchModelo, setSearchModelo] = useState(''); // Filtro por modelo

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
      
      // Cargar accesorios
      const accesoriosSnapshot = await getDocs(collection(db, 'accesorios'));
      const accesoriosList = accesoriosSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'accesorio',
        ...doc.data()
      }));
      
      // Cargar asignaciones para identificar qué está asignado
      const asignacionesSnapshot = await getDocs(collection(db, 'asignaciones'));
      const asignacionesList = asignacionesSnapshot.docs.map(doc => doc.data());
      
      setEquipos(equiposList);
      setCelulares(celularesList);
      setAccesorios(accesoriosList);
      setAsignaciones(asignacionesList);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const normalizarIdentificador = (valor) => String(valor || '').trim().toUpperCase();

  const equiposAsignados = new Set(
    asignaciones.flatMap(asignacion => [
      asignacion.sn,
      asignacion.snSecundario,
      asignacion.codActivoFijo,
      asignacion.codActivoFijoSecundario,
    ].map(normalizarIdentificador).filter(Boolean))
  );
  const celularesAsignados = new Set(
    asignaciones.map(asignacion => normalizarIdentificador(asignacion.serialCelular)).filter(Boolean)
  );

  // Considerar también las asignaciones activas protege contra registros antiguos
  // donde el estado y el flag asignado no quedaron sincronizados.
  const equiposDisponibles = equipos.filter(equipo => {
    const identificadores = [equipo.sn, equipo.codActivoFijo]
      .map(normalizarIdentificador)
      .filter(Boolean);
    const estaAsignadoEnRegistro = identificadores.some(identifier => equiposAsignados.has(identifier));
    const estado = normalizarIdentificador(equipo.estado);

    return !estaAsignadoEnRegistro && equipo.asignado !== true && estado !== 'ASIGNADO';
  });

  // Obtener celulares disponibles: usar el estado del celular como fuente de verdad
  const celularesDisponibles = celulares.filter(celular => {
    const serial = normalizarIdentificador(celular.serial);
    const estaAsignadoEnRegistro = serial && celularesAsignados.has(serial);
    const estado = normalizarIdentificador(celular.estado);

    return !estaAsignadoEnRegistro && celular.asignado !== true && estado !== 'ASIGNADO';
  });

  // Las asignaciones activas son la fuente de verdad. Esto evita ocultar accesorios
  // cuyo flag quedo en "asignado" después de un descargo incompleto.
  const accesoriosAsignados = new Set(
    asignaciones.flatMap(asignacion =>
      getAccesoriosFromAsignacion(asignacion).flatMap(getAccesorioIdentifiers)
    )
  );

  const accesoriosDisponibles = accesorios.filter(accesorio => {
    const estaAsignado = getAccesorioIdentifiers(accesorio).some(identifier => accesoriosAsignados.has(identifier));
    const estado = String(accesorio.estado || '').trim().toLowerCase();
    const estaFueraDeServicio = ['mantenimiento', 'inactivo', 'retirado', 'dañado', 'danado'].includes(estado);
    return !estaAsignado && !estaFueraDeServicio;
  });

  // Filtrar según tipo seleccionado y tipo específico
  let dataFiltrada = [];
  if (tipoFiltro === 'todos') {
    dataFiltrada = [...equiposDisponibles, ...celularesDisponibles, ...accesoriosDisponibles];
  } else if (tipoFiltro === 'equipos') {
    dataFiltrada = equiposDisponibles;
  } else if (tipoFiltro === 'celulares') {
    dataFiltrada = celularesDisponibles;
  } else if (tipoFiltro === 'accesorios') {
    dataFiltrada = accesoriosDisponibles;
  }

  // Aplicar filtro de tipo específico
  if (tipoEspecifico) {
    dataFiltrada = dataFiltrada.filter(item => {
      if (item.tipo === 'equipo') {
        return item.tipoEquipo === tipoEspecifico;
      } else if (item.tipo === 'celular') {
        return item.marca === tipoEspecifico;
      } else if (item.tipo === 'accesorio') {
        return item.tipoAccesorio === tipoEspecifico || item.marca === tipoEspecifico;
      }
      return false;
    });
  }

  // Aplicar filtro de modelo
  if (searchModelo) {
    dataFiltrada = dataFiltrada.filter(item => {
      const modelo = (item.modelo || '').toLowerCase();
      return modelo.includes(searchModelo.toLowerCase());
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

  // Ordenar por código de activo fijo en orden ascendente
  dataFiltrada = dataFiltrada.sort((a, b) => {
    const codigoA = (a.codActivoFijo || a.serial || '').toUpperCase();
    const codigoB = (b.codActivoFijo || b.serial || '').toUpperCase();
    return codigoA.localeCompare(codigoB, 'es', { numeric: true });
  });

  // Columnas para equipos
  const columnasEquipo = [
    { key: 'codActivoFijo', label: 'Código' },
    { key: 'tipoEquipo', label: 'Tipo' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'sn', label: 'Serial' },
    { key: 'condicion', label: 'Condición' },
    { key: 'disco', label: 'Disco' },
    { key: 'memoria', label: 'Memoria' },
    { key: 'procesador', label: 'Procesador' },
    { key: 'so', label: 'SO' },
    { key: 'licencia', label: 'Licencia' },
  ];

  // Columnas para celulares
  const columnasCelular = [
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'serial', label: 'Serial' },
    { key: 'condicion', label: 'Condición' },
    { key: 'restriccion', label: 'Restricción' },
    { key: 'imei', label: 'IMEI' },
    { key: 'numero', label: 'Número' },
    { key: 'plan', label: 'Plan' },
  ];

  // Columnas para accesorios
  const columnasAccesorio = [
    { key: 'codigoActivoFijo', label: 'Código' },
    { key: 'tipoAccesorio', label: 'Tipo' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'serial', label: 'Serial' },
    { key: 'condicion', label: 'Condición' },
  ];

  // Seleccionar columnas según tipo
  let columnasAMostrar = [];
  if (tipoFiltro === 'todos') {
    columnasAMostrar = [
      { key: 'tipo', label: 'Tipo' },
      { key: 'codigo', label: 'Código' },
      { key: 'codActivoFijo', label: 'Código Activo' },
      { key: 'tipoEquipo', label: 'Tipo Equipo' },
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'serial', label: 'Serial' },
      { key: 'sn', label: 'S/N' },
      { key: 'condicion', label: 'Condición' },
      { key: 'restriccion', label: 'Restricción' },
      { key: 'imei', label: 'IMEI' },
      { key: 'numero', label: 'Número' },
      { key: 'disco', label: 'Disco' },
      { key: 'memoria', label: 'Memoria' },
      { key: 'procesador', label: 'Procesador' },
      { key: 'so', label: 'SO' },
      { key: 'licencia', label: 'Licencia' },
      { key: 'plan', label: 'Plan' },
    ];
  } else if (tipoFiltro === 'equipos') {
    columnasAMostrar = columnasEquipo;
  } else if (tipoFiltro === 'celulares') {
    columnasAMostrar = columnasCelular;
  } else if (tipoFiltro === 'accesorios') {
    columnasAMostrar = columnasAccesorio;
  }

  const renderCell = (item, key) => {
    const value = item[key];
    if (key === 'tipo') {
      if (item.tipo === 'equipo') {
        return <Icon name="LaptopOutline" size="sm" color="#0ea5e9" />;
      } else if (item.tipo === 'celular') {
        return <Icon name="PhonePortraitOutline" size="sm" color="#10b981" />;
      } else if (item.tipo === 'accesorio') {
        return <Icon name="Hammer" size="sm" color="#818cf8" />;
      }
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
    } else if (tipoFiltro === 'accesorios') {
      // Obtener marcas únicas de accesorios disponibles
      const marcas = new Set(accesoriosDisponibles.map(a => a.marca).filter(Boolean));
      return Array.from(marcas).sort();
    }
    return [];
  };

  const opcionesTipoEspecifico = getOpcionesTipoEspecifico();

  // Obtener opciones dinámicas para el filtro de modelo
  const getOpcionesModelo = () => {
    let dataBase = [];
    if (tipoFiltro === 'todos') {
      dataBase = [...equiposDisponibles, ...celularesDisponibles, ...accesoriosDisponibles];
    } else if (tipoFiltro === 'equipos') {
      dataBase = equiposDisponibles;
    } else if (tipoFiltro === 'celulares') {
      dataBase = celularesDisponibles;
    } else if (tipoFiltro === 'accesorios') {
      dataBase = accesoriosDisponibles;
    }

    if (tipoEspecifico) {
      dataBase = dataBase.filter(item => {
        if (item.tipo === 'equipo') {
          return item.tipoEquipo === tipoEspecifico;
        } else if (item.tipo === 'celular') {
          return item.marca === tipoEspecifico;
        } else if (item.tipo === 'accesorio') {
          return item.marca === tipoEspecifico;
        }
        return false;
      });
    }

    const modelos = new Set(dataBase.map(e => e.modelo).filter(Boolean));
    return Array.from(modelos).sort();
  };

  const opcionesModelo = getOpcionesModelo();

  const handleExportarExcel = () => {
    try {
      // Preparar datos para exportar
      const datosExportar = dataFiltrada.map(item => {
        if (item.tipo === 'equipo') {
          return {
            'Tipo': 'Equipo',
            'Código de Activo': item.codActivoFijo || '-',
            'Tipo de Equipo': item.tipoEquipo || '-',
            'Condición': item.condicion || '-',
            'Marca': item.marca || '-',
            'Modelo': item.modelo || '-',
            'Serial': item.sn || '-',
            'Disco': item.disco || '-',
            'Memoria': item.memoria || '-',
            'Procesador': item.procesador || '-',
            'SO': item.so || '-',
            'Licencia': item.licencia || '-',
          };
        } else if (item.tipo === 'celular') {
          return {
            'Tipo': 'Celular',
            'Marca': item.marca || '-',
            'Modelo': item.modelo || '-',
            'Condición': item.condicion || '-',
            'Restricción': item.restriccion || '-',
            'Serial': item.serial || '-',
            'IMEI': item.imei || '-',
            'Número': item.numero || '-',
            'Plan': item.plan || '-',
          };
        } else if (item.tipo === 'accesorio') {
          return {
            'Código': item.codigoActivoFijo || '-',
            'Tipo': item.tipoAccesorio || '-',
            'Marca': item.marca || '-',
            'Modelo': item.modelo || '-',
            'Serial': item.serial || '-',
            'Condición': item.condicion || '-',
          };
        }
      });

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Equipos Disponibles');

      // Ajustar ancho de columnas
      const maxWidth = 25;
      ws['!cols'] = Array(Object.keys(datosExportar[0] || {}).length).fill({ wch: maxWidth });

      // Descargar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Equipos_Disponibles_${fecha}.xlsx`);

      showToast('Excel exportado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      showToast('Error al exportar a Excel', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Equipos Disponibles</h1>
          <p className="text-gray-600 text-base">Visualiza todos los equipos y celulares sin asignar</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros y Controles */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Selector de Tipo Principal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
            <select
              value={tipoFiltro}
              onChange={(e) => {
                setTipoFiltro(e.target.value);
                setTipoEspecifico(''); // Resetear filtro específico
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="todos">Todos (Equipos, Celulares y Accesorios)</option>
              <option value="equipos">Solo Equipos</option>
              <option value="celulares">Solo Celulares</option>
              <option value="accesorios">Solo Accesorios</option>
            </select>
          </div>

          {/* Selector de Tipo Específico (dinámico) */}
          {(tipoFiltro === 'equipos' || tipoFiltro === 'celulares' || tipoFiltro === 'accesorios') && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {tipoFiltro === 'equipos' ? 'Seleccionar tipo de equipo' : tipoFiltro === 'celulares' ? 'Seleccionar marca de celular' : 'Seleccionar marca de accesorio'}
              </label>
              <select
                value={tipoEspecifico}
                onChange={(e) => setTipoEspecifico(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
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

          {/* Selector de Modelo */}
          {opcionesModelo.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Modelo</label>
              <select
                value={searchModelo}
                onChange={(e) => setSearchModelo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
              >
                <option value="">Ver todos</option>
                {opcionesModelo.map(modelo => (
                  <option key={modelo} value={modelo}>
                    {modelo}
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

        {/* Botón de Exportar */}
        {dataFiltrada.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <Icon name="DownloadOutline" size="sm" color="white" />
              Exportar a Excel
            </button>
          </div>
        )}

        {/* Resumen de Disponibilidad */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
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
              <Icon name="LaptopOutline" size="xl" color="#16a34a" />
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
              <Icon name="PhonePortraitOutline" size="xl" color="#a855f7" />
            </div>
          </div>

          <div className="card-saas bg-indigo-50 border-l-4 border-indigo-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Accesorios Disponibles</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {tipoFiltro === 'todos' || tipoFiltro === 'accesorios'
                    ? dataFiltrada.filter(d => d.tipo === 'accesorio').length
                    : '-'}
                </p>
              </div>
              <Icon name="Hammer" size="xl" color="#4f46e5" />
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
              <div className="mb-3 flex justify-center">
                <Icon name="BoxOutline" size="xl" color="#9ca3af" />
              </div>
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
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
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
              <span className="font-semibold">Mostrando {dataFiltrada.length} de {equiposDisponibles.length + celularesDisponibles.length + accesoriosDisponibles.length} equipos disponibles</span>
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}


