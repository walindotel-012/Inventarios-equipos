import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import { useToastManager } from '../hooks/useToastManager';
import * as XLSX from 'xlsx';

export default function Asignacion() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [asignaciones, setAsignaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEquipoSecundario, setShowEquipoSecundario] = useState(false);

  const [formData, setFormData] = useState({
    sucursal: '',
    oficina: '',
    puesto: '',
    nombre: '',
    usuario: '',
    empresa: 'AUTOMÍA SAS',
    equipo: '',
    codActivoFijo: '',
    netbiosName: '',
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
    fechaAsignacion: new Date().toISOString().split('T')[0],
    asignadoPor: currentUser?.displayName || currentUser?.email,
    hojaEntregaUrl: '',
    nombreEntrega: currentUser?.displayName || currentUser?.email,
    fechaEntrega: new Date().toISOString().split('T')[0],
    // Equipo Secundario
    equipoSecundario: '',
    codActivoFijoSecundario: '',
    marcaSecundario: '',
    modeloSecundario: '',
    snSecundario: '',
    discoSecundario: '',
    memoriaSecundario: '',
    procesadorSecundario: '',
    soSecundario: '',
    licenciaSecundario: '',
    tipoEquipoSecundario: '',
    condicionSecundario: '',
    // Celular
    celularId: '',
    serialCelular: '',
    marcaCelular: '',
    modeloCelular: '',
    numeroCelular: '',
    condicionCelular: '',
    restriccionCelular: '',
    imeiCelular: '',
    planCelular: '',
    fechaAsignacionCelular: '',
    observaciones: '',
  });

  useEffect(() => {
    loadAsignaciones();
    loadEquipos();
    loadCelulares();
    loadNomenclaturas();
  }, []);

  const loadAsignaciones = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'asignaciones'));
      const asignacionesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAsignaciones(asignacionesList);
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
    }
  };

  const loadEquipos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filtrar solo equipos disponibles (no asignados)
        .filter(equipo => !equipo.asignado || equipo.estado === 'disponible');
      setEquipos(equiposList);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    }
  };

  const loadCelulares = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'celulares'));
      const celularesList = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filtrar solo celulares disponibles (no asignados)
        .filter(celular => !celular.asignado || celular.estado === 'disponible');
      setCelulares(celularesList);
    } catch (error) {
      console.error('Error cargando celulares:', error);
    }
  };

  const loadNomenclaturas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'nomenclaturas'));
      const nomenclaturasList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNomenclaturas(nomenclaturasList);
    } catch (error) {
      console.error('Error cargando nomenclaturas:', error);
    }
  };

  const handleEquipoChange = (snValue) => {
    const equipo = equipos.find(e => e.sn === snValue);
    if (equipo) {
      setFormData(prev => ({
        ...prev,
        equipo: equipo.id,
        codActivoFijo: equipo.codActivoFijo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        sn: equipo.sn,
        disco: equipo.disco,
        memoria: equipo.memoria,
        procesador: equipo.procesador,
        so: equipo.so,
        licencia: equipo.licencia,
        tipoEquipo: equipo.tipoEquipo,
        condicion: equipo.condicion,
      }));
    }
  };

  const handleCelularChange = (celularId) => {
    const celular = celulares.find(c => c.id === celularId);
    if (celular) {
      setFormData(prev => ({
        ...prev,
        celularId: celular.id,
        serialCelular: celular.serial || '',
        marcaCelular: celular.marca || '',
        modeloCelular: celular.modelo || '',
        numeroCelular: celular.numero || '',
        condicionCelular: celular.condicion || '',
        restriccionCelular: celular.restriccion || '',
        imeiCelular: celular.imei || '',
        planCelular: celular.plan || '',
        fechaAsignacionCelular: celular.fechaEntrega || new Date().toISOString().split('T')[0],
      }));
    } else if (celularId === '') {
      setFormData(prev => ({
        ...prev,
        celularId: '',
        serialCelular: '',
        marcaCelular: '',
        modeloCelular: '',
        numeroCelular: '',
        condicionCelular: '',
        restriccionCelular: '',
        imeiCelular: '',
        planCelular: '',
        fechaAsignacionCelular: '',
      }));
    }
  };

  const handleEquipoSecundarioChange = (snValue) => {
    const equipo = equipos.find(e => e.sn === snValue);
    if (equipo) {
      setFormData(prev => ({
        ...prev,
        equipoSecundario: equipo.id,
        codActivoFijoSecundario: equipo.codActivoFijo,
        marcaSecundario: equipo.marca,
        modeloSecundario: equipo.modelo,
        snSecundario: equipo.sn,
        discoSecundario: equipo.disco,
        memoriaSecundario: equipo.memoria,
        procesadorSecundario: equipo.procesador,
        soSecundario: equipo.so,
        licenciaSecundario: equipo.licencia,
        tipoEquipoSecundario: equipo.tipoEquipo,
        condicionSecundario: equipo.condicion,
      }));
    } else if (snValue === '') {
      setFormData(prev => ({
        ...prev,
        equipoSecundario: '',
        codActivoFijoSecundario: '',
        marcaSecundario: '',
        modeloSecundario: '',
        snSecundario: '',
        discoSecundario: '',
        memoriaSecundario: '',
        procesadorSecundario: '',
        soSecundario: '',
        licenciaSecundario: '',
        tipoEquipoSecundario: '',
        condicionSecundario: '',
      }));
    }
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

    if (!formData.sucursal || !formData.oficina || !formData.puesto || 
        !formData.nombre || !formData.usuario) {
      showToast('Por favor completa los datos del colaborador', 'warning');
      return;
    }

    // Validación: NO permitir 3 registros (Principal + Secundario + Celular)
    const tieneEquipoPrincipal = !!formData.sn;
    const tieneEquipoSecundario = !!formData.snSecundario;
    const tieneCelular = !!formData.serialCelular;

    if (tieneEquipoPrincipal && tieneEquipoSecundario && tieneCelular) {
      showToast('❌ No se puede asignar simultáneamente: Equipo Principal, Equipo Secundario y Celular. Máximo 2 dispositivos.', 'error');
      return;
    }

    if (!formData.equipo && !formData.serialCelular && !formData.equipoSecundario) {
      showToast('Por favor asigna al menos un equipo o un celular', 'warning');
      return;
    }

    if (formData.sn) {
      const equipoAsignado = asignaciones.find(a => 
        a.sn === formData.sn && a.id !== editingId
      );
      if (equipoAsignado) {
        showToast(`Este equipo (Serial: ${formData.sn}) ya está asignado a: ${equipoAsignado.nombre}`, 'warning');
        return;
      }
    }

    if (formData.serialCelular) {
      const celularAsignado = asignaciones.find(a => 
        a.serialCelular === formData.serialCelular && a.id !== editingId
      );
      if (celularAsignado) {
        showToast(`Este celular (Serial: ${formData.serialCelular}) ya está asignado a: ${celularAsignado.nombre}`, 'warning');
        return;
      }
    }

    if (formData.netbiosName) {
      const netbiosDuplicado = asignaciones.find(a => 
        a.netbiosName === formData.netbiosName && a.id !== editingId
      );
      if (netbiosDuplicado) {
        showToast(`El NetBios "${formData.netbiosName}" ya está en uso por: ${netbiosDuplicado.nombre}`, 'warning');
        return;
      }
    }

    try {
      setLoading(true);
      
      if (editingId) {
        await updateDoc(doc(db, 'asignaciones', editingId), {
          ...formData,
          actualizadoPor: currentUser?.displayName || currentUser?.email,
          fechaActualizacion: new Date(),
        });
        showToast('Asignación actualizada exitosamente', 'success');
      } else {
        // Agregar nueva asignación
        await addDoc(collection(db, 'asignaciones'), {
          ...formData,
          fechaRegistro: new Date(),
        });

        // Si es un equipo, marcarlo como asignado
        if (formData.codActivoFijo) {
          const equipoToUpdate = equipos.find(e => e.codActivoFijo === formData.codActivoFijo);
          if (equipoToUpdate) {
            await updateDoc(doc(db, 'equipos', equipoToUpdate.id), {
              estado: 'asignado',
              asignado: true,
            });
          }
        }

        // Si es un equipo secundario, marcarlo como asignado
        if (formData.codActivoFijoSecundario) {
          const equipoSecToUpdate = equipos.find(e => e.codActivoFijo === formData.codActivoFijoSecundario);
          if (equipoSecToUpdate) {
            await updateDoc(doc(db, 'equipos', equipoSecToUpdate.id), {
              estado: 'asignado',
              asignado: true,
            });
          }
        }

        // Si es un celular, marcarlo como asignado
        if (formData.serialCelular) {
          const celularToUpdate = celulares.find(c => c.serial === formData.serialCelular);
          if (celularToUpdate) {
            await updateDoc(doc(db, 'celulares', celularToUpdate.id), {
              estado: 'asignado',
              asignado: true,
            });
          }
        }

        showToast('Asignación registrada exitosamente', 'success');
      }

      setFormData({
        sucursal: '',
        oficina: '',
        puesto: '',
        nombre: '',
        usuario: '',
        empresa: 'AUTOMÍA SAS',
        equipo: '',
        codActivoFijo: '',
        netbiosName: '',
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
        fechaAsignacion: new Date().toISOString().split('T')[0],
        asignadoPor: currentUser?.displayName || currentUser?.email,
        hojaEntregaUrl: '',
        nombreEntrega: currentUser?.displayName || currentUser?.email,
        fechaEntrega: new Date().toISOString().split('T')[0],
        // Equipo Secundario
        equipoSecundario: '',
        codActivoFijoSecundario: '',
        marcaSecundario: '',
        modeloSecundario: '',
        snSecundario: '',
        discoSecundario: '',
        memoriaSecundario: '',
        procesadorSecundario: '',
        soSecundario: '',
        licenciaSecundario: '',
        tipoEquipoSecundario: '',
        condicionSecundario: '',
        // Celular
        celularId: '',
        serialCelular: '',
        marcaCelular: '',
        modeloCelular: '',
        numeroCelular: '',
        condicionCelular: '',
        restriccionCelular: '',
        imeiCelular: '',
        planCelular: '',
        fechaAsignacionCelular: '',
        observaciones: '',
      });

      setShowEquipoSecundario(false);
      setEditingId(null);
      loadAsignaciones();
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al registrar asignación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (asignacion) => {
    setFormData(asignacion);
    setEditingId(asignacion.id);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      sucursal: '',
      oficina: '',
      puesto: '',
      nombre: '',
      usuario: '',
      empresa: 'AUTOMÍA SAS',
      equipo: '',
      codActivoFijo: '',
      netbiosName: '',
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
      fechaAsignacion: new Date().toISOString().split('T')[0],
      asignadoPor: currentUser?.displayName || currentUser?.email,
      hojaEntregaUrl: '',
      nombreEntrega: currentUser?.displayName || currentUser?.email,
      fechaEntrega: new Date().toISOString().split('T')[0],
      celularId: '',
      serialCelular: '',
      marcaCelular: '',
      modeloCelular: '',
      numeroCelular: '',
      condicionCelular: '',
      restriccionCelular: '',
      imeiCelular: '',
      planCelular: '',
      fechaAsignacionCelular: '',
      observaciones: '',
    });
  };

  const handleNueva = () => {
    setFormData({
      sucursal: '',
      oficina: '',
      puesto: '',
      nombre: '',
      usuario: '',
      empresa: 'AUTOMÍA SAS',
      equipo: '',
      codActivoFijo: '',
      netbiosName: '',
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
      fechaAsignacion: new Date().toISOString().split('T')[0],
      asignadoPor: currentUser?.displayName || currentUser?.email,
      hojaEntregaUrl: '',
      nombreEntrega: currentUser?.displayName || currentUser?.email,
      fechaEntrega: new Date().toISOString().split('T')[0],
      celularId: '',
      serialCelular: '',
      marcaCelular: '',
      modeloCelular: '',
      numeroCelular: '',
      condicionCelular: '',
      restriccionCelular: '',
      imeiCelular: '',
      planCelular: '',
      fechaAsignacionCelular: '',
      observaciones: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'asignaciones', id));
        showToast('Asignación eliminada', 'success');
        loadAsignaciones();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showToast('Error al eliminar asignación', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportToExcel = () => {
    if (asignaciones.length === 0) {
      showToast('No hay asignaciones para exportar', 'warning');
      return;
    }

    const dataExport = asignaciones.map(asignacion => ({
      'Sucursal': asignacion.sucursal,
      'Oficina': asignacion.oficina,
      'Puesto': asignacion.puesto,
      'Nombre': asignacion.nombre,
      'Usuario': asignacion.usuario,
      'Empresa': asignacion.empresa,
      'Equipo': `${asignacion.marca} ${asignacion.modelo}`,
      'S/N': asignacion.sn,
      'Código Activo': asignacion.codActivoFijo,
      'NetBios': asignacion.netbiosName,
      'Disco': asignacion.disco,
      'Memoria': asignacion.memoria,
      'Procesador': asignacion.procesador,
      'SO': asignacion.so,
      'Licencia': asignacion.licencia,
      'Fecha Asignación': asignacion.fechaAsignacion,
      'Asignado Por': asignacion.asignadoPor,
      'Celular': asignacion.marcaCelular ? `${asignacion.marcaCelular} ${asignacion.modeloCelular}` : 'N/A',
      'Serial Celular': asignacion.serialCelular || 'N/A',
      'IMEI': asignacion.imeiCelular || 'N/A',
      'Número': asignacion.numeroCelular || 'N/A',
      'Condición Celular': asignacion.condicionCelular || 'N/A',
      'Restricción': asignacion.restriccionCelular || 'N/A',
      'Plan': asignacion.planCelular || 'N/A',
      'Observaciones': asignacion.observaciones,
      'URL Hoja de Entrega (OneDrive)': asignacion.hojaEntregaUrl || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asignaciones');

    const columnWidths = [
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 40 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Asignaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Gestión de Asignaciones</h1>
            <p className="text-gray-600 text-base">Registra y administra asignaciones de equipos a colaboradores</p>
          </div>
          {!showForm && (
            <div className="flex gap-3">
              <button
                onClick={handleExportToExcel}
                className="btn-secondary"
              >
                📊 Exportar Excel
              </button>
              <button
                onClick={handleNueva}
                className="btn-primary"
              >
                ➕ Nueva Asignación
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm ? (
          <div className="card-saas-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-lg">📋</div>
              {editingId ? 'Editar Asignación' : 'Nueva Asignación'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">👤</span> Datos del Colaborador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Empresa *</label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="AUTOMÍA SAS"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Colaborador *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Posición/Puesto *</label>
                    <input
                      type="text"
                      name="puesto"
                      value={formData.puesto}
                      onChange={handleChange}
                      placeholder="Ej: Jefe de Taller"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Departamento/Sucursal *</label>
                    <input
                      type="text"
                      name="sucursal"
                      value={formData.sucursal}
                      onChange={handleChange}
                      placeholder="Ej: Potencia"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Oficina *</label>
                    <input
                      type="text"
                      name="oficina"
                      value={formData.oficina}
                      onChange={handleChange}
                      placeholder="Ej: Principal"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario *</label>
                    <input
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      placeholder="Ej: jperez"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl border-2 border-green-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">💻</span> Equipo Principal (Laptop)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Serial del Equipo (S/N) *</label>
                    <select
                      name="equipo"
                      value={formData.sn}
                      onChange={(e) => handleEquipoChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    >
                      <option value="">Seleccionar serial...</option>
                      {equipos.map(eq => (
                        <option key={eq.id} value={eq.sn}>
                          {eq.sn} - {eq.marca} {eq.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Código Activo Fijo</label>
                    <input type="text" value={formData.codActivoFijo} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                    <input type="text" value={formData.marca} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                    <input type="text" value={formData.modelo} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
                    <input type="text" value={formData.tipoEquipo} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Condición</label>
                    <input type="text" value={formData.condicion} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NetBios Name</label>
                    <select
                      name="netbiosName"
                      value={formData.netbiosName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <option value="">Seleccionar...</option>
                      {nomenclaturas.map(nom => (
                        <option key={nom.id} value={nom.netbiosName}>
                          {nom.netbiosName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Asignación</label>
                    <input
                      type="date"
                      name="fechaAsignacion"
                      value={formData.fechaAsignacion}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
                {formData.equipo && (
                  <div className="bg-white p-4 rounded-xl border border-green-200 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Especificaciones del Equipo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-gray-600">Especificación 1:</span><p className="font-semibold">{formData.disco}</p></div>
                      <div><span className="text-gray-600">Especificación 2:</span><p className="font-semibold">{formData.memoria}</p></div>
                      <div><span className="text-gray-600">Especificación 3:</span><p className="font-semibold">{formData.procesador}</p></div>
                      <div><span className="text-gray-600">Especificación 4:</span><p className="font-semibold">{formData.so}</p></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón para agregar Equipo Secundario */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowEquipoSecundario(!showEquipoSecundario)}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                    showEquipoSecundario
                      ? 'bg-orange-500 text-white shadow-lg hover:bg-orange-600'
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200 border-2 border-orange-300'
                  }`}
                >
                  <span className="text-xl">{showEquipoSecundario ? '−' : '+'}</span>
                  <span>{showEquipoSecundario ? 'Ocultar Equipo Secundario' : 'Agregar Equipo Secundario'}</span>
                </button>
              </div>

              {/* Sección Equipo Secundario (Condicional) */}
              {showEquipoSecundario && (
                <div className="bg-orange-50 rounded-2xl border-2 border-orange-100 p-6 animate-in fade-in duration-300">
                  <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                    <span className="text-2xl">💾</span> Equipo Secundario (Opcional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Serial del Equipo (S/N)</label>
                      <select
                        name="equipoSecundario"
                        value={formData.snSecundario}
                        onChange={(e) => handleEquipoSecundarioChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="">Seleccionar serial...</option>
                        {equipos.map(eq => (
                          <option key={eq.id} value={eq.sn}>
                            {eq.sn} - {eq.marca} {eq.modelo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Código Activo Fijo</label>
                      <input type="text" value={formData.codActivoFijoSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                      <input type="text" value={formData.marcaSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                      <input type="text" value={formData.modeloSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
                      <input type="text" value={formData.tipoEquipoSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Condición</label>
                      <input type="text" value={formData.condicionSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                    </div>
                  </div>
                  {formData.equipoSecundario && (
                    <div className="bg-white p-4 rounded-xl border border-orange-200 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Especificaciones del Equipo Secundario</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-gray-600">Especificación 1:</span><p className="font-semibold">{formData.discoSecundario}</p></div>
                        <div><span className="text-gray-600">Especificación 2:</span><p className="font-semibold">{formData.memoriaSecundario}</p></div>
                        <div><span className="text-gray-600">Especificación 3:</span><p className="font-semibold">{formData.procesadorSecundario}</p></div>
                        <div><span className="text-gray-600">Especificación 4:</span><p className="font-semibold">{formData.soSecundario}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-purple-50 rounded-2xl border-2 border-purple-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">📱</span> Celular (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Celular</label>
                    <select
                      value={formData.celularId}
                      onChange={(e) => handleCelularChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">Seleccionar celular...</option>
                      {celulares.map(cel => (
                        <option key={cel.id} value={cel.id}>
                          {cel.serial} - {cel.marca} {cel.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.celularId && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Serial</label>
                        <input type="text" value={formData.serialCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">IMEI</label>
                        <input type="text" value={formData.imeiCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Marca</label>
                        <input type="text" value={formData.marcaCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                        <input type="text" value={formData.modeloCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Celular</label>
                        <input type="text" value={formData.numeroCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Condición</label>
                        <input type="text" value={formData.condicionCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Restricción</label>
                        <input type="text" value={formData.restriccionCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
                        <input type="text" value={formData.planCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Asignación Celular</label>
                        <input
                          type="date"
                          name="fechaAsignacionCelular"
                          value={formData.fechaAsignacionCelular}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">📝</span> Observaciones y Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones Adicionales</label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Ej: Entrega de Laptop con su cargador original y mochila."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Entregador</label>
                    <input
                      type="text"
                      name="nombreEntrega"
                      value={formData.nombreEntrega}
                      onChange={handleChange}
                      placeholder="Nombre"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Entrega</label>
                    <input
                      type="date"
                      name="fechaEntrega"
                      value={formData.fechaEntrega}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL Hoja de Entrega (OneDrive)</label>
                    <input
                      type="url"
                      name="hojaEntregaUrl"
                      value={formData.hojaEntregaUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 btn-primary">
                  {loading ? 'Guardando...' : editingId ? '✅ Actualizar' : '✅ Registrar'}
                </button>
                <button type="button" onClick={handleCancelar} className="flex-1 btn-secondary">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card-saas bg-white">
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-2">Asignaciones Registradas</h2>
              <p className="text-gray-600 text-base">Total: <span className="font-semibold">{asignaciones.length}</span> asignaciones</p>
            </div>

            {loading && (
              <div className="p-8 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
                <p className="text-gray-600 mt-3">Cargando asignaciones...</p>
              </div>
            )}

            {asignaciones.length === 0 && !loading && (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-600 text-lg">No hay asignaciones registradas aún</p>
                <p className="text-sm text-gray-500 mt-2">Crea tu primera asignación usando el botón</p>
              </div>
            )}

            {asignaciones.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Nombre</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Usuario</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Puesto</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Equipo</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Serial</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Fecha</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map(asignacion => (
                      <tr key={asignacion.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-900 font-medium">{asignacion.nombre}</td>
                        <td className="p-4 text-gray-600">{asignacion.usuario}</td>
                        <td className="p-4 text-gray-600">{asignacion.puesto}</td>
                        <td className="p-4 text-gray-600">{asignacion.marca} {asignacion.modelo}</td>
                        <td className="p-4 text-gray-600 font-mono text-xs">{asignacion.sn}</td>
                        <td className="p-4 text-gray-600">{asignacion.fechaAsignacion}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditar(asignacion)} className="btn-outline text-sm">
                              ✏️ Editar
                            </button>
                            <button onClick={() => handleDelete(asignacion.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium">
                              🗑️
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
