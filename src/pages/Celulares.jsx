import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';

const MARCAS_CELULARES = ['Apple', 'Samsung', 'motorola', 'LG', 'Huawei', 'Xiaomi', 'Nokia', 'OnePlus', 'Google Pixel', 'Otro'];
const CONDICIONES = ['Nuevo', 'Usado'];
const RESTRICCIONES = ['Abierta', 'Cerrada', 'Abierta LDI'];
const PLANES = ['10 GB Plus con bloqueo'];

export default function Celulares() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [celulares, setCelulares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    celular: true,
    condicion: '',
    restriccion: '',
    serial: '',
    marca: '',
    modelo: '',
    imei: '',
    numero: '',
    plan: '',
    fechaEntrega: '',
  });

  // Cargar celulares
  useEffect(() => {
    loadCelulares();
  }, []);

  const loadCelulares = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'celulares'));
      const celularesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCelulares(celularesList);
    } catch (error) {
      console.error('Error cargando celulares:', error);
      showToast('Error al cargar celulares', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario para nuevo celular
  const handleNuevoCelular = () => {
    setFormData({
      celular: true,
      condicion: '',
      restriccion: '',
      serial: '',
      marca: '',
      modelo: '',
      imei: '',
      numero: '',
      plan: '',
      fechaEntrega: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  // Editar celular existente
  const handleEditar = (celular) => {
    setFormData(celular);
    setEditingId(celular.id);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      celular: true,
      condicion: '',
      restriccion: '',
      serial: '',
      marca: '',
      modelo: '',
      imei: '',
      numero: '',
      plan: '',
      fechaEntrega: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos obligatorios estén llenos
    if (!formData.condicion || !formData.serial || !formData.marca || !formData.modelo || 
        !formData.imei || !formData.numero || !formData.plan || !formData.fechaEntrega) {
      showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    // Validar que el serial no esté duplicado (excepto si es el mismo celular en edición)
    const serialDuplicado = celulares.some(celular => 
      celular.serial && celular.serial.toUpperCase() === formData.serial.toUpperCase() && celular.id !== editingId
    );

    if (serialDuplicado) {
      showToast(`No se puede guardar. El serial "${formData.serial}" ya está registrado`, 'error');
      return;
    }

    // Validar que el IMEI no esté duplicado (excepto si es el mismo celular en edición)
    const imeiDuplicado = celulares.some(celular => 
      celular.imei && celular.imei.toUpperCase() === formData.imei.toUpperCase() && celular.id !== editingId
    );

    if (imeiDuplicado) {
      showToast(`No se puede guardar. El IMEI "${formData.imei}" ya está registrado`, 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Actualizar celular existente
        await updateDoc(doc(db, 'celulares', editingId), {
          ...formData,
          actualizadoPor: currentUser.displayName || currentUser.email,
          fechaActualizacion: new Date(),
        });
        showToast('Celular actualizado exitosamente', 'success');
      } else {
        // Crear nuevo celular
        await addDoc(collection(db, 'celulares'), {
          ...formData,
          registradoPor: currentUser.displayName || currentUser.email,
          fechaRegistro: new Date(),
        });
        showToast('Celular registrado exitosamente', 'success');
      }

      // Limpiar formulario
      setFormData({
        celular: true,
        condicion: '',
        restriccion: '',
        serial: '',
        marca: '',
        modelo: '',
        imei: '',
        numero: '',
        plan: '',
        fechaEntrega: '',
      });

      setEditingId(null);
      loadCelulares();
    } catch (error) {
      console.error('Error al guardar celular:', error);
      showToast('Error al registrar celular', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este celular?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'celulares', id));
        showToast('Celular eliminado', 'success');
        loadCelulares();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showToast('Error al eliminar celular', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Gestión de Celulares</h1>
            <p className="text-gray-600 text-base">Registra y administra todos los dispositivos móviles</p>
          </div>
          {!showForm && (
            <button
              onClick={handleNuevoCelular}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Icon name="AddOutline" size="sm" color="white" />
              Nuevo Celular
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
              <Icon name="PhonePortraitOutline" size="lg" color="#16a34a" />
              {editingId ? 'Editar Celular' : 'Nuevo Celular'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fila 1 - Celular y Condición */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 pt-2">
                  <label className="block text-sm font-semibold text-gray-700">Celular</label>
                  <input
                    type="checkbox"
                    name="celular"
                    checked={formData.celular}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Condición</label>
                  <select
                    name="condicion"
                    value={formData.condicion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar condición...</option>
                    {CONDICIONES.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2 - Restricción y Serial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restricción</label>
                  <select
                    name="restriccion"
                    value={formData.restriccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    <option value="">Seleccionar restricción...</option>
                    {RESTRICCIONES.map(restriccion => (
                      <option key={restriccion} value={restriccion}>{restriccion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Serial</label>
                  <input
                    type="text"
                    name="serial"
                    value={formData.serial}
                    onChange={handleChange}
                    placeholder="Serial del dispositivo"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 3 - Marca y Modelo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                  <select
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar marca...</option>
                    {MARCAS_CELULARES.map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="iPhone 14 Pro"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 4 - IMEI y Número */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">IMEI</label>
                  <input
                    type="text"
                    name="imei"
                    value={formData.imei}
                    onChange={handleChange}
                    placeholder="359620098765432"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Celular</label>
                  <input
                    type="tel"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="+57 3XX XXX XXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Fila 5 - Plan y Fecha de Entrega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar plan...</option>
                    {PLANES.map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Entrega</label>
                  <input
                    type="date"
                    name="fechaEntrega"
                    value={formData.fechaEntrega}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>
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
          // Vista normal con lista de celulares
          <div className="card-saas-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Celulares Registrados</h2>
                <p className="text-sm text-gray-500 mt-1">{celulares.length} dispositivo{celulares.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p className="text-gray-600 mt-3">Cargando celulares...</p>
              </div>
            )}

            {celulares.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <Icon name="PhonePortraitOutline" size="xl" color="#9ca3af" />
                </div>
                <p className="text-gray-600 font-semibold">No hay celulares registrados aún</p>
                <p className="text-sm text-gray-500 mt-1">Crea tu primer celular para empezar</p>
              </div>
            )}

            {celulares.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Celular</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Condición</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Restricción</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Serial</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Marca</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Modelo</th>
                      <th className="text-left p-4 font-semibold text-gray-700">IMEI</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Número</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Plan</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Fecha Entrega</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {celulares.map(celular => (
                      <tr key={celular.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-center">
                          {celular.celular ? (
                            <span className="text-lg">✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            celular.condicion === 'Nuevo' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {celular.condicion}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{celular.restriccion || 'N/A'}</td>
                        <td className="p-4 font-mono text-xs text-gray-900">{celular.serial}</td>
                        <td className="p-4 text-gray-600">{celular.marca}</td>
                        <td className="p-4 text-gray-600">{celular.modelo}</td>
                        <td className="p-4 font-mono text-xs text-gray-600">{celular.imei}</td>
                        <td className="p-4 text-gray-600">{celular.numero}</td>
                        <td className="p-4 text-gray-600 text-sm">{celular.plan}</td>
                        <td className="p-4 text-gray-600 text-sm">{celular.fechaEntrega}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditar(celular)}
                              className="btn-outline text-xs flex items-center justify-center gap-1"
                            >
                              <Icon name="PencilOutline" size="sm" color="#0ea5e9" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(celular.id)}
                              className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                            >
                              <Icon name="TrashOutline" size="sm" color="#ef4444" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
