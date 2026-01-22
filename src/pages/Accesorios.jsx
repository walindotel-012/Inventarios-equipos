import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToastManager } from '../hooks/useToastManager';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';
import * as XLSX from 'xlsx';

const CONDICIONES = ['Nuevo', 'Usado'];

export default function Accesorios() {
  const { currentUser, userPermissions } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [formData, setFormData] = useState({
    codigoActivoFijo: '',
    tipoAccesorio: '',
    condicion: '',
    marca: '',
    modelo: '',
    serial: ''
  });

  // Cargar accesorios en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'accesorios'), (snapshot) => {
      try {
        const accesoriosList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccesorios(accesoriosList);
      } catch (error) {
        console.error('Error cargando accesorios:', error);
        showToast('Error al cargar los accesorios', 'error');
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar marcas y tipos disponibles
  useEffect(() => {
    const cargarMetadatos = async () => {
      try {
        // Obtener marcas únicas
        const marcasSnapshot = await getDocs(collection(db, 'marcas'));
        const marcasData = marcasSnapshot.docs.map(doc => doc.data().marca).filter(Boolean);
        setMarcas([...new Set(marcasData)]);

        // Obtener tipos únicos
        const tiposSnapshot = await getDocs(collection(db, 'tiposAccesorio'));
        const tiposData = tiposSnapshot.docs.map(doc => doc.data().tipo).filter(Boolean);
        setTipos([...new Set(tiposData)]);
      } catch (error) {
        console.error('Error cargando metadatos:', error);
      }
    };

    cargarMetadatos();
  }, []);

  // Generar código automático
  const generarCodigo = () => {
    const contador = accesorios.length + 1;
    return `ATM-ACC-${String(contador).padStart(4, '0')}`;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar accesorio
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tipoAccesorio || !formData.condicion || !formData.marca || !formData.modelo || !formData.serial) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      setLoading(true);
      const codigo = editingId ? formData.codigoActivoFijo : generarCodigo();
      const docRef = editingId ? doc(db, 'accesorios', editingId) : doc(collection(db, 'accesorios'));

      await setDoc(editingId ? docRef : doc(db, 'accesorios', codigo), {
        codigoActivoFijo: codigo,
        tipoAccesorio: formData.tipoAccesorio,
        condicion: formData.condicion,
        marca: formData.marca,
        modelo: formData.modelo,
        serial: formData.serial,
        creadoEn: editingId ? formData.creadoEn : new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        creadoPor: editingId ? formData.creadoPor : currentUser.uid
      });

      showToast(editingId ? 'Accesorio actualizado exitosamente' : 'Accesorio creado exitosamente', 'success');
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error guardando accesorio:', error);
      showToast('Error al guardar el accesorio', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Editar accesorio
  const handleEdit = (accesorio) => {
    setFormData(accesorio);
    setEditingId(accesorio.id);
    setShowForm(true);
  };

  // Eliminar accesorio
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'accesorios', deleteId));
      showToast('Accesorio eliminado exitosamente', 'success');
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error eliminando accesorio:', error);
      showToast('Error al eliminar el accesorio', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      codigoActivoFijo: '',
      tipoAccesorio: '',
      condicion: '',
      marca: '',
      modelo: '',
      serial: ''
    });
    setEditingId(null);
  };

  // Filtrar accesorios por búsqueda
  const filteredAccesorios = accesorios.filter(acc =>
    (acc.codigoActivoFijo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.serial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.modelo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exportar accesorios a Excel
  const handleExportarExcel = () => {
    try {
      if (filteredAccesorios.length === 0) {
        showToast('No hay accesorios para exportar', 'warning');
        return;
      }

      const datosExportar = filteredAccesorios.map(acc => ({
        'Código': acc.codigoActivoFijo || '-',
        'Tipo': acc.tipoAccesorio || '-',
        'Marca': acc.marca || '-',
        'Modelo': acc.modelo || '-',
        'Serial': acc.serial || '-',
        'Condición': acc.condicion || '-',
        'Creado En': acc.creadoEn ? new Date(acc.creadoEn).toLocaleDateString('es-ES') : '-',
        'Actualizado En': acc.actualizadoEn ? new Date(acc.actualizadoEn).toLocaleDateString('es-ES') : '-',
      }));

      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Accesorios');

      // Ajustar ancho de columnas
      const maxWidth = 25;
      ws['!cols'] = Array(Object.keys(datosExportar[0] || {}).length).fill({ wch: maxWidth });

      // Descargar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Accesorios_${fecha}.xlsx`);

      showToast('Excel exportado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      showToast('Error al exportar a Excel', 'error');
    }
  };

  // Verificar permisos
  const hasPermission = userPermissions?.modulos?.includes('accesorios') || 
                        userPermissions?.isAdmin ||
                        currentUser?.email === 'walindotel@gmail.com';

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <div className="text-center">
          <Icon name="LockClosedOutline" size="lg" color="#ef4444" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">No tienes permiso para acceder a este módulo</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast {...toast} onClose={hideToast} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <Icon name="BuildOutline" size="lg" color="#0ea5e9" />
              Gestión de Accesorios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Registra y administra accesorios de equipos</p>
          </div>

          {/* Búsqueda y botón crear */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por código, serial, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Icon name="AddOutline" size="sm" color="white" />
              Crear Accesorio
            </button>
            {filteredAccesorios.length > 0 && (
              <button
                onClick={handleExportarExcel}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Icon name="DownloadOutline" size="sm" color="white" />
                Exportar Excel
              </button>
            )}
          </div>

          {/* Tabla */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Código</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Marca</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Modelo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Serial</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Condición</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAccesorios.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Icon name="DocumentOutline" size="lg" color="#9ca3af" />
                          <p className="text-gray-500 dark:text-gray-400 mt-2">No hay accesorios registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAccesorios.map((accesorio) => (
                      <tr key={accesorio.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{accesorio.codigoActivoFijo}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{accesorio.tipoAccesorio}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{accesorio.marca}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{accesorio.modelo}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{accesorio.serial}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            accesorio.condicion === 'Nuevo'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {accesorio.condicion}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(accesorio)}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-xs font-medium"
                            >
                              <Icon name="CreateOutline" size="sm" color="#2563eb" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(accesorio.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-xs font-medium"
                            >
                              <Icon name="TrashOutline" size="sm" color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulario */}
      {showForm && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Icon name="BuildOutline" size="md" color="#0ea5e9" />
                  {editingId ? 'Editar Accesorio' : 'Nuevo Accesorio'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Icon name="CloseOutline" size="md" color="currentColor" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Código Activo Fijo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Código Activo Fijo</label>
                  <input
                    type="text"
                    value={editingId ? formData.codigoActivoFijo : generarCodigo()}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se genera automáticamente</p>
                </div>

                {/* Tipo de Accesorio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Tipo de Accesorio *</label>
                  <input
                    type="text"
                    name="tipoAccesorio"
                    value={formData.tipoAccesorio}
                    onChange={handleChange}
                    placeholder="Ej: Cable, Cargador, Mouse, Teclado..."
                    list="tipos-list"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <datalist id="tipos-list">
                    {tipos.map((tipo) => (
                      <option key={tipo} value={tipo} />
                    ))}
                  </datalist>
                </div>

                {/* Condición */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Condición *</label>
                  <select
                    name="condicion"
                    value={formData.condicion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Seleccionar condición...</option>
                    {CONDICIONES.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Marca *</label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Escribir o seleccionar..."
                    list="marcas-list"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <datalist id="marcas-list">
                    {marcas.map((marca) => (
                      <option key={marca} value={marca} />
                    ))}
                  </datalist>
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="Escribir modelo..."
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Serial */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Serial (S/N) *</label>
                  <input
                    type="text"
                    name="serial"
                    value={formData.serial}
                    onChange={handleChange}
                    placeholder="Escribir serial..."
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Icon name="SaveOutline" size="sm" color="white" />
                        {editingId ? 'Actualizar' : 'Crear'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.getElementById('portal') || document.body
      )}

      {/* Confirmación Eliminar */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Accesorio"
          message="¿Estás seguro de que deseas eliminar este accesorio? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteId(null);
          }}
          isDangerous
          isLoading={loading}
        />
      )}
    </>
  );
}
