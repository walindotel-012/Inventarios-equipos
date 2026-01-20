import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';
import { logAudit } from '../utils/auditLog';
import * as XLSX from 'xlsx';

const TIPOS_DISPOSITIVOS_INICIALES = [
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
  const [searchParams] = useSearchParams();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(searchParams.get('form') === 'true');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importText, setImportText] = useState('');
  const [tiposDispositivos, setTiposDispositivos] = useState(TIPOS_DISPOSITIVOS_INICIALES);
  const [filtros, setFiltros] = useState({
    tipoEquipo: '',
    marca: '',
    modelo: '',
    condicion: '',
  });
  const [marcas, setMarcas] = useState(['Lenovo', 'Dell', 'HP', 'Grandstream']);
  const [showMarcasDropdown, setShowMarcasDropdown] = useState(false);
  const [showTiposDropdown, setShowTiposDropdown] = useState(false);
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

  const discos = ['512 GB', '1 TB', '2 TB'];
  const memorias = ['16 GB', '32 GB', '64 GB', '8 GB'];
  const condiciones = ['Nuevo', 'Usado'];

  // Generar el próximo código de activo fijo
  const generarProximoCodigo = (listaEquipos = equipos) => {
    // Extraer números de códigos existentes en formato ATM-EQ-###
    const numeros = listaEquipos
      .map(equipo => {
        const match = equipo.codActivoFijo.match(/ATM-EQ-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => b - a);
    
    const proximoNumero = (numeros.length > 0 ? numeros[0] : 0) + 1;
    return `ATM-EQ-${String(proximoNumero).padStart(3, '0')}`;
  };

  // Obtener próximo código leyendo directamente de Firestore
  const obtenerProximoCodigoDirecto = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return generarProximoCodigo(equiposList);
    } catch (error) {
      console.error('Error obteniendo próximo código:', error);
      return 'ATM-EQ-001'; // Valor por defecto si hay error
    }
  };

  // Cargar equipos
  useEffect(() => {
    loadEquipos();
  }, []);

  // Abrir formulario si viene parámetro form=true desde el Dashboard
  useEffect(() => {
    if (searchParams.get('form') === 'true') {
      handleNuevoEquipo();
    }
  }, [searchParams]);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposList);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario y asignar código automático
  const handleNuevoEquipo = () => {
    const proximoCodigo = generarProximoCodigo();
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
    // Al editar, permitir guardar incluso si hay campos vacíos (siempre que sea un equipo existente)
    if (!editingId) {
      // Solo validar cuando es NUEVO
      const requiredFields = { ...formData };
      delete requiredFields.licencia; // Licencia es opcional
      
      if (Object.values(requiredFields).some(value => !value)) {
        showToast('Por favor completa todos los campos (licencia es opcional)', 'warning');
        return;
      }
    } else {
      // Al editar, solo requerir que tenga al menos el serial o código de activo
      if (!formData.sn && !formData.codActivoFijo) {
        showToast('Por favor ingresa al menos el Serial o Código de Activo', 'warning');
        return;
      }
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
        // Obtener el equipo anterior para comparar
        const equipoAnterior = equipos.find(e => e.id === editingId);
        
        // Actualizar equipo existente
        await updateDoc(doc(db, 'equipos', editingId), {
          ...formData,
          actualizadoPor: currentUser.displayName || currentUser.email,
          fechaActualizacion: new Date(),
        });

        // Registrar en auditoría
        await logAudit(
          currentUser.uid,
          currentUser.displayName || currentUser.email,
          'UPDATE',
          'Equipos',
          editingId,
          {
            anterior: equipoAnterior,
            nuevo: formData,
          }
        );

        // PROPAGAR CAMBIOS A ASIGNACIONES
        // Buscar todas las asignaciones que contienen este equipo
        const asignacionesSnapshot = await getDocs(collection(db, 'asignaciones'));
        const asignacionesAActualizar = [];

        asignacionesSnapshot.docs.forEach(docAsignacion => {
          const asignacion = docAsignacion.data();
          
          // Verificar si el equipo es el principal
          if (asignacion.sn === equipoAnterior?.sn || asignacion.codActivoFijo === equipoAnterior?.codActivoFijo) {
            asignacionesAActualizar.push({
              id: docAsignacion.id,
              tipo: 'principal',
              data: {
                marca: formData.marca,
                modelo: formData.modelo,
                sn: formData.sn,
                disco: formData.disco,
                memoria: formData.memoria,
                procesador: formData.procesador,
                so: formData.so,
                licencia: formData.licencia,
                tipoEquipo: formData.tipoEquipo,
                condicion: formData.condicion,
                codActivoFijo: formData.codActivoFijo,
              }
            });
          }
          
          // Verificar si el equipo es secundario
          if (asignacion.snSecundario === equipoAnterior?.sn || asignacion.codActivoFijoSecundario === equipoAnterior?.codActivoFijo) {
            asignacionesAActualizar.push({
              id: docAsignacion.id,
              tipo: 'secundario',
              data: {
                marcaSecundario: formData.marca,
                modeloSecundario: formData.modelo,
                snSecundario: formData.sn,
                discoSecundario: formData.disco,
                memoriaSecundario: formData.memoria,
                procesadorSecundario: formData.procesador,
                soSecundario: formData.so,
                licenciaSecundario: formData.licencia,
                tipoEquipoSecundario: formData.tipoEquipo,
                condicionSecundario: formData.condicion,
                codActivoFijoSecundario: formData.codActivoFijo,
              }
            });
          }
        });

        // Actualizar cada asignación encontrada
        for (const asignacionActualizar of asignacionesAActualizar) {
          try {
            await updateDoc(doc(db, 'asignaciones', asignacionActualizar.id), asignacionActualizar.data);
            console.log(`✅ Asignación ${asignacionActualizar.id} actualizada (equipo ${asignacionActualizar.tipo})`);
          } catch (error) {
            console.error(`Error al actualizar asignación ${asignacionActualizar.id}:`, error);
          }
        }

        if (asignacionesAActualizar.length > 0) {
          showToast(`✅ Equipo actualizado. ${asignacionesAActualizar.length} asignación(es) también fue(ron) actualizada(s)`, 'success');
        } else {
          showToast('Equipo actualizado exitosamente', 'success');
        }
        setShowForm(false);
      } else {
        // Crear nuevo equipo
        const docRef = await addDoc(collection(db, 'equipos'), {
          ...formData,
          registradoPor: currentUser.displayName || currentUser.email,
          fechaRegistro: new Date(),
        });
        
        // Registrar en auditoría
        await logAudit(
          currentUser.uid,
          currentUser.displayName || currentUser.email,
          'CREATE',
          'Equipos',
          docRef.id,
          {
            codActivoFijo: formData.codActivoFijo,
            marca: formData.marca,
            modelo: formData.modelo,
            sn: formData.sn,
            tipoEquipo: formData.tipoEquipo,
          }
        );
        
        showToast('Equipo registrado exitosamente', 'success');
      }

      // Recargar equipos y obtener próximo código
      loadEquipos();
      
      // Generar el próximo código leyendo directamente de Firestore
      const proximoCodigo = await obtenerProximoCodigoDirecto();
      
      // Limpiar formulario con nuevo código (solo si es nuevo)
      if (!editingId) {
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
      }

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

      // Si no está asignado, mostrar dialog
      setDeleteId(id);
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error('Error al validar equipo:', error);
      showToast('Error al validar equipo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      const equipoAEliminar = equipos.find(e => e.id === deleteId);
      
      await deleteDoc(doc(db, 'equipos', deleteId));
      
      // Registrar en auditoría
      await logAudit(
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        'DELETE',
        'Equipos',
        deleteId,
        {
          codActivoFijo: equipoAEliminar?.codActivoFijo,
          marca: equipoAEliminar?.marca,
          modelo: equipoAEliminar?.modelo,
          sn: equipoAEliminar?.sn,
        }
      );
      
      showToast('Equipo eliminado exitosamente', 'success');
      loadEquipos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar equipo', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleImportEquipos = async (e) => {
    e.preventDefault();

    if (!importText.trim()) {
      showToast('Por favor pega los equipos a importar', 'warning');
      return;
    }

    // Parsear los equipos del texto (tab-separated)
    const lineas = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lineas.length === 0) {
      showToast('No hay equipos válidos para importar', 'warning');
      return;
    }

    try {
      setLoading(true);
      let importados = 0;
      let errores = 0;
      let seriesDuplicadas = 0;
      const proximoCodigo = generarProximoCodigo();
      let codigoActual = parseInt(proximoCodigo.replace('ATM-EQ-', ''));
      const seriesYaImportadas = new Set();

      for (const linea of lineas) {
        try {
          // Parsear los campos separados por TAB
          // Nuevo orden: Tipo de equipo | Condición | Marca | Modelo | Serial | Disco | Memoria | Procesador | SO | [Licencia (opcional)]
          const campos = linea.split('\t').map(c => c.trim());
          
          // Validar que haya al menos 9 campos (los requeridos sin licencia)
          if (campos.length < 9) {
            console.warn(`Línea skipped (campos insuficientes): ${linea.substring(0, 50)}...`);
            errores++;
            continue;
          }

          const [tipoEquipo, condicion, marca, modelo, sn, disco, memoria, procesador, so] = campos;
          const licencia = campos[9]?.trim() || ''; // Campo opcional

          // Validar campos requeridos
          if (!tipoEquipo || !condicion || !marca || !modelo || !sn || !disco || !memoria || !procesador || !so) {
            console.warn(`Línea skipped (campos vacíos): ${linea.substring(0, 50)}...`);
            errores++;
            continue;
          }

          // Convertir serial a mayúsculas
          const snMayuscula = sn.toUpperCase();

          // Validar que el serial no esté duplicado (en equipos existentes o ya importados en este lote)
          if (equipos.some(e => e.sn.toUpperCase() === snMayuscula) || seriesYaImportadas.has(snMayuscula)) {
            console.warn(`Serial duplicado: ${sn}`);
            seriesDuplicadas++;
            continue;
          }

          seriesYaImportadas.add(snMayuscula);

          // Crear código de activo fijo automáticamente
          const codActivoFijo = `ATM-EQ-${String(codigoActual).padStart(3, '0')}`;
          codigoActual++;

          // Insertar en Firestore
          await addDoc(collection(db, 'equipos'), {
            codActivoFijo,
            tipoEquipo: tipoEquipo.trim(),
            condicion: condicion.trim(),
            marca: marca.trim(),
            modelo: modelo.trim(),
            sn: snMayuscula,
            disco: disco.trim(),
            memoria: memoria.trim(),
            procesador: procesador.trim(),
            so: so.trim(),
            licencia: licencia,
            estado: 'disponible',
            asignado: false,
            registradoPor: currentUser.displayName || currentUser.email,
            fechaRegistro: new Date(),
          });

          importados++;
        } catch (lineError) {
          console.error('Error procesando línea:', lineError);
          errores++;
        }
      }

      let mensaje = `Se importaron ${importados} equipo${importados !== 1 ? 's' : ''}`;
      if (seriesDuplicadas > 0) {
        mensaje += ` (${seriesDuplicadas} serial${seriesDuplicadas !== 1 ? 'es' : ''} duplicado${seriesDuplicadas !== 1 ? 's' : ''} ignorado${seriesDuplicadas !== 1 ? 's' : ''})`;
      }
      if (errores > 0) {
        mensaje += ` (${errores} línea${errores !== 1 ? 's' : ''} con error)`;
      }
      showToast(mensaje, importados > 0 ? 'success' : 'warning');

      setImportText('');
      setShowImportForm(false);
      loadEquipos();
    } catch (error) {
      console.error('Error al importar:', error);
      showToast('Error al importar equipos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (equipos.length === 0) {
      showToast('No hay equipos para exportar', 'warning');
      return;
    }

    // Aplicar los mismos filtros que se ven en la tabla
    let equiposFiltrados = equipos;

    if (searchTerm) {
      equiposFiltrados = equiposFiltrados.filter(equipo =>
        equipo.codActivoFijo.includes(searchTerm) ||
        equipo.sn.toUpperCase().includes(searchTerm)
      );
    }

    if (filtros.tipoEquipo) {
      equiposFiltrados = equiposFiltrados.filter(equipo =>
        equipo.tipoEquipo === filtros.tipoEquipo
      );
    }

    if (filtros.marca) {
      equiposFiltrados = equiposFiltrados.filter(equipo =>
        equipo.marca === filtros.marca
      );
    }

    if (filtros.condicion) {
      equiposFiltrados = equiposFiltrados.filter(equipo =>
        equipo.condicion === filtros.condicion
      );
    }

    if (filtros.modelo) {
      equiposFiltrados = equiposFiltrados.filter(equipo =>
        equipo.modelo === filtros.modelo
      );
    }

    if (equiposFiltrados.length === 0) {
      showToast('No hay equipos que coincidan con los filtros para exportar', 'warning');
      return;
    }

    const dataExport = equiposFiltrados.map(equipo => ({
      'Código Activo Fijo': equipo.codActivoFijo,
      'Marca': equipo.marca,
      'Modelo': equipo.modelo,
      'Serial': equipo.sn,
      'Disco': equipo.disco,
      'Memoria': equipo.memoria,
      'Procesador': equipo.procesador,
      'Sistema Operativo': equipo.so,
      'Licencia': equipo.licencia || '',
      'Tipo de Equipo': equipo.tipoEquipo || '',
      'Condición': equipo.condicion || '',
      'Estado': equipo.estado || 'disponible',
      'Registrado por': equipo.registradoPor || '',
      'Fecha Registro': equipo.fechaRegistro ? new Date(equipo.fechaRegistro.seconds * 1000).toLocaleDateString() : ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const columnWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 20 }, { wch: 15 }
    ];
    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
    XLSX.writeFile(wb, `Equipos_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Equipos exportados exitosamente', 'success');
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
          {!showForm && !showImportForm && (
            <div className="flex gap-2">
              <button
                onClick={handleExportToExcel}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Icon name="BarChartOutline" size="sm" color="#6b7280" />
                Exportar Excel
              </button>
              <button
                onClick={() => setShowImportForm(true)}
                className="btn-secondary"
              >
                📥 Importar en Lote
              </button>
              <button
                onClick={handleNuevoEquipo}
                className="btn-primary"
              >
                ➕ Nuevo Equipo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showImportForm ? (
          // Vista con formulario de importación
          <div className="card-saas-lg bg-white max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-lg">📥</div>
              Importar Equipos en Lote
            </h2>

            <form onSubmit={handleImportEquipos} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
                <Icon name="InformationCircleOutline" size="sm" color="#0284c7" />
                <div>
                  <p className="text-blue-900 text-sm font-semibold">Formato esperado (separado por TAB)</p>
                  <p className="text-blue-800 text-xs mt-2 font-mono">
                    Tipo de equipo | Condición | Marca | Modelo | Serial | Disco | Memoria | Procesador | SO | [Licencia (opcional)]
                  </p>
                  <p className="text-blue-800 text-xs mt-2">
                    Ejemplo: Laptop | Nuevo | Dell | Latitude 5550 | D6TK374 | 512 GB | 16GB | Intel® Core™ Ultra 5 125U 1.30 GHZ | Windows 11 Pro | Office 2024
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Equipos (uno por línea, separados por TAB)
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega los equipos aquí&#10;Usa el formato: Tipo	Condición	Marca	Modelo	Serial	Disco	Memoria	Procesador	SO	[Licencia]"
                  rows="12"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-mono"
                  required
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Se importarán: {importText.split('\n').filter(l => l.trim().length > 0).length} equipo(s)
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
                <Icon name="AlertCircleOutline" size="sm" color="#d97706" />
                <div>
                  <p className="text-amber-900 text-sm font-semibold">Información importante</p>
                  <ul className="text-amber-800 text-xs mt-1 space-y-1">
                    <li>• Se generarán códigos de activo fijo automáticamente</li>
                    <li>• Los seriales duplicados serán ignorados</li>
                    <li>• Se convertirán seriales a mayúsculas</li>
                    <li>• Todos los campos son requeridos excepto Licencia</li>
                    <li>• Tipo de equipo y Condición deben ser completados por el usuario</li>
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
                  <div className="relative">
                    <input
                      type="text"
                      name="tipoEquipo"
                      value={formData.tipoEquipo}
                      onChange={handleChange}
                      onFocus={() => setShowTiposDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTiposDropdown(false), 200)}
                      placeholder="Escribir o seleccionar..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                    
                    {/* Dropdown de tipos */}
                    {showTiposDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {/* Mostrar sugerencias filtradas */}
                        {tiposDispositivos
                          .filter(tipo => tipo.toLowerCase().includes(formData.tipoEquipo.toLowerCase()))
                          .map(tipo => (
                            <div
                              key={tipo}
                              className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, tipoEquipo: tipo }));
                                  setShowTiposDropdown(false);
                                }}
                                className="flex-1 text-left"
                              >
                                {tipo}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTiposDispositivos(prev => prev.filter(t => t !== tipo));
                                  if (formData.tipoEquipo === tipo) {
                                    setFormData(prev => ({ ...prev, tipoEquipo: '' }));
                                  }
                                }}
                                className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-600 transition-all"
                                title="Eliminar tipo"
                              >
                                <Icon name="TrashOutline" size="sm" color="#dc2626" />
                              </button>
                            </div>
                          ))}
                        
                        {/* Opción para crear nuevo tipo si no existe */}
                        {formData.tipoEquipo && !tiposDispositivos.map(t => t.toLowerCase()).includes(formData.tipoEquipo.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nuevoTipo = formData.tipoEquipo.charAt(0).toUpperCase() + formData.tipoEquipo.slice(1);
                              setTiposDispositivos(prev => [...new Set([...prev, nuevoTipo])]);
                              setFormData(prev => ({ ...prev, tipoEquipo: nuevoTipo }));
                              setShowTiposDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-green-700 font-semibold border-t-2 border-green-200 flex items-center gap-2"
                          >
                            <Icon name="AddOutline" size="sm" color="#16a34a" />
                            Agregar tipo: "{formData.tipoEquipo}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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
                  <div className="relative">
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      onFocus={() => setShowMarcasDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMarcasDropdown(false), 200)}
                      placeholder="Escribir o seleccionar..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                    
                    {/* Dropdown de marcas */}
                    {showMarcasDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {/* Mostrar sugerencias filtradas */}
                        {marcas
                          .filter(marca => marca.toLowerCase().includes(formData.marca.toLowerCase()))
                          .map(marca => (
                            <div
                              key={marca}
                              className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, marca }));
                                  setShowMarcasDropdown(false);
                                }}
                                className="flex-1 text-left"
                              >
                                {marca}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMarcas(prev => prev.filter(m => m !== marca));
                                  if (formData.marca === marca) {
                                    setFormData(prev => ({ ...prev, marca: '' }));
                                  }
                                }}
                                className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-600 transition-all"
                                title="Eliminar marca"
                              >
                                <Icon name="TrashOutline" size="sm" color="#dc2626" />
                              </button>
                            </div>
                          ))}
                        
                        {/* Opción para crear nueva marca si no existe */}
                        {formData.marca && !marcas.map(m => m.toLowerCase()).includes(formData.marca.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nuevaMarca = formData.marca.charAt(0).toUpperCase() + formData.marca.slice(1);
                              setMarcas(prev => [...new Set([...prev, nuevaMarca])]);
                              setFormData(prev => ({ ...prev, marca: nuevaMarca }));
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
            {(() => {
              // Calcular equipos filtrados para el contador
              let equiposFiltradosConteo = equipos;

              if (searchTerm) {
                equiposFiltradosConteo = equiposFiltradosConteo.filter(equipo =>
                  equipo.codActivoFijo.includes(searchTerm) ||
                  equipo.sn.toUpperCase().includes(searchTerm)
                );
              }

              if (filtros.tipoEquipo) {
                equiposFiltradosConteo = equiposFiltradosConteo.filter(equipo =>
                  equipo.tipoEquipo === filtros.tipoEquipo
                );
              }

              if (filtros.marca) {
                equiposFiltradosConteo = equiposFiltradosConteo.filter(equipo =>
                  equipo.marca === filtros.marca
                );
              }

              if (filtros.modelo) {
                equiposFiltradosConteo = equiposFiltradosConteo.filter(equipo =>
                  equipo.modelo === filtros.modelo
                );
              }

              if (filtros.condicion) {
                equiposFiltradosConteo = equiposFiltradosConteo.filter(equipo =>
                  equipo.condicion === filtros.condicion
                );
              }

              const hayFiltrosActivos = searchTerm || filtros.tipoEquipo || filtros.marca || filtros.modelo || filtros.condicion;

              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Equipos Registrados</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {hayFiltrosActivos ? (
                          <>
                            <span className="font-semibold">{equiposFiltradosConteo.length}</span> de {equipos.length} dispositivo{equipos.length !== 1 ? 's' : ''}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">{equipos.length}</span> dispositivo{equipos.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()} 

            {/* Filtro moderno */}
            {equipos.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                  {/* Búsqueda por código o serial */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Buscar</label>
                    <input
                      type="text"
                      placeholder="Código o Serial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  {/* Filtro por Tipo de Equipo */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo de Equipo</label>
                    <select
                      value={filtros.tipoEquipo}
                      onChange={(e) => setFiltros({...filtros, tipoEquipo: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      {[...new Set(equipos.map(e => e.tipoEquipo))].filter(Boolean).sort().map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Marca */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Marca</label>
                    <select
                      value={filtros.marca}
                      onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      {[...new Set(equipos.map(e => e.marca))].filter(Boolean).sort().map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Modelo */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Modelo</label>
                    <select
                      value={filtros.modelo}
                      onChange={(e) => setFiltros({...filtros, modelo: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      {[...new Set(equipos.map(e => e.modelo))].filter(Boolean).sort().map(modelo => (
                        <option key={modelo} value={modelo}>{modelo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Condición */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Condición</label>
                    <select
                      value={filtros.condicion}
                      onChange={(e) => setFiltros({...filtros, condicion: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      {[...new Set(equipos.map(e => e.condicion))].filter(Boolean).sort().map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>

                  {/* Botón Limpiar filtros */}
                  <div className="flex items-end">
                    {(searchTerm || filtros.tipoEquipo || filtros.marca || filtros.modelo || filtros.condicion) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFiltros({ tipoEquipo: '', marca: '', modelo: '', condicion: '' });
                        }}
                        className="w-full px-3 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
                      >
                        ✕ Limpiar
                      </button>
                    )}
                  </div>
                </div>
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

                      // Filtrar según búsqueda y filtros
                      let equiposFiltrados = equiposOrdenados;

                      // Filtro de búsqueda
                      if (searchTerm) {
                        equiposFiltrados = equiposFiltrados.filter(equipo =>
                          equipo.codActivoFijo.includes(searchTerm) ||
                          equipo.sn.toUpperCase().includes(searchTerm)
                        );
                      }

                      // Filtro por tipo de equipo
                      if (filtros.tipoEquipo) {
                        equiposFiltrados = equiposFiltrados.filter(equipo =>
                          equipo.tipoEquipo === filtros.tipoEquipo
                        );
                      }

                      // Filtro por marca
                      if (filtros.marca) {
                        equiposFiltrados = equiposFiltrados.filter(equipo =>
                          equipo.marca === filtros.marca
                        );
                      }

                      // Filtro por condición
                      if (filtros.condicion) {
                        equiposFiltrados = equiposFiltrados.filter(equipo =>
                          equipo.condicion === filtros.condicion
                        );
                      }

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
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Equipo"
          message="¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
