import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importText, setImportText] = useState('');

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

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'nomenclaturas', deleteId));
      showToast('Nomenclatura eliminada', 'success');
      loadNomenclaturas();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar nomenclatura', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleImportNomenclaturas = async (e) => {
    e.preventDefault();

    if (!importText.trim()) {
      showToast('Por favor pega las nomenclaturas a importar', 'warning');
      return;
    }

    // Parsear las nomenclaturas del texto
    const nuevasNomenclaturas = importText
      .split('\n')
      .map(line => line.trim().toUpperCase())
      .filter(line => line.length > 0);

    if (nuevasNomenclaturas.length === 0) {
      showToast('No hay nomenclaturas válidas para importar', 'warning');
      return;
    }

    // Validar longitud
    const invalidas = nuevasNomenclaturas.filter(nom => nom.length > MAX_CHARS);
    if (invalidas.length > 0) {
      showToast(`Existen ${invalidas.length} nomenclaturas con más de ${MAX_CHARS} caracteres`, 'warning');
      return;
    }

    try {
      setLoading(true);
      let importadas = 0;
      let duplicadas = 0;

      for (const netbiosName of nuevasNomenclaturas) {
        // Verificar si ya existe
        if (nomenclaturas.some(n => n.netbiosName === netbiosName)) {
          duplicadas++;
          continue;
        }

        await addDoc(collection(db, 'nomenclaturas'), {
          netbiosName,
          registradoPor: currentUser.displayName || currentUser.email,
          fechaRegistro: new Date(),
        });
        importadas++;
      }

      let mensaje = `Se importaron ${importadas} nomenclatura${importadas !== 1 ? 's' : ''}`;
      if (duplicadas > 0) {
        mensaje += ` (${duplicadas} ya existían)`;
      }
      showToast(mensaje, 'success');

      setImportText('');
      setShowImportForm(false);
      loadNomenclaturas();
    } catch (error) {
      console.error('Error al importar:', error);
      showToast('Error al importar nomenclaturas', 'error');
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Gestión de Colaboradores</h1>
            <p className="text-gray-600 text-base">Registra y administra los NetBios Names</p>
          </div>
          {!showForm && !showImportForm && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportForm(true)}
                className="btn-secondary"
              >
                📥 Importar en Lote
              </button>
              <button
                onClick={handleNueva}
                className="btn-primary"
              >
                ➕ Nuevo Colaborador
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showImportForm ? (
          // Vista con formulario de importación
          <div className="card-saas-lg bg-white max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-lg">📥</div>
              Importar Nomenclaturas en Lote
            </h2>

            <form onSubmit={handleImportNomenclaturas} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomenclaturas (una por línea)
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega las nomenclaturas aquí, una por línea&#10;Ejemplo:&#10;AUVECRFOLABE01&#10;AUVEASFALABE01&#10;AUFIGELABE01"
                  rows="12"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-mono"
                  required
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Se importarán: {importText.split('\n').filter(l => l.trim().length > 0).length} nomenclatura(s)
                  </span>
                  <span className="text-xs text-gray-600">
                    Máximo {MAX_CHARS} caracteres por nomenclatura
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
                <Icon name="InformationCircleOutline" size="sm" color="#0284c7" />
                <div>
                  <p className="text-blue-900 text-sm font-semibold">Información de importación</p>
                  <ul className="text-blue-800 text-xs mt-1 space-y-1">
                    <li>• Las nomenclaturas duplicadas serán ignoradas</li>
                    <li>• Se convertirán automáticamente a mayúsculas</li>
                    <li>• Máximo {MAX_CHARS} caracteres por nomenclatura</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || importText.trim().length === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Icon name="CheckmarkOutline" size="sm" color="white" />
                      Importar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Icon name="CloseOutline" size="sm" color="#6b7280" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : showForm ? (
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
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Nomenclatura"
        message="¿Estás seguro de que deseas eliminar esta nomenclatura? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
