import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';
import { useToastManager } from '../hooks/useToastManager';
import { logAudit } from '../utils/auditLog';
import * as XLSX from 'xlsx';

export default function Asignacion() {
  const { currentUser } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [searchParams] = useSearchParams();
  const [asignaciones, setAsignaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(searchParams.get('form') === 'true');
  const [editingId, setEditingId] = useState(null);
  const [showEquipoSecundario, setShowEquipoSecundario] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchSerial, setSearchSerial] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');
  const [searchCelular, setSearchCelular] = useState('');
  const [searchEquipo, setSearchEquipo] = useState('');
  const [searchModelo, setSearchModelo] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  const [importText, setImportText] = useState('');
  const [showEquipoDropdown, setShowEquipoDropdown] = useState(false);
  const [showEquipoSecundarioDropdown, setShowEquipoSecundarioDropdown] = useState(false);
  const [showCelularDropdown, setShowCelularDropdown] = useState(false);
  const [showAccesorioDropdown, setShowAccesorioDropdown] = useState(false);
  const [searchAccesorio, setSearchAccesorio] = useState('');
  const [searchEquipoPrincipal, setSearchEquipoPrincipal] = useState('');
  const [searchEquipoSec, setSearchEquipoSec] = useState('');
  const [searchCelularField, setSearchCelularField] = useState('');

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
    tipoEquipoCelular: '',
    fechaAsignacionCelular: '',
    // Accesorios
    accesorioId: '',
    accesorioNombre: '',
    codigoActivoFijoAccesorio: '',
    tipoAccesorio: '',
    marcaAccesorio: '',
    modeloAccesorio: '',
    condicionAccesorio: '',
    observaciones: '',
  });

  useEffect(() => {
    // Usar listeners en tiempo real en lugar de getDocs una sola vez
    const unsubscribeAsignaciones = onSnapshot(collection(db, 'asignaciones'), (snapshot) => {
      try {
        const asignacionesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAsignaciones(asignacionesList);
      } catch (error) {
        console.error('Error en listener de asignaciones:', error);
      }
    });

    const unsubscribeEquipos = onSnapshot(collection(db, 'equipos'), (snapshot) => {
      try {
        const equiposList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEquipos(equiposList);
      } catch (error) {
        console.error('Error en listener de equipos:', error);
      }
    });

    const unsubscribeCelulares = onSnapshot(collection(db, 'celulares'), (snapshot) => {
      try {
        const celularesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCelulares(celularesList);
      } catch (error) {
        console.error('Error en listener de celulares:', error);
      }
    });

    const unsubscribeNomenclaturas = onSnapshot(collection(db, 'nomenclaturas'), (snapshot) => {
      try {
        const nomenclaturasList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNomenclaturas(nomenclaturasList);
      } catch (error) {
        console.error('Error en listener de nomenclaturas:', error);
      }
    });

    const unsubscribeAccesorios = onSnapshot(collection(db, 'accesorios'), (snapshot) => {
      try {
        const accesoriosList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccesorios(accesoriosList);
      } catch (error) {
        console.error('Error en listener de accesorios:', error);
      }
    });

    // Limpiar listeners al desmontar
    return () => {
      unsubscribeAsignaciones();
      unsubscribeEquipos();
      unsubscribeCelulares();
      unsubscribeNomenclaturas();
      unsubscribeAccesorios();
    };
  }, []);

  // Abrir formulario si viene parámetro form=true desde el Dashboard
  useEffect(() => {
    if (searchParams.get('form') === 'true') {
      handleNueva();
    }
  }, [searchParams]);

  // Efecto para mantener formData actualizado si se edita y hay cambios en asignaciones
  useEffect(() => {
    if (editingId) {
      const asignacionActualizada = asignaciones.find(a => a.id === editingId);
      if (asignacionActualizada) {
        setFormData(asignacionActualizada);
      }
    }
  }, [asignaciones, editingId]);

  // Migración automática de observaciones al cargar asignaciones
  useEffect(() => {
    if (asignaciones.length > 0) {
      const asignacionesSinObservaciones = asignaciones.filter(a => !a.observaciones);
      
      if (asignacionesSinObservaciones.length > 0) {
        // Ejecutar migración silenciosa en segundo plano
        const migrarAutomaticamente = async () => {
          try {
            for (const asignacion of asignacionesSinObservaciones) {
              await updateDoc(doc(db, 'asignaciones', asignacion.id), {
                observaciones: ''
              });
            }
            console.log(`✅ ${asignacionesSinObservaciones.length} asignaciones migraron automáticamente el campo observaciones`);
          } catch (error) {
            console.error('Error en migración automática:', error);
          }
        };
        
        migrarAutomaticamente();
      }
    }
  }, []);

  const handleEquipoChange = async (snValue) => {
    if (!snValue) {
      setFormData(prev => ({
        ...prev,
        equipo: '',
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
      }));
      return;
    }

    try {
      // Buscar el equipo en Firestore directamente
      const equiposSnapshot = await getDocs(collection(db, 'equipos'));
      const equipoEncontrado = equiposSnapshot.docs.find(d => d.data().sn === snValue);
      
      if (equipoEncontrado) {
        const equipoData = equipoEncontrado.data();
        setFormData(prev => ({
          ...prev,
          equipo: equipoEncontrado.id,
          codActivoFijo: equipoData.codActivoFijo || '',
          marca: equipoData.marca || '',
          modelo: equipoData.modelo || '',
          sn: equipoData.sn || '',
          disco: equipoData.disco || '',
          memoria: equipoData.memoria || '',
          procesador: equipoData.procesador || '',
          so: equipoData.so || '',
          licencia: equipoData.licencia || '',
          tipoEquipo: equipoData.tipoEquipo || '',
          condicion: equipoData.condicion || '',
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos del equipo:', error);
      showToast('Error al cargar datos del equipo', 'error');
    }
  };

  const handleCelularChange = async (celularId) => {
    if (!celularId) {
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
        tipoEquipoCelular: '',
        fechaAsignacionCelular: '',
      }));
      return;
    }

    try {
      // Obtener el celular directamente de Firestore
      const celularRef = doc(db, 'celulares', celularId);
      const celularSnap = await getDoc(celularRef);
      
      if (celularSnap.exists()) {
        const celularData = celularSnap.data();
        setFormData(prev => ({
          ...prev,
          celularId: celularId,
          serialCelular: celularData.serial || '',
          marcaCelular: celularData.marca || '',
          modeloCelular: celularData.modelo || '',
          numeroCelular: celularData.numero || '',
          condicionCelular: celularData.condicion || '',
          restriccionCelular: celularData.restriccion || '',
          imeiCelular: celularData.imei || '',
          planCelular: celularData.plan || '',
          tipoEquipoCelular: celularData.tipoEquipo || '',
          fechaAsignacionCelular: celularData.fechaEntrega || new Date().toISOString().split('T')[0],
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos del celular:', error);
      showToast('Error al cargar datos del celular', 'error');
    }
  };

  const handleAccesorioChange = (accesorioId) => {
    if (!accesorioId) {
      setFormData(prev => ({
        ...prev,
        accesorioId: '',
        accesorioNombre: '',
        codigoActivoFijoAccesorio: '',
        tipoAccesorio: '',
        marcaAccesorio: '',
        modeloAccesorio: '',
        condicionAccesorio: '',
      }));
      return;
    }

    const accesorio = accesorios.find(a => a.id === accesorioId);
    if (accesorio) {
      setFormData(prev => ({
        ...prev,
        accesorioId: accesorioId,
        accesorioNombre: `${accesorio.codigoActivoFijo} - ${accesorio.tipoAccesorio}`,
        codigoActivoFijoAccesorio: accesorio.codigoActivoFijo || '',
        tipoAccesorio: accesorio.tipoAccesorio || '',
        marcaAccesorio: accesorio.marca || '',
        modeloAccesorio: accesorio.modelo || '',
        condicionAccesorio: accesorio.condicion || '',
      }));
    }
  };

  const handleEquipoSecundarioChange = async (snValue) => {
    if (!snValue) {
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
      return;
    }

    try {
      // Buscar el equipo en Firestore directamente
      const equiposSnapshot = await getDocs(collection(db, 'equipos'));
      const equipoEncontrado = equiposSnapshot.docs.find(d => d.data().sn === snValue);
      
      if (equipoEncontrado) {
        const equipoData = equipoEncontrado.data();
        setFormData(prev => ({
          ...prev,
          equipoSecundario: equipoEncontrado.id,
          codActivoFijoSecundario: equipoData.codActivoFijo || '',
          marcaSecundario: equipoData.marca || '',
          modeloSecundario: equipoData.modelo || '',
          snSecundario: equipoData.sn || '',
          discoSecundario: equipoData.disco || '',
          memoriaSecundario: equipoData.memoria || '',
          procesadorSecundario: equipoData.procesador || '',
          soSecundario: equipoData.so || '',
          licenciaSecundario: equipoData.licencia || '',
          tipoEquipoSecundario: equipoData.tipoEquipo || '',
          condicionSecundario: equipoData.condicion || '',
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos del equipo secundario:', error);
      showToast('Error al cargar datos del equipo secundario', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMigrarObservaciones = async () => {
    const asignacionesSinObservaciones = asignaciones.filter(a => !a.observaciones);
    
    if (asignacionesSinObservaciones.length === 0) {
      showToast('Todas las asignaciones ya tienen el campo observaciones', 'info');
      return;
    }

    const confirmMigrate = window.confirm(
      `Se migrarán ${asignacionesSinObservaciones.length} asignación${asignacionesSinObservaciones.length !== 1 ? 'es' : ''} para agregar el campo observaciones.\n\n¿Deseas proceder?`
    );

    if (!confirmMigrate) {
      showToast('Migración cancelada', 'warning');
      return;
    }

    try {
      setLoading(true);
      let migraciones = 0;
      let errores = 0;

      for (const asignacion of asignacionesSinObservaciones) {
        try {
          await updateDoc(doc(db, 'asignaciones', asignacion.id), {
            observaciones: ''
          });
          migraciones++;
        } catch (error) {
          console.error('Error migrando asignación:', error);
          errores++;
        }
      }

      showToast(`${migraciones} asignación${migraciones !== 1 ? 'es' : ''} migrada${migraciones !== 1 ? 's' : ''} exitosamente`, 'success');
    } catch (error) {
      console.error('Error en migración:', error);
      showToast('Error durante la migración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCodigosActivos = async () => {
    const confirmUpdate = window.confirm(
      `⚠️ ATENCIÓN: Esto actualizará los códigos de activo fijo de TODOS los ${equipos.length} equipos registrados.\n\nNuevo formato: ATM-EQ-001, ATM-EQ-002, etc.\n\n¿Deseas proceder? Esta acción es irreversible.`
    );

    if (!confirmUpdate) {
      showToast('Operación cancelada', 'warning');
      return;
    }

    try {
      setLoading(true);
      let actualizados = 0;
      let errores = 0;
      const cambios = [];

      // Ordenar equipos por ID para mantener consistencia
      const equiposOrdenados = [...equipos].sort((a, b) => a.id.localeCompare(b.id));

      // Actualizar cada equipo con el nuevo código
      for (let i = 0; i < equiposOrdenados.length; i++) {
        try {
          const equipo = equiposOrdenados[i];
          const nuevoCodigoActivo = `ATM-EQ-${String(i + 1).padStart(3, '0')}`;
          const codigoAnterior = equipo.codActivoFijo;

          // Actualizar en tabla de equipos
          await updateDoc(doc(db, 'equipos', equipo.id), {
            codActivoFijo: nuevoCodigoActivo
          });

          // Actualizar en asignaciones donde aparezca como equipo principal
          const asignacionesEquipoPrincipal = asignaciones.filter(a => a.codActivoFijo === codigoAnterior);
          for (const asignacion of asignacionesEquipoPrincipal) {
            await updateDoc(doc(db, 'asignaciones', asignacion.id), {
              codActivoFijo: nuevoCodigoActivo
            });
          }

          // Actualizar en asignaciones donde aparezca como equipo secundario
          const asignacionesEquipoSecundario = asignaciones.filter(a => a.codActivoFijoSecundario === codigoAnterior);
          for (const asignacion of asignacionesEquipoSecundario) {
            await updateDoc(doc(db, 'asignaciones', asignacion.id), {
              codActivoFijoSecundario: nuevoCodigoActivo
            });
          }

          cambios.push(`${codigoAnterior} → ${nuevoCodigoActivo}`);
          actualizados++;
        } catch (error) {
          console.error('Error actualizando equipo:', error);
          errores++;
        }
      }

      const mensaje = `✅ Actualización completada:\n• ${actualizados} equipos actualizados\n• ${errores} errores\n\nPrimeros cambios:\n${cambios.slice(0, 5).join('\n')}${cambios.length > 5 ? `\n... y ${cambios.length - 5} más` : ''}`;
      
      showToast(`${actualizados} equipos actualizados exitosamente`, 'success');
      alert(mensaje);
    } catch (error) {
      console.error('Error en actualización masiva:', error);
      showToast('Error al actualizar códigos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sucursal || !formData.oficina || !formData.puesto || 
        !formData.nombre || !formData.usuario) {
      showToast('Por favor completa los datos del colaborador', 'warning');
      return;
    }

    // Validación: permitir Equipo Principal + Equipo Secundario + Celular simultáneamente
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

    if (formData.snSecundario) {
      const equipoSecAsignado = asignaciones.find(a => 
        a.snSecundario === formData.snSecundario && a.id !== editingId
      );
      if (equipoSecAsignado) {
        showToast(`Este equipo secundario (Serial: ${formData.snSecundario}) ya está asignado a: ${equipoSecAsignado.nombre}`, 'warning');
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
      
      // Si estamos editando, obtener los datos anteriores para comparar
      let asignacionAnterior = null;
      if (editingId) {
        asignacionAnterior = asignaciones.find(a => a.id === editingId);
      }

      if (editingId) {
        await updateDoc(doc(db, 'asignaciones', editingId), {
          ...formData,
          actualizadoPor: currentUser?.displayName || currentUser?.email,
          fechaActualizacion: new Date(),
        });
        
        // Registrar en auditoría
        await logAudit(
          currentUser.uid,
          currentUser?.displayName || currentUser?.email,
          'UPDATE',
          'Asignaciones',
          editingId,
          {
            anterior: asignacionAnterior,
            nuevo: formData,
          }
        );
        
        showToast('Asignación actualizada exitosamente', 'success');
      } else {
        // Agregar nueva asignación
        const docRef = await addDoc(collection(db, 'asignaciones'), {
          ...formData,
          fechaRegistro: new Date(),
        });
        
        // Registrar en auditoría
        await logAudit(
          currentUser.uid,
          currentUser?.displayName || currentUser?.email,
          'CREATE',
          'Asignaciones',
          docRef.id,
          {
            nombre: formData.nombre,
            usuario: formData.usuario,
            equipo: `${formData.marca} ${formData.modelo}`,
            sn: formData.sn,
          }
        );
        
        showToast('Asignación registrada exitosamente', 'success');
      }

      // Marcar equipos como asignados SIEMPRE (tanto en creación como en actualización)
      // Si es un equipo principal, marcarlo como asignado
      if (formData.sn) {
        const equipoToUpdate = equipos.find(e => e.sn === formData.sn);
        if (equipoToUpdate) {
          await updateDoc(doc(db, 'equipos', equipoToUpdate.id), {
            estado: 'asignado',
            asignado: true,
          });
        }
      } else if (formData.codActivoFijo) {
        const equipoToUpdate = equipos.find(e => e.codActivoFijo === formData.codActivoFijo);
        if (equipoToUpdate) {
          await updateDoc(doc(db, 'equipos', equipoToUpdate.id), {
            estado: 'asignado',
            asignado: true,
          });
        }
      }

      // Si el equipo principal cambió durante edición, devolver el anterior a disponible
      if (editingId && asignacionAnterior?.sn && asignacionAnterior.sn !== formData.sn) {
        const equipoPrincipalAnterior = equipos.find(e => e.sn === asignacionAnterior.sn);
        if (equipoPrincipalAnterior) {
          await updateDoc(doc(db, 'equipos', equipoPrincipalAnterior.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      } else if (editingId && asignacionAnterior?.codActivoFijo && !formData.sn && asignacionAnterior.codActivoFijo !== formData.codActivoFijo) {
        const equipoPrincipalAnterior = equipos.find(e => e.codActivoFijo === asignacionAnterior.codActivoFijo);
        if (equipoPrincipalAnterior) {
          await updateDoc(doc(db, 'equipos', equipoPrincipalAnterior.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      }

      // Si es un equipo secundario, marcarlo como asignado
      if (formData.snSecundario) {
        const equipoSecToUpdate = equipos.find(e => e.sn === formData.snSecundario);
        if (equipoSecToUpdate) {
          await updateDoc(doc(db, 'equipos', equipoSecToUpdate.id), {
            estado: 'asignado',
            asignado: true,
          });
        }
      }

      // Si cambió el equipo secundario durante edición, devolver el anterior a disponible
      if (editingId && asignacionAnterior?.snSecundario && asignacionAnterior.snSecundario !== formData.snSecundario) {
        const equipoSecAnterior = equipos.find(e => e.sn === asignacionAnterior.snSecundario);
        if (equipoSecAnterior) {
          await updateDoc(doc(db, 'equipos', equipoSecAnterior.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      } else if (editingId && asignacionAnterior?.snSecundario && !formData.snSecundario) {
        // Si quitó el equipo secundario, devolverlo a disponible
        const equipoSecAnterior = equipos.find(e => e.sn === asignacionAnterior.snSecundario);
        if (equipoSecAnterior) {
          await updateDoc(doc(db, 'equipos', equipoSecAnterior.id), {
            estado: 'disponible',
            asignado: false,
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

      // Si cambió el celular durante edición, devolver el anterior a disponible
      if (editingId && asignacionAnterior?.serialCelular && asignacionAnterior.serialCelular !== formData.serialCelular) {
        const celularAnterior = celulares.find(c => c.serial === asignacionAnterior.serialCelular);
        if (celularAnterior) {
          await updateDoc(doc(db, 'celulares', celularAnterior.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      } else if (editingId && asignacionAnterior?.serialCelular && !formData.serialCelular) {
        // Si quitó el celular, devolverlo a disponible
        const celularAnterior = celulares.find(c => c.serial === asignacionAnterior.serialCelular);
        if (celularAnterior) {
          await updateDoc(doc(db, 'celulares', celularAnterior.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
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
        tipoEquipoCelular: '',
        fechaAsignacionCelular: '',
        observaciones: '',
      });

      setShowEquipoSecundario(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al registrar asignación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (asignacion) => {
    // Buscar la asignación actualizada en el array completo
    const asignacionActualizada = asignaciones.find(a => a.id === asignacion.id) || asignacion;
    setFormData(asignacionActualizada);
    
    // Actualizar los campos de búsqueda con los valores actuales
    // Equipo principal
    if (asignacionActualizada.sn) {
      const equipoPrincipal = equipos.find(e => e.sn === asignacionActualizada.sn);
      if (equipoPrincipal) {
        setSearchEquipoPrincipal(`${equipoPrincipal.sn} - ${equipoPrincipal.marca} ${equipoPrincipal.modelo}`);
      }
    }
    
    // Equipo secundario
    if (asignacionActualizada.snSecundario) {
      const equipoSecundario = equipos.find(e => e.sn === asignacionActualizada.snSecundario);
      if (equipoSecundario) {
        setSearchEquipoSec(`${equipoSecundario.sn} - ${equipoSecundario.marca} ${equipoSecundario.modelo}`);
      }
    }
    
    // Celular
    if (asignacionActualizada.celularId) {
      const celular = celulares.find(c => c.id === asignacionActualizada.celularId);
      if (celular) {
        setSearchCelularField(`${celular.serial} - ${celular.marca} ${celular.modelo}`);
      }
    }

    // Accesorio
    if (asignacionActualizada.accesorioId) {
      const accesorio = accesorios.find(a => a.id === asignacionActualizada.accesorioId);
      if (accesorio) {
        setSearchAccesorio(`${accesorio.codigoActivoFijo} - ${accesorio.tipoAccesorio}`);
      }
    }
    
    setEditingId(asignacion.id);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setShowEquipoSecundario(false);
    setSearchEquipoPrincipal('');
    setSearchEquipoSec('');
    setSearchCelularField('');
    setSearchAccesorio('');
    setShowEquipoDropdown(false);
    setShowEquipoSecundarioDropdown(false);
    setShowCelularDropdown(false);
    setShowAccesorioDropdown(false);
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
      tipoEquipoCelular: '',
      fechaAsignacionCelular: '',
      // Accesorios
      accesorioId: '',
      accesorioNombre: '',
      codigoActivoFijoAccesorio: '',
      tipoAccesorio: '',
      marcaAccesorio: '',
      modeloAccesorio: '',
      condicionAccesorio: '',
      observaciones: '',
    });
  };

  const handleNueva = () => {
    setShowEquipoSecundario(false);
    setSearchEquipoPrincipal('');
    setSearchEquipoSec('');
    setSearchCelularField('');
    setSearchAccesorio('');
    setShowEquipoDropdown(false);
    setShowEquipoSecundarioDropdown(false);
    setShowCelularDropdown(false);
    setShowAccesorioDropdown(false);
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
      tipoEquipoCelular: '',
      fechaAsignacionCelular: '',
      // Accesorios
      accesorioId: '',
      accesorioNombre: '',
      codigoActivoFijoAccesorio: '',
      tipoAccesorio: '',
      marcaAccesorio: '',
      modeloAccesorio: '',
      condicionAccesorio: '',
      observaciones: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      
      // Obtener los datos de la asignación antes de eliminarla
      const asignacionAEliminar = asignaciones.find(a => a.id === deleteId);
      
      // Eliminar la asignación
      await deleteDoc(doc(db, 'asignaciones', deleteId));
      
      // Registrar en auditoría
      await logAudit(
        currentUser.uid,
        currentUser?.displayName || currentUser?.email,
        'DELETE',
        'Asignaciones',
        deleteId,
        {
          nombre: asignacionAEliminar?.nombre,
          usuario: asignacionAEliminar?.usuario,
          equipo: `${asignacionAEliminar?.marca} ${asignacionAEliminar?.modelo}`,
          sn: asignacionAEliminar?.sn,
        }
      );
      
      // Marcar todos los equipos asociados como disponibles
      if (asignacionAEliminar) {
        // Devolver equipo principal a disponible
        if (asignacionAEliminar.sn) {
          const equipoPrincipal = equipos.find(e => e.sn === asignacionAEliminar.sn);
          if (equipoPrincipal) {
            await updateDoc(doc(db, 'equipos', equipoPrincipal.id), {
              estado: 'disponible',
              asignado: false,
            });
          }
        }

        // Devolver equipo secundario a disponible
        if (asignacionAEliminar.snSecundario) {
          const equipoSecundario = equipos.find(e => e.sn === asignacionAEliminar.snSecundario);
          if (equipoSecundario) {
            await updateDoc(doc(db, 'equipos', equipoSecundario.id), {
              estado: 'disponible',
              asignado: false,
            });
          }
        }

        // Devolver celular a disponible
        if (asignacionAEliminar.serialCelular) {
          const celular = celulares.find(c => c.serial === asignacionAEliminar.serialCelular);
          if (celular) {
            await updateDoc(doc(db, 'celulares', celular.id), {
              estado: 'disponible',
              asignado: false,
            });
          }
        }
      }
      
      showToast('Asignación eliminada', 'success');
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar asignación', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleImportAsignaciones = async (e) => {
    e.preventDefault();

    if (!importText.trim()) {
      showToast('Por favor pega las asignaciones a importar', 'warning');
      return;
    }

    // Parsear las asignaciones del texto (tab-separated)
    const lineas = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lineas.length === 0) {
      showToast('No hay asignaciones válidas para importar', 'warning');
      return;
    }

    try {
      setLoading(true);
      let importadas = 0;
      let errores = 0;

      for (const linea of lineas) {
        try {
          // Parsear los campos separados por TAB
          const campos = linea.split('\t').map(c => c.trim());

          // Validar que haya al menos 18 campos
          if (campos.length < 18) {
            console.warn(`Línea skipped (campos insuficientes): ${linea.substring(0, 50)}...`);
            errores++;
            continue;
          }

          const [sucursal, oficina, departamento, puesto, nombre, usuario, codActivoFijo, netbiosName, marca, modelo, sn, disco, memoria, procesador, so, licencia, fechaAsignacion, asignadoPor] = campos;

          // Validar campos requeridos
          if (!sucursal || !nombre || !usuario) {
            console.warn(`Línea skipped (campos vacíos requeridos): ${linea.substring(0, 50)}...`);
            errores++;
            continue;
          }

          // Buscar el equipo por código de activo fijo si existe
          let equipo = null;
          let tipoEquipo = '';
          let condicion = '';

          if (codActivoFijo) {
            equipo = equipos.find(e => e.codActivoFijo === codActivoFijo);
            if (equipo) {
              tipoEquipo = equipo.tipoEquipo || '';
              condicion = equipo.condicion || '';
            }
          }

          // Crear la asignación
          await addDoc(collection(db, 'asignaciones'), {
            sucursal: sucursal.trim(),
            oficina: oficina.trim(),
            puesto: puesto.trim(),
            nombre: nombre.trim(),
            usuario: usuario.trim(),
            empresa: 'AUTOMÍA SAS',
            equipo: marca && modelo ? `${marca} ${modelo}` : '',
            codActivoFijo: codActivoFijo.trim() || '',
            netbiosName: netbiosName.trim() || '',
            marca: marca.trim() || '',
            modelo: modelo.trim() || '',
            sn: sn.trim().toUpperCase() || '',
            disco: disco.trim() || '',
            memoria: memoria.trim() || '',
            procesador: procesador.trim() || '',
            so: so.trim() || '',
            licencia: licencia.trim() || '',
            tipoEquipo: tipoEquipo,
            condicion: condicion,
            fechaAsignacion: fechaAsignacion.trim() || new Date().toISOString().split('T')[0],
            asignadoPor: asignadoPor.trim() || currentUser.displayName || currentUser.email,
            hojaEntregaUrl: '',
            nombreEntrega: currentUser.displayName || currentUser.email,
            fechaEntrega: new Date().toISOString().split('T')[0],
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
            fechaRegistro: new Date(),
          });

          // Si existe el equipo, marcarlo como asignado
          if (equipo && codActivoFijo) {
            await updateDoc(doc(db, 'equipos', equipo.id), {
              estado: 'asignado',
              asignado: true,
            });
          }

          importadas++;
        } catch (lineError) {
          console.error('Error procesando línea:', lineError);
          errores++;
        }
      }

      let mensaje = `Se importaron ${importadas} asignación${importadas !== 1 ? 'es' : ''}`;
      if (errores > 0) {
        mensaje += ` (${errores} línea${errores !== 1 ? 's' : ''} con error)`;
      }
      showToast(mensaje, importadas > 0 ? 'success' : 'warning');

      setImportText('');
      setShowImportForm(false);
    } catch (error) {
      console.error('Error al importar:', error);
      showToast('Error al importar asignaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportEquipoSecundario = () => {
    // Filtrar solo asignaciones con equipo secundario
    const asignacionesFiltradas = asignaciones.filter(a => a.snSecundario);
    
    if (asignacionesFiltradas.length === 0) {
      showToast('No hay asignaciones con equipo secundario para exportar', 'warning');
      return;
    }

    const dataExport = asignacionesFiltradas.map(asignacion => ({
      'Sucursal': asignacion.sucursal,
      'Oficina': asignacion.oficina,
      'Puesto': asignacion.puesto,
      'Nombre': asignacion.nombre,
      'Usuario': asignacion.usuario,
      'Empresa': asignacion.empresa,
      'Tipo de equipo': asignacion.tipoEquipoSecundario || '',
      'Equipo S/N': asignacion.snSecundario || '',
      'Código Activo': asignacion.codActivoFijoSecundario || '',
      'Marca': asignacion.marcaSecundario || '',
      'Modelo': asignacion.modeloSecundario || '',
      'NetBios': asignacion.netbiosName || '',
      'Disco': asignacion.discoSecundario || '',
      'Memoria': asignacion.memoriaSecundario || '',
      'Procesador': asignacion.procesadorSecundario || '',
      'SO': asignacion.soSecundario || '',
      'Licencia': asignacion.licenciaSecundario || '',
      'Condición': asignacion.condicionSecundario || '',
      'Fecha Asignación': asignacion.fechaAsignacion,
      'Asignado Por': asignacion.asignadoPor,
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipo Secundario');

    const columnWidths = [
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Asignaciones_Equipo_Secundario_${new Date().toLocaleDateString('es-ES')}.xlsx`);
    showToast('Reporte exportado exitosamente', 'success');
  };

  const handleExportCelular = () => {
    // Filtrar solo asignaciones con celular
    const asignacionesFiltradas = asignaciones.filter(a => a.serialCelular);
    
    if (asignacionesFiltradas.length === 0) {
      showToast('No hay asignaciones con celular para exportar', 'warning');
      return;
    }

    const dataExport = asignacionesFiltradas.map(asignacion => ({
      'Sucursal': asignacion.sucursal,
      'Oficina': asignacion.oficina,
      'Puesto': asignacion.puesto,
      'Nombre': asignacion.nombre,
      'Usuario': asignacion.usuario,
      'Empresa': asignacion.empresa,
      'Marca': asignacion.marcaCelular || '',
      'Modelo': asignacion.modeloCelular || '',
      'Serial': asignacion.serialCelular || '',
      'IMEI': asignacion.imeiCelular || '',
      'Número': asignacion.numeroCelular || '',
      'Condición': asignacion.condicionCelular || '',
      'Restricción': asignacion.restriccionCelular || '',
      'Plan': asignacion.planCelular || '',
      'Fecha Asignación': asignacion.fechaAsignacionCelular || '',
      'Observaciones': asignacion.observaciones || '',
      'Fecha Asignación General': asignacion.fechaAsignacion,
      'Asignado Por': asignacion.asignadoPor,
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Celulares');

    const columnWidths = [
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Asignaciones_Celulares_${new Date().toLocaleDateString('es-ES')}.xlsx`);
    showToast('Reporte exportado exitosamente', 'success');
  };

  const handleExportEquipoPrimario = () => {
    // Filtrar solo asignaciones con equipo principal
    const asignacionesFiltradas = asignaciones.filter(a => a.sn || a.codActivoFijo);
    
    if (asignacionesFiltradas.length === 0) {
      showToast('No hay asignaciones con equipo principal para exportar', 'warning');
      return;
    }

    const dataExport = asignacionesFiltradas.map(asignacion => {
      const equipoCompleto = `${asignacion.marca || ''} ${asignacion.modelo || ''}`.trim();
      const observacionesDefault = equipoCompleto ? `Entrega de ${equipoCompleto} con su cargador original y mochila.` : 'Entrega de equipo con su cargador original y mochila.';
      
      return {
        'Sucursal': asignacion.sucursal,
        'Oficina': asignacion.oficina,
        'Puesto': asignacion.puesto,
        'Nombre': asignacion.nombre,
        'Usuario': asignacion.usuario,
        'Empresa': asignacion.empresa,
        'Equipo': equipoCompleto,
        'S/N': asignacion.sn || '',
        'Código Activo': asignacion.codActivoFijo || '',
        'NetBios': asignacion.netbiosName || '',
        'Disco': asignacion.disco || '',
        'Memoria': asignacion.memoria || '',
        'Procesador': asignacion.procesador || '',
        'SO': asignacion.so || '',
        'Licencia': asignacion.licencia || '',
        'Accesorio Código': asignacion.codigoActivoFijoAccesorio || '',
        'Accesorio Tipo': asignacion.tipoAccesorio || '',
        'Accesorio Marca': asignacion.marcaAccesorio || '',
        'Accesorio Modelo': asignacion.modeloAccesorio || '',
        'Accesorio Condición': asignacion.condicionAccesorio || '',
        'Observaciones': asignacion.observaciones || observacionesDefault,
        'URL Hoja de Entrega (OneDrive)': asignacion.hojaEntregaUrl || '',
        'Fecha Asignación': asignacion.fechaAsignacion,
        'Asignado Por': asignacion.asignadoPor,
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipo Principal');

    const columnWidths = [
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 25 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Asignaciones_Equipo_Principal_${new Date().toLocaleDateString('es-ES')}.xlsx`);
    showToast('Reporte exportado exitosamente', 'success');
  };

  const handleExportToExcel = () => {
    if (asignaciones.length === 0) {
      showToast('No hay asignaciones para exportar', 'warning');
      return;
    }

    // Aplicar los mismos filtros que se ven en la tabla
    const asignacionesFiltradas = asignaciones.filter(asignacion => {
      const matchSerial = !searchSerial || 
        asignacion.sn?.toLowerCase().includes(searchSerial.toLowerCase()) ||
        asignacion.snSecundario?.toLowerCase().includes(searchSerial.toLowerCase()) ||
        asignacion.serialCelular?.toLowerCase().includes(searchSerial.toLowerCase());
      const matchNombre = asignacion.nombre
        .toLowerCase()
        .includes(searchNombre.toLowerCase());
      const matchUsuario = asignacion.usuario
        .toLowerCase()
        .includes(searchUsuario.toLowerCase());
      const matchCelular = !searchCelular || asignacion.serialCelular === searchCelular;
      const matchEquipo = !searchEquipo || asignacion.tipoEquipo === searchEquipo;
      const matchModelo = !searchModelo || asignacion.modelo === searchModelo;
      return matchSerial && matchNombre && matchUsuario && matchCelular && matchEquipo && matchModelo;
    });

    if (asignacionesFiltradas.length === 0) {
      showToast('No hay asignaciones que coincidan con los filtros para exportar', 'warning');
      return;
    }

    const dataExport = asignacionesFiltradas.map(asignacion => ({
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
      'Accesorio': asignacion.accesorioNombre || 'N/A',
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
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 40 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Asignaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Reporte exportado exitosamente', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Gestión de Asignaciones</h1>
            <p className="text-gray-600 text-base">Registra y administra asignaciones de equipos a colaboradores</p>
          </div>
          {!showForm && !showImportForm && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowImportForm(true)}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <span className="text-base">📥</span>
                Importar en Lote
              </button>
              <button
                onClick={handleExportEquipoPrimario}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Icon name="BarChartOutline" size="sm" color="#6b7280" />
                Export Equipo Principal
              </button>
              <button
                onClick={handleExportEquipoSecundario}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Icon name="BarChartOutline" size="sm" color="#6b7280" />
                Export Equipo Secundario
              </button>
              <button
                onClick={handleExportCelular}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Icon name="BarChartOutline" size="sm" color="#6b7280" />
                Export Celulares
              </button>
              <button
                onClick={handleMigrarObservaciones}
                className="btn-secondary gap-2 text-sm hidden"
                title="Migra el campo observaciones a todas las asignaciones antiguas"
              >
                <span className="text-base">🔄</span>
                Migrar Observaciones
              </button>
           
              <button
                onClick={handleNueva}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Icon name="AddOutline" size="sm" color="white" />
                Nueva Asignación
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showImportForm ? (
          <div className="card-saas-lg bg-white border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-8 flex items-center gap-3">
              <span className="text-3xl">📥</span>
              Importar Asignaciones en Lote
            </h2>

            <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">📋 Formato Esperado (Tab-separated):</h3>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-xs md:text-sm overflow-x-auto mb-4">
                <div className="text-gray-700">
                  Sucursal<span className="text-purple-600">⇥</span>
                  Oficina<span className="text-purple-600">⇥</span>
                  Departamento<span className="text-purple-600">⇥</span>
                  Puesto<span className="text-purple-600">⇥</span>
                  Nombre<span className="text-purple-600">⇥</span>
                  Usuario<span className="text-purple-600">⇥</span>
                  Cod. Activo Fijo<span className="text-purple-600">⇥</span>
                  NetBios Name<span className="text-purple-600">⇥</span>
                  Marca<span className="text-purple-600">⇥</span>
                  Modelo<span className="text-purple-600">⇥</span>
                  S/N<span className="text-purple-600">⇥</span>
                  Disco<span className="text-purple-600">⇥</span>
                  Memoria<span className="text-purple-600">⇥</span>
                  Procesador<span className="text-purple-600">⇥</span>
                  S.O<span className="text-purple-600">⇥</span>
                  Licencia<span className="text-purple-600">⇥</span>
                  Fecha de Asignación<span className="text-purple-600">⇥</span>
                  Asignado por
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Requeridos:</strong> Sucursal, Nombre, Usuario<br/>
                <strong>Nota:</strong> Usa Tab (⇥) para separar campos
              </p>
            </div>

            <form onSubmit={handleImportAsignaciones} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pega aquí las asignaciones a importar:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega las asignaciones separadas por Tab y con una asignación por línea..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                  rows="10"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Aviso:</strong> Se importarán {importText.trim().split('\n').filter(line => line.trim()).length} asignación(es)
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <span className="text-base">📥</span>
                      Importar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportForm(false);
                    setImportText('');
                  }}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <Icon name="CloseOutline" size="sm" color="#6b7280" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : showForm ? (
          <div className="card-saas-lg bg-white border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-8 flex items-center gap-3">
              <Icon name="DocumentOutline" size="lg" color="#0ea5e9" />
              {editingId ? 'Editar Asignación' : 'Nueva Asignación'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-900 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">👤</span> Datos del Colaborador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Empresa *</label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="AUTOMÍA SAS"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Nombre del Colaborador *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Posición/Puesto *</label>
                    <input
                      type="text"
                      name="puesto"
                      value={formData.puesto}
                      onChange={handleChange}
                      placeholder="Ej: Jefe de Taller"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Departamento/Sucursal *</label>
                    <input
                      type="text"
                      name="sucursal"
                      value={formData.sucursal}
                      onChange={handleChange}
                      placeholder="Ej: Potencia"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Oficina *</label>
                    <input
                      type="text"
                      name="oficina"
                      value={formData.oficina}
                      onChange={handleChange}
                      placeholder="Ej: Principal"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Usuario *</label>
                    <input
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      placeholder="Ej: jperez"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-100 dark:border-green-900 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">💻</span> Equipo Principal (Laptop)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Serial del Equipo (S/N)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchEquipoPrincipal}
                        onChange={(e) => setSearchEquipoPrincipal(e.target.value)}
                        onFocus={() => setShowEquipoDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEquipoDropdown(false), 200)}
                        placeholder="Escribir o buscar serial..."
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                      
                      {showEquipoDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                          {equipos
                            .filter(eq => {
                              const isCurrentlyAssigned = formData.sn === eq.sn;
                              const isAvailable = !eq.asignado || eq.estado === 'disponible';
                              const matchesSearch = `${eq.sn} - ${eq.marca} ${eq.modelo}`.toLowerCase().includes(searchEquipoPrincipal.toLowerCase());
                              
                              if (editingId && isCurrentlyAssigned) {
                                return matchesSearch;
                              }
                              
                              return matchesSearch && isAvailable;
                            })
                            .map(eq => (
                              <button
                                type="button"
                                key={eq.id}
                                onClick={() => {
                                  setSearchEquipoPrincipal(`${eq.sn} - ${eq.marca} ${eq.modelo}`);
                                  handleEquipoChange(eq.sn);
                                  setShowEquipoDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                              >
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{eq.sn}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{eq.marca} {eq.modelo}</div>
                              </button>
                            ))}
                          {searchEquipoPrincipal && equipos.filter(eq => {
                            const isCurrentlyAssigned = formData.sn === eq.sn;
                            const isAvailable = !eq.asignado || eq.estado === 'disponible';
                            const matchesSearch = `${eq.sn} - ${eq.marca} ${eq.modelo}`.toLowerCase().includes(searchEquipoPrincipal.toLowerCase());
                            
                            if (editingId && isCurrentlyAssigned) {
                              return matchesSearch;
                            }
                            
                            return matchesSearch && isAvailable;
                          }).length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No se encontraron equipos disponibles
                            </div>
                          )}
                        </div>
                      )}
                      {formData.equipo && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchEquipoPrincipal('');
                            handleEquipoChange('');
                          }}
                          className="mt-2 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon name="trash" /> Quitar equipo
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Código Activo Fijo</label>
                    <input type="text" value={formData.codActivoFijo} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Marca</label>
                    <input type="text" value={formData.marca} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Modelo</label>
                    <input type="text" value={formData.modelo} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Tipo de Equipo</label>
                    <input type="text" value={formData.tipoEquipo} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Condición</label>
                    <input type="text" value={formData.condicion} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">NetBios Name</label>
                    <select
                      name="netbiosName"
                      value={formData.netbiosName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Seleccionar...</option>
                      {nomenclaturas
                        .filter(nom => {
                          const isCurrentlyAssigned = formData.netbiosName === nom.netbiosName;
                          const isAssignedToOther = asignaciones.some(a => 
                            a.netbiosName === nom.netbiosName && a.id !== editingId
                          );
                          return isCurrentlyAssigned || !isAssignedToOther;
                        })
                        .map(nom => (
                          <option key={nom.id} value={nom.netbiosName}>
                            {nom.netbiosName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Fecha de Asignación</label>
                    <input
                      type="date"
                      name="fechaAsignacion"
                      value={formData.fechaAsignacion}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                {formData.equipo && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Especificaciones del Equipo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-gray-600">Especificación 1:</span><p className="font-semibold text-gray-900">{formData.disco}</p></div>
                      <div><span className="text-gray-600">Especificación 2:</span><p className="font-semibold text-gray-900">{formData.memoria}</p></div>
                      <div><span className="text-gray-600">Especificación 3:</span><p className="font-semibold text-gray-900">{formData.procesador}</p></div>
                      <div><span className="text-gray-600">Especificación 4:</span><p className="font-semibold text-gray-900">{formData.so}</p></div>
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Serial del Equipo (S/N)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchEquipoSec}
                        onChange={(e) => setSearchEquipoSec(e.target.value)}
                        onFocus={() => setShowEquipoSecundarioDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEquipoSecundarioDropdown(false), 200)}
                        placeholder="Escribir o buscar serial..."
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      
                      {showEquipoSecundarioDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                          {equipos
                            .filter(eq => {
                              const isCurrentlyAssigned = formData.snSecundario === eq.sn;
                              const isAvailable = !eq.asignado || eq.estado === 'disponible';
                              const isPrimaryEquipment = formData.equipo && eq.id === formData.equipo;
                              const matchesSearch = `${eq.sn} - ${eq.marca} ${eq.modelo}`.toLowerCase().includes(searchEquipoSec.toLowerCase());
                              
                              if (!matchesSearch) return false;
                              if (isPrimaryEquipment && !isCurrentlyAssigned) return false;
                              
                              if (editingId && isCurrentlyAssigned) {
                                return true;
                              }
                              
                              return isAvailable;
                            })
                            .map(eq => (
                              <button
                                type="button"
                                key={eq.id}
                                onClick={() => {
                                  setSearchEquipoSec(`${eq.sn} - ${eq.marca} ${eq.modelo}`);
                                  handleEquipoSecundarioChange(eq.sn);
                                  setShowEquipoSecundarioDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                              >
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{eq.sn}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{eq.marca} {eq.modelo}</div>
                              </button>
                            ))}
                          {searchEquipoSec && equipos.filter(eq => {
                            const isCurrentlyAssigned = formData.snSecundario === eq.sn;
                            const isAvailable = !eq.asignado || eq.estado === 'disponible';
                            const isPrimaryEquipment = formData.equipo && eq.id === formData.equipo;
                            const matchesSearch = `${eq.sn} - ${eq.marca} ${eq.modelo}`.toLowerCase().includes(searchEquipoSec.toLowerCase());
                            
                            if (!matchesSearch) return false;
                            if (isPrimaryEquipment && !isCurrentlyAssigned) return false;
                            
                            if (editingId && isCurrentlyAssigned) {
                              return true;
                            }
                            
                            return isAvailable;
                          }).length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No se encontraron equipos disponibles
                            </div>
                          )}
                        </div>
                      )}
                      {formData.equipoSecundario && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchEquipoSec('');
                            handleEquipoSecundarioChange('');
                          }}
                          className="mt-2 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon name="trash" /> Quitar equipo secundario
                        </button>
                      )}
                    </div>
                  </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Código Activo Fijo</label>
                      <input type="text" value={formData.codActivoFijoSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Marca</label>
                      <input type="text" value={formData.marcaSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Modelo</label>
                      <input type="text" value={formData.modeloSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Tipo de Equipo</label>
                      <input type="text" value={formData.tipoEquipoSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Condición</label>
                      <input type="text" value={formData.condicionSecundario} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                    </div>
                  </div>
                  {formData.equipoSecundario && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Especificaciones del Equipo Secundario</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-gray-600">Especificación 1:</span><p className="font-semibold text-gray-900">{formData.discoSecundario}</p></div>
                        <div><span className="text-gray-600">Especificación 2:</span><p className="font-semibold text-gray-900">{formData.memoriaSecundario}</p></div>
                        <div><span className="text-gray-600">Especificación 3:</span><p className="font-semibold text-gray-900">{formData.procesadorSecundario}</p></div>
                        <div><span className="text-gray-600">Especificación 4:</span><p className="font-semibold text-gray-900">{formData.soSecundario}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-2 border-purple-100 dark:border-purple-900 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">📱</span> Celular (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Seleccionar Celular</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchCelularField}
                        onChange={(e) => setSearchCelularField(e.target.value)}
                        onFocus={() => setShowCelularDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCelularDropdown(false), 200)}
                        placeholder="Escribir o buscar serial/IMEI/número..."
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                      
                      {showCelularDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                          {celulares
                            .filter(cel => {
                              const isCurrentlyAssigned = formData.celularId === cel.id;
                              const isAvailable = !cel.asignado || cel.estado === 'disponible';
                              const matchesSearch = `${cel.serial} - ${cel.marca} ${cel.modelo} ${cel.numero} ${cel.imei}`.toLowerCase().includes(searchCelularField.toLowerCase());
                              
                              const celularAsignacionActual = editingId && asignaciones.find(a => a.id === editingId && a.celularId === cel.id);
                              const canShow = isAvailable || isCurrentlyAssigned || !!celularAsignacionActual;
                              
                              return matchesSearch && canShow;
                            })
                            .map(cel => (
                              <button
                                type="button"
                                key={cel.id}
                                onClick={() => {
                                  setSearchCelularField(`${cel.serial} - ${cel.marca} ${cel.modelo}`);
                                  handleCelularChange(cel.id);
                                  setShowCelularDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                              >
                                <div className="font-semibold text-gray-900 dark:text-gray-100">{cel.serial}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{cel.marca} {cel.modelo} • {cel.numero}</div>
                              </button>
                            ))}
                          {searchCelularField && celulares.filter(cel => {
                            const isCurrentlyAssigned = formData.celularId === cel.id;
                            const isAvailable = !cel.asignado || cel.estado === 'disponible';
                            const matchesSearch = `${cel.serial} - ${cel.marca} ${cel.modelo} ${cel.numero} ${cel.imei}`.toLowerCase().includes(searchCelularField.toLowerCase());
                            
                            const celularAsignacionActual = editingId && asignaciones.find(a => a.id === editingId && a.celularId === cel.id);
                            const canShow = isAvailable || isCurrentlyAssigned || !!celularAsignacionActual;
                            
                            return matchesSearch && canShow;
                          }).length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No se encontraron celulares disponibles
                            </div>
                          )}
                        </div>
                      )}
                      {formData.celularId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchCelularField('');
                            handleCelularChange('');
                          }}
                          className="mt-2 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon name="trash" /> Quitar celular
                        </button>
                      )}
                    </div>
                  </div>
                  {formData.celularId && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Serial</label>
                        <input type="text" value={formData.serialCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">IMEI</label>
                        <input type="text" value={formData.imeiCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Marca</label>
                        <input type="text" value={formData.marcaCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Modelo</label>
                        <input type="text" value={formData.modeloCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Celular</label>
                        <input type="text" value={formData.numeroCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Condición</label>
                        <input type="text" value={formData.condicionCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Restricción</label>
                        <input type="text" value={formData.restriccionCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Plan</label>
                        <input type="text" value={formData.planCelular} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-gray-300 bg-gray-50 text-gray-600" />
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

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-2 border-purple-100 dark:border-purple-900 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">🔧</span> Accesorios (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Seleccionar Accesorio</label>
                    <input
                      type="text"
                      value={searchAccesorio}
                      onChange={(e) => setSearchAccesorio(e.target.value)}
                      onFocus={() => setShowAccesorioDropdown(true)}
                      placeholder="Buscar por código o tipo de accesorio..."
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    {showAccesorioDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto mt-1">
                        {accesorios
                          .filter(acc => {
                            const isAvailable = !acc.asignado;
                            const matchesSearch = `${acc.codigoActivoFijo} - ${acc.tipoAccesorio} ${acc.marca} ${acc.modelo}`.toLowerCase().includes(searchAccesorio.toLowerCase());
                            
                            const accesorioAsignacionActual = editingId && formData.accesorioId === acc.id;
                            const canShow = isAvailable || !!accesorioAsignacionActual;
                            
                            return matchesSearch && canShow;
                          })
                          .map(acc => (
                            <button
                              type="button"
                              key={acc.id}
                              onClick={() => {
                                handleAccesorioChange(acc.id);
                                setSearchAccesorio(`${acc.codigoActivoFijo} - ${acc.tipoAccesorio}`);
                                setShowAccesorioDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{acc.codigoActivoFijo}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{acc.tipoAccesorio} • {acc.marca} {acc.modelo}</div>
                            </button>
                          ))}
                        {searchAccesorio && accesorios.filter(acc => {
                          const isAvailable = !acc.asignado;
                          const matchesSearch = `${acc.codigoActivoFijo} - ${acc.tipoAccesorio} ${acc.marca} ${acc.modelo}`.toLowerCase().includes(searchAccesorio.toLowerCase());
                          
                          const accesorioAsignacionActual = editingId && formData.accesorioId === acc.id;
                          const canShow = isAvailable || !!accesorioAsignacionActual;
                          
                          return matchesSearch && canShow;
                        }).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No se encontraron accesorios disponibles
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.accesorioId && (
                    <button
                      type="button"
                      onClick={() => {
                        handleAccesorioChange('');
                        setSearchAccesorio('');
                      }}
                      className="col-span-1 md:col-span-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="trash" /> Quitar accesorio
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-100 dark:border-yellow-900 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                  <span className="text-2xl">📝</span> Observaciones y Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Observaciones Adicionales</label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Ej: Entrega de Laptop con su cargador original y mochila."
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Nombre de Entregador</label>
                    <input
                      type="text"
                      name="nombreEntrega"
                      value={formData.nombreEntrega}
                      onChange={handleChange}
                      placeholder="Nombre"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Fecha de Entrega</label>
                    <input
                      type="date"
                      name="fechaEntrega"
                      value={formData.fechaEntrega}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
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
                <button type="button" onClick={handleCancelar} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <Icon name="CloseOutline" size="sm" color="#6b7280" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card-saas bg-white border border-gray-200 shadow-sm">
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
                <div className="mb-3 flex justify-center">
                  <Icon name="DocumentOutline" size="xl" color="#9ca3af" />
                </div>
                <p className="text-gray-600 text-lg">No hay asignaciones registradas aún</p>
                <p className="text-sm text-gray-500 mt-2">Crea tu primera asignación usando el botón</p>
              </div>
            )}

            {asignaciones.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Serial</label>
                    <input
                      type="text"
                      placeholder="Ej: D6TK374"
                      value={searchSerial}
                      onChange={(e) => setSearchSerial(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={searchNombre}
                      onChange={(e) => setSearchNombre(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Usuario</label>
                    <input
                      type="text"
                      placeholder="Ej: jperez"
                      value={searchUsuario}
                      onChange={(e) => setSearchUsuario(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Equipo</label>
                    <select
                      value={searchEquipo}
                      onChange={(e) => setSearchEquipo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Todos los equipos</option>
                      {[...new Set(asignaciones.map(a => a.tipoEquipo).filter(Boolean))].sort().map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Modelo</label>
                    <select
                      value={searchModelo}
                      onChange={(e) => setSearchModelo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Todos los modelos</option>
                      {[...new Set(asignaciones.map(a => a.modelo).filter(Boolean))].sort().map(modelo => (
                        <option key={modelo} value={modelo}>{modelo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Celular</label>
                    <select
                      value={searchCelular}
                      onChange={(e) => setSearchCelular(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">-- Todos los celulares --</option>
                      {asignaciones
                        .filter(a => a.serialCelular)
                        .map(a => a.serialCelular)
                        .filter((serial, index, self) => self.indexOf(serial) === index)
                        .sort()
                        .map(serial => (
                          <option key={serial} value={serial}>
                            {serial}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Nombre</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Usuario</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Puesto</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Equipo</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Serial</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Fecha</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaciones
                        .filter(asignacion => {
                          const matchSerial = !searchSerial || 
                            asignacion.sn?.toLowerCase().includes(searchSerial.toLowerCase()) ||
                            asignacion.snSecundario?.toLowerCase().includes(searchSerial.toLowerCase()) ||
                            asignacion.serialCelular?.toLowerCase().includes(searchSerial.toLowerCase());
                          const matchNombre = asignacion.nombre
                            .toLowerCase()
                            .includes(searchNombre.toLowerCase());
                          const matchUsuario = asignacion.usuario
                            .toLowerCase()
                            .includes(searchUsuario.toLowerCase());
                          const matchCelular = !searchCelular || asignacion.serialCelular === searchCelular;
                          const matchEquipo = !searchEquipo || asignacion.tipoEquipo === searchEquipo;
                          const matchModelo = !searchModelo || asignacion.modelo === searchModelo;
                          return matchSerial && matchNombre && matchUsuario && matchCelular && matchEquipo && matchModelo;
                        })
                        .map(asignacion => (
                          <tr key={asignacion.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-900 font-medium">{asignacion.nombre}</td>
                            <td className="p-4 text-gray-900">{asignacion.usuario}</td>
                            <td className="p-4 text-gray-900">{asignacion.puesto}</td>
                            <td className="p-4 text-gray-900">{asignacion.marca} {asignacion.modelo}</td>
                            <td className="p-4 text-gray-900 font-mono text-xs">{asignacion.sn}</td>
                            <td className="p-4 text-gray-600">{asignacion.fechaAsignacion}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditar(asignacion)} className="btn-outline text-sm flex items-center justify-center gap-1">
                                  <Icon name="PencilOutline" size="sm" color="#0ea5e9" />
                                  Editar
                                </button>
                                <button onClick={() => handleDelete(asignacion.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                                  <Icon name="TrashOutline" size="sm" color="#ef4444" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Asignación"
          message="¿Estás seguro de que deseas eliminar esta asignación? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}


