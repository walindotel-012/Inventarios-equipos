import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';

export default function Nomenclaturas() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [netbiosName, setNetbiosName] = useState('');
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 14;

  // Cargar nomenclaturas
  useEffect(() => {
    loadNomenclaturas();
  }, []);

  const loadNomenclaturas = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'nomenclaturas'));
      const nomenclaturasList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNomenclaturas(nomenclaturasList);
    } catch (error) {
      console.error('Error cargando nomenclaturas:', error);
      showToast('Error al cargar nomenclaturas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    setNetbiosName(value);
    setCharCount(value.length);
  };

  const handleEditar = (nom) => {
    setNetbiosName(nom.netbiosName);
    setCharCount(nom.netbiosName.length);
    setEditingId(nom.id);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setNetbiosName('');
    setCharCount(0);
  };

  const handleNueva = () => {
    setNetbiosName('');
    setCharCount(0);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar caracteres
    if (charCount > MAX_CHARS) {
      showToast(`No se pueden guardar más de ${MAX_CHARS} caracteres. Intenta nuevamente`, 'warning');
      return;
    }

    if (charCount === 0) {
      showToast('Por favor ingresa un nombre', 'warning');
      return;
    }

    // Validar que no exista (excepto si es el mismo en edición)
    if (nomenclaturas.some(n => n.netbiosName === netbiosName && n.id !== editingId)) {
      showToast('Esta nomenclatura ya existe', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Actualizar
        await updateDoc(doc(db, 'nomenclaturas', editingId), {
          netbiosName,
          actualizadoPor: currentUser.displayName || currentUser.email,
          fechaActualizacion: new Date(),
        });
        showToast('Nomenclatura actualizada exitosamente', 'success');
      } else {
        // Crear nueva
        await addDoc(collection(db, 'nomenclaturas'), {
          netbiosName,
          registradoPor: currentUser.displayName || currentUser.email,
          fechaRegistro: new Date(),
        });
        showToast('Nomenclatura registrada exitosamente', 'success');
      }

      setNetbiosName('');
      setCharCount(0);
      setEditingId(null);
      loadNomenclaturas();
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al registrar nomenclatura', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta nomenclatura?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'nomenclaturas', id));
        showToast('Nomenclatura eliminada', 'success');
        loadNomenclaturas();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showToast('Error al eliminar nomenclatura', 'error');
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Gestión de Colaboradores</h1>
            <p className="text-gray-600 text-base">Registra y administra los NetBios Names</p>
          </div>
          {!showForm && (
            <button
              onClick={handleNueva}
              className="btn-primary"
            >
              ➕ Nuevo Colaborador
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm ? (
          // Vista con formulario expandido
          <div className="card-saas-lg bg-white max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-lg">🏷️</div>
              {editingId ? 'Editar Colaborador' : 'Nuevo Colaborador'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NetBios Name
                </label>
                <input
                  type="text"
                  value={netbiosName}
                  onChange={handleChange}
                  placeholder="Ej: DESKTOP-ADMIN"
                  maxLength={MAX_CHARS}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    charCount > MAX_CHARS
                      ? 'border-red-500 bg-red-50 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-purple-400'
                  }`}
                  required
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Máximo {MAX_CHARS} caracteres
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      charCount > MAX_CHARS ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {charCount > MAX_CHARS && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
                  <Icon name="AlertCircleOutline" size="sm" color="#dc2626" />
                  <p className="text-red-700 text-sm font-semibold">
                    No se pueden guardar más de {MAX_CHARS} caracteres. Intenta nuevamente.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || charCount > MAX_CHARS || charCount === 0}
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
          // Vista normal con lista
          <div className="card-saas-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Colaboradores Registrados</h2>
                <p className="text-sm text-gray-500 mt-1">{nomenclaturas.length} colaborador{nomenclaturas.length !== 1 ? 'es' : ''}</p>
              </div>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                </div>
                <p className="text-gray-600 mt-3">Cargando colaboradores...</p>
              </div>
            )}

            {nomenclaturas.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-600 font-semibold">No hay colaboradores registrados aún</p>
                <p className="text-sm text-gray-500 mt-1">Crea tu primer colaborador para empezar</p>
              </div>
            )}

            {nomenclaturas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nomenclaturas.map(nom => (
                  <div
                    key={nom.id}
                    className="border-2 border-gray-100 rounded-2xl p-4 hover:border-purple-200 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold text-white mb-2">
                          {nom.netbiosName.charAt(0)}
                        </div>
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {nom.netbiosName}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Por: {nom.registradoPor}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {nom.fechaRegistro?.toDate?.()?.toLocaleDateString?.('es-ES') ||
                            'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditar(nom)}
                          className="btn-outline text-xs px-2 py-1"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(nom.id)}
                          className="px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
