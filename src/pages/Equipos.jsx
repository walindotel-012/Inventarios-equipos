import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
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

export default function Equipos() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Para búsqueda
  const [formData, setFormData] = useState({
    codActivoFijo: '',
    marca: '',
    modelo: '',
    sn: '',
    disco: '',
    memoria: '',
    procesador: '',
    so: '',
    licencia: '',
    tipoEquipo: '',
    condicion: '',
  });

  const marcas = ['Lenovo', 'Dell', 'HP'];
  const discos = ['512 GB', '1 TB', '2 TB'];
  const memorias = ['16 GB', '32 GB', '64 GB', '8 GB'];
  const condiciones = ['Nuevo', 'Usado'];

  // Generar el próximo código de activo fijo
  const generarProximoCodigo = () => {
    // Extraer números de códigos existentes en formato ATM###
    const numeros = equipos
      .map(equipo => {
        const match = equipo.codActivoFijo.match(/ATM(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => b - a);
    
    const proximoNumero = (numeros.length > 0 ? numeros[0] : 0) + 1;
    return `ATM${String(proximoNumero).padStart(3, '0')}`;
  };

  // Generar código basado en una lista específica de equipos
  const generarProximoCodigoDesde = (equiposList) => {
    const numeros = equiposList
      .map(equipo => {
        const match = equipo.codActivoFijo.match(/ATM(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => b - a);
    
    const proximoNumero = (numeros.length > 0 ? numeros[0] : 0) + 1;
    return `ATM${String(proximoNumero).padStart(3, '0')}`;
  };

  // Cargar equipos
  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposList);
      return equiposList; // Retornar la lista para usarla inmediatamente
    } catch (error) {
      console.error('Error cargando equipos:', error);
      showToast('Error al cargar equipos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario y asignar código automático
  const handleNuevoEquipo = () => {
    const proximoCodigo = generarProximoCodigo();
    setFormData(prev => ({
      ...prev,
      codActivoFijo: proximoCodigo
    }));
    setEditingId(null);
    setShowForm(true);
  };

  // Editar equipo existente
  const handleEditar = (equipo) => {
    setFormData(equipo);
    setEditingId(equipo.id);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      codActivoFijo: '',
      marca: '',
      modelo: '',
      sn: '',
      disco: '',
      memoria: '',
      procesador: '',
      so: '',
      licencia: '',
      tipoEquipo: '',
      condicion: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos estén llenos EXCEPTO licencia (que es opcional)
    const requiredFields = { ...formData };
    delete requiredFields.licencia; // Licencia es opcional
    
    if (Object.values(requiredFields).some(value => !value)) {
      showToast('Por favor completa todos los campos (licencia es opcional)', 'warning');
      return;
    }

    // Validar que el serial no esté duplicado (excepto si es el mismo equipo en edición)
    const serialDuplicado = equipos.some(equipo => 
      equipo.sn.toUpperCase() === formData.sn.toUpperCase() && equipo.id !== editingId
    );

    if (serialDuplicado) {
      showToast(`No se puede guardar. El serial "${formData.sn}" ya está registrado`, 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Actualizar equipo existente
        await updateDoc(doc(db, 'equipos', editingId), {
          ...formData,
          actualizadoPor: currentUser.displayName || currentUser.email,
          fechaActualizacion: new Date(),
        });
        showToast('Equipo actualizado exitosamente', 'success');
      } else {
        // Crear nuevo equipo
        await addDoc(collection(db, 'equipos'), {
          ...formData,
          registradoPor: currentUser.displayName || currentUser.email,
          fechaRegistro: new Date(),
        });
        showToast('Equipo registrado exitosamente', 'success');
      }

      // Cargar equipos actualizados
      const equiposActualizados = await loadEquipos();
      
      // Generar el próximo código basado en la lista actualizada
      const proximoCodigo = generarProximoCodigoDesde(equiposActualizados || []);
      
      // Limpiar formulario con nuevo código
      setFormData({
        codActivoFijo: proximoCodigo,
        marca: '',
        modelo: '',
        sn: '',
        disco: '',
        memoria: '',
        procesador: '',
        so: '',
        licencia: '',
        tipoEquipo: '',
        condicion: '',
      });

      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      showToast('Error al registrar equipo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      
      // Buscar si el equipo está asignado en la colección de asignaciones
      const asignacionesSnapshot = await getDocs(collection(db, 'asignaciones'));
      const equipoAsignado = asignacionesSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.codActivoFijo === equipos.find(e => e.id === id)?.codActivoFijo;
      });

      if (equipoAsignado) {
        const usuarioNombre = equipoAsignado.data().nombre || equipoAsignado.data().usuario || 'Usuario desconocido';
        showToast(`No puedes eliminar este equipo, porque está asignado a: ${usuarioNombre}`, 'warning');
        setLoading(false);
        return;
      }

      // Si no está asignado, proceder con la eliminación
      if (window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
        await deleteDoc(doc(db, 'equipos', id));
        showToast('Equipo eliminado exitosamente', 'success');
        loadEquipos();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar equipo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Gestión de Equipos</h1>
            <p className="text-gray-600 text-base">Registra y administra todos los dispositivos</p>
          </div>
          {!showForm && (
            <button
              onClick={handleNuevoEquipo}
              className="btn-primary"
            >
              ➕ Nuevo Equipo
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm ? (
          // Vista con formulario expandido
          <div className="card-saas-lg bg-white max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6 flex items-center gap-3">
              <div className="flex items-center gap-3">
                <Icon name="LaptopOutline" size="lg" color="#0ea5e9" />
                {editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
              </div>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fila 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Código Activo Fijo</label>
                  <input
                    type="text"
                    name="codActivoFijo"
                    value={formData.codActivoFijo}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-mono font-bold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se genera automáticamente</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
                  <select
                    name="tipoEquipo"
                    value={formData.tipoEquipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar tipo de equipo...</option>
                    {TIPOS_DISPOSITIVOS.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Condición</label>
                  <select
                    name="condicion"
                    value={formData.condicion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar condición...</option>
                    {condiciones.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                  <select
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {marcas.map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="ThinkPad E15"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Serial (S/N)</label>
                  <input
                    type="text"
                    name="sn"
                    value={formData.sn}
                    onChange={handleChange}
                    placeholder="SN123456789"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especificación 1</label>
                  <input
                    type="text"
                    name="disco"
                    value={formData.disco}
                    onChange={handleChange}
                    placeholder="Ej: 512 GB, 1 TB, 2 TB"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especificación 2</label>
                  <input
                    type="text"
                    name="memoria"
                    value={formData.memoria}
                    onChange={handleChange}
                    placeholder="Ej: 8 GB, 16 GB, 32 GB"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especificación 3</label>
                  <input
                    type="text"
                    name="procesador"
                    value={formData.procesador}
                    onChange={handleChange}
                    placeholder="Intel Core i7"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sistema Operativo</label>
                  <input
                    type="text"
                    name="so"
                    value={formData.so}
                    onChange={handleChange}
                    placeholder="Windows 11 Pro"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 6 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Licencia <span className="text-xs text-gray-500">(Opcional)</span></label>
                <input
                  type="text"
                  name="licencia"
                  value={formData.licencia}
                  onChange={handleChange}
                  placeholder="Corporativa"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Icon name="CheckmarkOutline" size="sm" color="white" />
                      {editingId ? 'Actualizar' : 'Registrar'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Icon name="CloseOutline" size="sm" color="#6b7280" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Vista normal con lista de equipos
          <div className="card-saas-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Equipos Registrados</h2>
                <p className="text-sm text-gray-500 mt-1">{equipos.length} dispositivo{equipos.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Filtro de búsqueda */}
            {equipos.length > 0 && (
              <div className="mb-6 flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por código o serial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    ✕ Limpiar
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
                <p className="text-gray-600 mt-3">Cargando equipos...</p>
              </div>
            )}

            {equipos.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-gray-600 font-semibold">No hay equipos registrados aún</p>
                <p className="text-sm text-gray-500 mt-1">Crea tu primer equipo para empezar</p>
              </div>
            )}

            {equipos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Código</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tipo</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Condición</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Marca</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Modelo</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Serial</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Ordenar equipos por código de activo fijo
                      const equiposOrdenados = [...equipos].sort((a, b) => {
                        const numA = parseInt(a.codActivoFijo.match(/\d+/)[0]);
                        const numB = parseInt(b.codActivoFijo.match(/\d+/)[0]);
                        return numA - numB;
                      });

                      // Filtrar según búsqueda
                      const equiposFiltrados = searchTerm
                        ? equiposOrdenados.filter(equipo =>
                            equipo.codActivoFijo.includes(searchTerm) ||
                            equipo.sn.toUpperCase().includes(searchTerm)
                          )
                        : equiposOrdenados;

                      // Mostrar mensaje si no hay resultados
                      if (equiposFiltrados.length === 0) {
                        return (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-500">
                              📭 No se encontraron equipos que coincidan con: <strong>{searchTerm}</strong>
                            </td>
                          </tr>
                        );
                      }

                      return equiposFiltrados.map(equipo => (
                        <tr key={equipo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900 font-mono text-sm">{equipo.codActivoFijo}</td>
                          <td className="p-4 text-gray-600">{equipo.tipoEquipo}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              equipo.condicion === 'Nuevo' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {equipo.condicion}
                            </span>
                          </td>
                        <td className="p-4 text-gray-600">{equipo.marca}</td>
                        <td className="p-4 text-gray-600">{equipo.modelo}</td>
                        <td className="p-4 font-mono text-xs text-gray-600">{equipo.sn}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditar(equipo)}
                              className="btn-outline text-xs flex items-center justify-center gap-1"
                            >
                              <Icon name="PencilOutline" size="sm" color="#0ea5e9" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(equipo.id)}
                              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                            >
                              <Icon name="TrashOutline" size="sm" color="#ef4444" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
