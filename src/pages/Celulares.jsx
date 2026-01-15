import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';
import { logAudit } from '../utils/auditLog';
import * as XLSX from 'xlsx';

const MARCAS_CELULARES_INICIALES = ['Apple', 'Samsung', 'motorola', 'LG', 'Huawei', 'Xiaomi', 'Nokia', 'OnePlus', 'Google Pixel', 'Otro'];
const CONDICIONES = ['Nuevo', 'Usado', 'Personal-ESIM'];
const RESTRICCIONES_INICIALES = ['Abierta', 'Cerrada', 'Abierta LDI'];
const PLANES_INICIALES = ['10 GB Plus con bloqueo'];
const TIPOS_EQUIPO = ['FLOTA', 'ESIM'];

export default function Celulares() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [searchParams] = useSearchParams();
  const [celulares, setCelulares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(searchParams.get('form') === 'true');
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [marcas, setMarcas] = useState(MARCAS_CELULARES_INICIALES);
  const [restricciones, setRestricciones] = useState(RESTRICCIONES_INICIALES);
  const [planes, setPlanes] = useState(PLANES_INICIALES);
  const [showMarcasDropdown, setShowMarcasDropdown] = useState(false);
  const [showRestriccionesDropdown, setShowRestriccionesDropdown] = useState(false);
  const [showPlanesDropdown, setShowPlanesDropdown] = useState(false);
  const [formData, setFormData] = useState({
    tipoEquipo: '',
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

  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    condicion: '',
    restriccion: '',
    serial: '',
    marca: '',
    modelo: '',
    imei: '',
    numero: '',
  });

  // Cargar celulares
  useEffect(() => {
    loadCelulares();
  }, []);

  // Abrir formulario si viene parámetro form=true desde el Dashboard
  useEffect(() => {
    if (searchParams.get('form') === 'true') {
      handleNuevoCelular();
    }
  }, [searchParams]);

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
      tipoEquipo: '',
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
      tipoEquipo: '',
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos obligatorios estén llenos
    if (!formData.tipoEquipo || !formData.condicion || !formData.serial || !formData.marca || !formData.modelo || 
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
        // Obtener datos anteriores para comparar
        const celularAnterior = celulares.find(c => c.id === editingId);
        
        // Actualizar celular existente
        await updateDoc(doc(db, 'celulares', editingId), {
          ...formData,
          actualizadoPor: currentUser.displayName || currentUser.email,
          fechaActualizacion: new Date(),
        });
        
        // Registrar en auditoría
        await logAudit(
          currentUser.uid,
          currentUser.displayName || currentUser.email,
          'UPDATE',
          'Celulares',
          editingId,
          {
            anterior: celularAnterior,
            nuevo: formData,
          }
        );
        
        showToast('Celular actualizado exitosamente', 'success');
      } else {
        // Crear nuevo celular
        const docRef = await addDoc(collection(db, 'celulares'), {
          ...formData,
          registradoPor: currentUser.displayName || currentUser.email,
          fechaRegistro: new Date(),
        });
        
        // Registrar en auditoría
        await logAudit(
          currentUser.uid,
          currentUser.displayName || currentUser.email,
          'CREATE',
          'Celulares',
          docRef.id,
          {
            tipoEquipo: formData.tipoEquipo,
            marca: formData.marca,
            modelo: formData.modelo,
            serial: formData.serial,
            numero: formData.numero,
          }
        );
        
        showToast('Celular registrado exitosamente', 'success');
      }

      // Limpiar formulario
      setFormData({
        tipoEquipo: '',
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

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      const celularAEliminar = celulares.find(c => c.id === deleteId);
      
      await deleteDoc(doc(db, 'celulares', deleteId));
      
      // Registrar en auditoría
      await logAudit(
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        'DELETE',
        'Celulares',
        deleteId,
        {
          marca: celularAEliminar?.marca,
          modelo: celularAEliminar?.modelo,
          serial: celularAEliminar?.serial,
          numero: celularAEliminar?.numero,
        }
      );
      
      showToast('Celular eliminado', 'success');
      loadCelulares();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar celular', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  // Manejador de cambios en filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      condicion: '',
      restriccion: '',
      serial: '',
      marca: '',
      modelo: '',
      imei: '',
      numero: '',
    });
  };

  // Filtrar celulares basado en los filtros activos
  const celularesFiltrados = celulares.filter(celular => {
    if (filtros.condicion && celular.condicion !== filtros.condicion) return false;
    if (filtros.restriccion && celular.restriccion !== filtros.restriccion) return false;
    if (filtros.serial && !celular.serial.toLowerCase().includes(filtros.serial.toLowerCase())) return false;
    if (filtros.marca && celular.marca !== filtros.marca) return false;
    if (filtros.modelo && !celular.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) return false;
    if (filtros.imei && !celular.imei.toLowerCase().includes(filtros.imei.toLowerCase())) return false;
    if (filtros.numero && !celular.numero.toLowerCase().includes(filtros.numero.toLowerCase())) return false;
    return true;
  });

  // Obtener opciones únicas para los filtros
  const getCondicionesUnicas = () => [...new Set(celulares.map(c => c.condicion).filter(Boolean))];
  const getRestriccionesUnicas = () => [...new Set(celulares.map(c => c.restriccion).filter(Boolean))];
  const getMarcasUnicas = () => [...new Set(celulares.map(c => c.marca).filter(Boolean))];

  // Exportar a Excel
  const handleExportarExcel = () => {
    if (celularesFiltrados.length === 0) {
      showToast('No hay celulares para exportar', 'warning');
      return;
    }

    const dataExport = celularesFiltrados.map(celular => ({
      'Tipo Equipo': celular.tipoEquipo || '',
      'Condición': celular.condicion || '',
      'Restricción': celular.restriccion || '',
      'Serial': celular.serial || '',
      'Marca': celular.marca || '',
      'Modelo': celular.modelo || '',
      'IMEI': celular.imei || '',
      'Número': celular.numero || '',
      'Plan': celular.plan || '',
      'Fecha Entrega': celular.fechaEntrega || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Celulares');

    const columnWidths = [
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Celulares_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Reporte exportado exitosamente', 'success');
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
              {/* Fila 1 - Tipo Equipo y Condición */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
                  <select
                    name="tipoEquipo"
                    value={formData.tipoEquipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar tipo...</option>
                    {TIPOS_EQUIPO.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
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
                  <div className="relative">
                    <input
                      type="text"
                      name="restriccion"
                      value={formData.restriccion}
                      onChange={handleChange}
                      onFocus={() => setShowRestriccionesDropdown(true)}
                      onBlur={() => setTimeout(() => setShowRestriccionesDropdown(false), 200)}
                      placeholder="Escribir o seleccionar..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    />
                    
                    {showRestriccionesDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {restricciones
                          .filter(r => r.toLowerCase().includes(formData.restriccion.toLowerCase()))
                          .map(r => (
                            <div
                              key={r}
                              className="flex items-center justify-between px-4 py-2 hover:bg-green-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, restriccion: r }));
                                  setShowRestriccionesDropdown(false);
                                }}
                                className="flex-1 text-left"
                              >
                                {r}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRestricciones(prev => prev.filter(x => x !== r));
                                  if (formData.restriccion === r) {
                                    setFormData(prev => ({ ...prev, restriccion: '' }));
                                  }
                                }}
                                className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-600 transition-all"
                                title="Eliminar"
                              >
                                <Icon name="TrashOutline" size="sm" color="#dc2626" />
                              </button>
                            </div>
                          ))}
                        
                        {formData.restriccion && !restricciones.map(r => r.toLowerCase()).includes(formData.restriccion.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nueva = formData.restriccion.charAt(0).toUpperCase() + formData.restriccion.slice(1);
                              setRestricciones(prev => [...new Set([...prev, nueva])]);
                              setFormData(prev => ({ ...prev, restriccion: nueva }));
                              setShowRestriccionesDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-green-700 font-semibold border-t-2 border-green-200 flex items-center gap-2"
                          >
                            <Icon name="AddOutline" size="sm" color="#16a34a" />
                            Agregar: "{formData.restriccion}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      onFocus={() => setShowMarcasDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMarcasDropdown(false), 200)}
                      placeholder="Escribir o seleccionar..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      required
                    />
                    
                    {showMarcasDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {marcas
                          .filter(m => m.toLowerCase().includes(formData.marca.toLowerCase()))
                          .map(m => (
                            <div
                              key={m}
                              className="flex items-center justify-between px-4 py-2 hover:bg-green-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, marca: m }));
                                  setShowMarcasDropdown(false);
                                }}
                                className="flex-1 text-left"
                              >
                                {m}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMarcas(prev => prev.filter(x => x !== m));
                                  if (formData.marca === m) {
                                    setFormData(prev => ({ ...prev, marca: '' }));
                                  }
                                }}
                                className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-600 transition-all"
                                title="Eliminar"
                              >
                                <Icon name="TrashOutline" size="sm" color="#dc2626" />
                              </button>
                            </div>
                          ))}
                        
                        {formData.marca && !marcas.map(m => m.toLowerCase()).includes(formData.marca.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nueva = formData.marca.charAt(0).toUpperCase() + formData.marca.slice(1);
                              setMarcas(prev => [...new Set([...prev, nueva])]);
                              setFormData(prev => ({ ...prev, marca: nueva }));
                              setShowMarcasDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-green-700 font-semibold border-t-2 border-green-200 flex items-center gap-2"
                          >
                            <Icon name="AddOutline" size="sm" color="#16a34a" />
                            Agregar marca: "{formData.marca}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      onFocus={() => setShowPlanesDropdown(true)}
                      onBlur={() => setTimeout(() => setShowPlanesDropdown(false), 200)}
                      placeholder="Escribir o seleccionar..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      required
                    />
                    
                    {showPlanesDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {planes
                          .filter(p => p.toLowerCase().includes(formData.plan.toLowerCase()))
                          .map(p => (
                            <div
                              key={p}
                              className="flex items-center justify-between px-4 py-2 hover:bg-green-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, plan: p }));
                                  setShowPlanesDropdown(false);
                                }}
                                className="flex-1 text-left"
                              >
                                {p}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlanes(prev => prev.filter(x => x !== p));
                                  if (formData.plan === p) {
                                    setFormData(prev => ({ ...prev, plan: '' }));
                                  }
                                }}
                                className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-600 transition-all"
                                title="Eliminar"
                              >
                                <Icon name="TrashOutline" size="sm" color="#dc2626" />
                              </button>
                            </div>
                          ))}
                        
                        {formData.plan && !planes.map(p => p.toLowerCase()).includes(formData.plan.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nueva = formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1);
                              setPlanes(prev => [...new Set([...prev, nueva])]);
                              setFormData(prev => ({ ...prev, plan: nueva }));
                              setShowPlanesDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-green-700 font-semibold border-t-2 border-green-200 flex items-center gap-2"
                          >
                            <Icon name="AddOutline" size="sm" color="#16a34a" />
                            Agregar plan: "{formData.plan}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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
                <p className="text-sm text-gray-500 mt-1">{celularesFiltrados.length} de {celulares.length} dispositivo{celulares.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={handleExportarExcel}
                className="btn-primary flex items-center justify-center gap-2"
                disabled={celularesFiltrados.length === 0}
              >
                <Icon name="DownloadOutline" size="sm" color="white" />
                Exportar a Excel
              </button>
            </div>

            {/* Sección de filtros */}
            <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="FunnelOutline" size="sm" color="#6b7280" />
                Filtros
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Condición</label>
                  <select
                    name="condicion"
                    value={filtros.condicion}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Todas</option>
                    {getCondicionesUnicas().map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Restricción</label>
                  <select
                    name="restriccion"
                    value={filtros.restriccion}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Todas</option>
                    {getRestriccionesUnicas().map(rest => (
                      <option key={rest} value={rest}>{rest}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Serial</label>
                  <input
                    type="text"
                    name="serial"
                    value={filtros.serial}
                    onChange={handleFiltroChange}
                    placeholder="Buscar..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Marca</label>
                  <select
                    name="marca"
                    value={filtros.marca}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Todas</option>
                    {getMarcasUnicas().map(marca => (
                      <option key={marca} value={marca}>{marca}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={filtros.modelo}
                    onChange={handleFiltroChange}
                    placeholder="Buscar..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">IMEI</label>
                  <input
                    type="text"
                    name="imei"
                    value={filtros.imei}
                    onChange={handleFiltroChange}
                    placeholder="Buscar..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={filtros.numero}
                    onChange={handleFiltroChange}
                    placeholder="Buscar..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <button
                onClick={handleLimpiarFiltros}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
              >
                <Icon name="CloseOutline" size="sm" color="#6b7280" />
                Limpiar filtros
              </button>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p className="text-gray-600 mt-3">Cargando celulares...</p>
              </div>
            )}

            {celularesFiltrados.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <Icon name="PhonePortraitOutline" size="xl" color="#9ca3af" />
                </div>
                <p className="text-gray-600 font-semibold">No hay celulares que coincidan con los filtros</p>
                <p className="text-sm text-gray-500 mt-1">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            )}

            {celularesFiltrados.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Tipo Equipo</th>
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
                    {celularesFiltrados.map(celular => (
                      <tr key={celular.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            celular.tipoEquipo === 'FLOTA' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {celular.tipoEquipo}
                          </span>
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
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Celular"
        message="¿Estás seguro de que deseas eliminar este celular? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
