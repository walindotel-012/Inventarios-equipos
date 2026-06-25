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
  const [showImportForm, setShowImportForm] = useState(false);
  const [importText, setImportText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    codigo: '',
    tipo: '',
    marca: '',
    modelo: '',
    serial: '',
    condicion: '',
  });

  const [formData, setFormData] = useState({
    codigoActivoFijo: '',
    tipoAccesorio: '',
    condicion: '',
    marca: '',
    modelo: '',
    serial: '',
    estado: 'disponible',
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

  const obtenerUltimoCodigo = () => {
    return accesorios.reduce((max, acc) => {
      const match = (acc.codigoActivoFijo || '').match(/^ATM-ACC-(\d+)$/i);
      if (!match) return max;
      const numero = Number(match[1]);
      return Number.isFinite(numero) ? Math.max(max, numero) : max;
    }, 0);
  };

  // Generar código automático a partir del último código existente
  const generarCodigo = () => {
    const ultimoCodigo = obtenerUltimoCodigo();
    return `ATM-ACC-${String(ultimoCodigo + 1).padStart(4, '0')}`;
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

      await setDoc(doc(db, 'accesorios', codigo), {
        id: codigo,
        codigoActivoFijo: codigo,
        tipoAccesorio: formData.tipoAccesorio,
        condicion: formData.condicion,
        estado: formData.estado,
        marca: formData.marca,
        modelo: formData.modelo,
        serial: formData.serial,
        asignado: editingId ? (formData.asignado || false) : false,
        creadoEn: editingId ? formData.creadoEn : new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        creadoPor: editingId ? formData.creadoPor : currentUser.uid
      }, { merge: true });

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
    setFormData({
      ...accesorio,
      estado: accesorio.estado || 'disponible',
    });
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
      serial: '',
      estado: 'disponible',
      asignado: false
    });
    setEditingId(null);
  };

  // Manejar cambios en filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      codigo: '',
      tipo: '',
      marca: '',
      modelo: '',
      serial: '',
      condicion: '',
    });
  };

  // Filtrar accesorios por búsqueda
  const filteredAccesorios = accesorios.filter(acc => {
    // Búsqueda por código
    const matchCodigo = !filtros.codigo || 
      (acc.codigoActivoFijo || '').toLowerCase().includes(filtros.codigo.toLowerCase());

    // Filtro por tipo
    const matchTipo = !filtros.tipo || 
      (acc.tipoAccesorio || '').toLowerCase() === filtros.tipo.toLowerCase();

    // Filtro por marca
    const matchMarca = !filtros.marca || 
      (acc.marca || '').toLowerCase() === filtros.marca.toLowerCase();

    // Filtro por modelo
    const matchModelo = !filtros.modelo || 
      (acc.modelo || '').toLowerCase().includes(filtros.modelo.toLowerCase());

    // Filtro por serial
    const matchSerial = !filtros.serial || 
      (acc.serial || '').toLowerCase().includes(filtros.serial.toLowerCase());

    // Filtro por condición
    const matchCondicion = !filtros.condicion || 
      (acc.condicion || '').toLowerCase() === filtros.condicion.toLowerCase();

    return matchCodigo && matchTipo && matchMarca && matchModelo && matchSerial && matchCondicion;
  });

  const totalAccesorios = accesorios.length;
  const filtrosActivos = Object.values(filtros).some((valor) => valor);

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

  // Importar accesorios en lote
  const handleImportAccesorios = async (e) => {
    e.preventDefault();

    if (!importText.trim()) {
      showToast('Por favor pega los accesorios a importar', 'warning');
      return;
    }

    // Parsear los accesorios del texto (tab-separated)
    const lineas = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lineas.length === 0) {
      showToast('No hay accesorios válidos para importar', 'warning');
      return;
    }

    try {
      setLoading(true);
      let importados = 0;
      let errores = 0;
      let seriesDuplicadas = 0;
      let codigoActual = obtenerUltimoCodigo() + 1;
      const seriesYaImportadas = new Set();

      for (const linea of lineas) {
        try {
          // Parsear los campos separados por TAB
          // Formato: Tipo de Accesorio | Condición | Marca | Modelo | Serial
          const campos = linea.split('\t').map(c => c.trim());
          
          // Validar que haya al menos 5 campos
          if (campos.length < 5) {
            console.warn(`Línea skipped (campos insuficientes): ${linea.substring(0, 50)}...`);
            errores++;
            continue;
          }

          const [tipoAccesorio, condicion, marca, modelo, serial] = campos;

          // Validar campos requeridos
          if (!tipoAccesorio || !condicion || !marca || !modelo || !serial) {
            console.warn(`Línea skipped (campos vacíos): ${linea.substring(0, 50)}...`);
            errores++;
            continue;
          }

          // Validar que condición sea válida
          if (!CONDICIONES.includes(condicion.trim())) {
            console.warn(`Condición inválida: ${condicion}. Debe ser "Nuevo" o "Usado"`);
            errores++;
            continue;
          }

          // Convertir serial a mayúsculas
          const serialMayuscula = serial.toUpperCase();

          // Validar que el serial no esté duplicado (en accesorios existentes o ya importados en este lote)
          if (accesorios.some(a => a.serial && a.serial.toUpperCase() === serialMayuscula) || seriesYaImportadas.has(serialMayuscula)) {
            console.warn(`Serial duplicado: ${serial}`);
            seriesDuplicadas++;
            continue;
          }

          seriesYaImportadas.add(serialMayuscula);

          // Crear código de activo fijo automáticamente
          const codActivoFijo = `ATM-ACC-${String(codigoActual).padStart(4, '0')}`;
          codigoActual++;

          // Insertar en Firestore
          await setDoc(doc(db, 'accesorios', codActivoFijo), {
            codigoActivoFijo: codActivoFijo,
            tipoAccesorio: tipoAccesorio.trim(),
            condicion: condicion.trim(),
            marca: marca.trim(),
            modelo: modelo.trim(),
            serial: serialMayuscula,
            asignado: false,
            creadoEn: new Date().toISOString(),
            actualizadoEn: new Date().toISOString(),
            creadoPor: currentUser.uid
          });

          importados++;
        } catch (lineError) {
          console.error('Error procesando línea:', lineError);
          errores++;
        }
      }

      let mensaje = `Se importaron ${importados} accesorio${importados !== 1 ? 's' : ''}`;
      if (seriesDuplicadas > 0) {
        mensaje += ` (${seriesDuplicadas} serial${seriesDuplicadas !== 1 ? 'es' : ''} duplicado${seriesDuplicadas !== 1 ? 's' : ''} ignorado${seriesDuplicadas !== 1 ? 's' : ''})`;
      }
      if (errores > 0) {
        mensaje += ` (${errores} línea${errores !== 1 ? 's' : ''} con error)`;
      }
      showToast(mensaje, importados > 0 ? 'success' : 'warning');

      setImportText('');
      setShowImportForm(false);
    } catch (error) {
      console.error('Error al importar:', error);
      showToast('Error al importar accesorios', 'error');
    } finally {
      setLoading(false);
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

          {showImportForm ? (
            // Vista con formulario de importación
            <div className="card-saas-lg bg-white max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-lg">📥</div>
                Importar Accesorios en Lote
              </h2>

              <form onSubmit={handleImportAccesorios} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
                  <Icon name="InformationCircleOutline" size="sm" color="#0284c7" />
                  <div>
                    <p className="text-blue-900 text-sm font-semibold">Formato esperado (separado por TAB)</p>
                    <p className="text-blue-800 text-xs mt-2 font-mono">
                      Tipo de Accesorio | Condición | Marca | Modelo | Serial
                    </p>
                    <p className="text-blue-800 text-xs mt-2">
                      Ejemplo: Cable HDMI | Nuevo | HDMI | 2.1 | CAB-001
                    </p>
                    <p className="text-blue-800 text-xs mt-2">
                      Condición debe ser: <strong>Nuevo</strong> o <strong>Usado</strong>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Accesorios (uno por línea, separados por TAB)
                  </label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Pega los accesorios aquí&#10;Usa el formato: Tipo	Condición	Marca	Modelo	Serial"
                    rows="12"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-mono"
                    required
                  />
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      Se importarán: {importText.split('\n').filter(l => l.trim().length > 0).length} accesorio(s)
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
                  <Icon name="AlertCircleOutline" size="sm" color="#d97706" />
                  <div>
                    <p className="text-amber-900 text-sm font-semibold">Información importante</p>
                    <ul className="text-amber-800 text-xs mt-1 space-y-1">
                      <li>• Se generarán códigos de activo fijo automáticamente (ATM-ACC-XXXX)</li>
                      <li>• Los seriales duplicados serán ignorados</li>
                      <li>• Se convertirán seriales a mayúsculas</li>
                      <li>• Todos los campos son requeridos</li>
                      <li>• La Condición debe ser "Nuevo" o "Usado"</li>
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
          ) : (
            <>
              {/* Búsqueda y botón crear */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Icon name="FunnelOutline" size="sm" color="currentColor" />
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </button>
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
                  <button
                    onClick={() => setShowImportForm(true)}
                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-base">📥</span>
                    Importar en Lote
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
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filtrosActivos
                    ? `Mostrando ${filteredAccesorios.length} de ${totalAccesorios} accesorios filtrados`
                    : `Total de accesorios: ${totalAccesorios}`}
                </div>
              </div>

                {/* Filtros Avanzados */}
                {showFilters && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Filtro Código */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Código</label>
                        <input
                          type="text"
                          name="codigo"
                          placeholder="Ej: ATM-ACC-0001"
                          value={filtros.codigo}
                          onChange={handleFiltroChange}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* Filtro Tipo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Tipo</label>
                        <select
                          name="tipo"
                          value={filtros.tipo}
                          onChange={handleFiltroChange}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Todos los tipos</option>
                          {[...new Set(accesorios.map(a => a.tipoAccesorio).filter(Boolean))].sort().map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filtro Marca */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Marca</label>
                        <select
                          name="marca"
                          value={filtros.marca}
                          onChange={handleFiltroChange}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Todas las marcas</option>
                          {[...new Set(accesorios.map(a => a.marca).filter(Boolean))].sort().map((marca) => (
                            <option key={marca} value={marca}>{marca}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filtro Modelo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Modelo</label>
                        <input
                          type="text"
                          name="modelo"
                          placeholder="Buscar modelo..."
                          value={filtros.modelo}
                          onChange={handleFiltroChange}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* Filtro Serial */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Serial</label>
                        <input
                          type="text"
                          name="serial"
                          placeholder="Buscar serial..."
                          value={filtros.serial}
                          onChange={handleFiltroChange}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* Filtro Condición */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Condición</label>
                        <select
                          name="condicion"
                          value={filtros.condicion}
                          onChange={handleFiltroChange}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Todas las condiciones</option>
                          {CONDICIONES.map((cond) => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Botón Limpiar Filtros */}
                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLimpiarFiltros}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-all"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  </div>
                )}

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
            </>
          )}

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

                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Estado *</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="asignado">Asignado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="equipos en mantenimiento">Equipos en mantenimiento</option>
                    <option value="inactivos">Inactivos</option>
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
