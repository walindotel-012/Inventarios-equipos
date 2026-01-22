import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToastManager } from '../hooks/useToastManager';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Descargo() {
  const { currentUser, userPermissions } = useAuth();
  const { toast, showToast, hideToast } = useToastManager();
  const [asignaciones, setAsignaciones] = useState([]);
  const [descargos, setDescargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('descargo');
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [validatedAsignacion, setValidatedAsignacion] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const printRef = useRef();
  const reportPrintRef = useRef();

  useEffect(() => {
    // Usar listeners en tiempo real en lugar de getDocs una sola vez
    const unsubscribeAsignaciones = onSnapshot(collection(db, 'asignaciones'), (snapshot) => {
      try {
        const asignacionesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('📊 Asignaciones actualizadas en tiempo real:', asignacionesList.length);
        setAsignaciones(asignacionesList);
        
        // Si hay una asignación seleccionada, actualizarla con los datos más nuevos
        if (selectedAsignacion) {
          const updatedAsignacion = asignacionesList.find(a => a.id === selectedAsignacion.id);
          if (updatedAsignacion) {
            setSelectedAsignacion(updatedAsignacion);
          }
        }
      } catch (error) {
        console.error('Error en listener de asignaciones:', error);
      }
    });
    
    const unsubscribeDescargos = onSnapshot(collection(db, 'descargos'), (snapshot) => {
      try {
        let descargosList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Eliminar duplicados por ID
        descargosList = descargosList.filter((d, index, arr) => 
          arr.findIndex(item => item.id === d.id) === index
        );
        
        console.log('📋 Descargos actualizados en tiempo real:', descargosList.length);
        setDescargos(descargosList);
      } catch (error) {
        console.error('Error en listener de descargos:', error);
      }
    });
    
    // Limpiar listeners al desmontar
    return () => {
      unsubscribeAsignaciones();
      unsubscribeDescargos();
    };
  }, [selectedAsignacion?.id]);

  // Efecto para mantener selectedAsignacion actualizada con los cambios en asignaciones
  useEffect(() => {
    if (selectedAsignacion) {
      const asignacionActualizada = asignaciones.find(a => a.id === selectedAsignacion.id);
      if (asignacionActualizada) {
        setSelectedAsignacion(asignacionActualizada);
      }
    }
  }, [asignaciones]);

  const filteredAsignaciones = asignaciones.filter(a =>
    (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.codActivoFijo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.serialCelular || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDescargos = descargos.filter(a =>
    (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.codActivoFijo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.serialCelular || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveEdit = async (asignacion) => {
    try {
      setLoading(true);

      const selectedAsignacion = asignacion || asignaciones.find(a => a.id === editingId);
      if (!selectedAsignacion) {
        showToast('No se encontró la asignación', 'error');
        return;
      }

      // Preparar datos del descargo
      const descargoData = {
        ...selectedAsignacion,
        estado: 'descargado',
        fechaRegistroDescargo: new Date().toISOString(),
      };

      // 1. GUARDAR en la colección "descargos"
      await addDoc(collection(db, 'descargos'), descargoData);

      // 2. LIBERAR EQUIPO PRINCIPAL
      if (selectedAsignacion.codActivoFijo && typeof selectedAsignacion.codActivoFijo === 'string' && selectedAsignacion.codActivoFijo.trim()) {
        const equiposSnapshot = await getDocs(collection(db, 'equipos'));
        const equipoToUpdate = equiposSnapshot.docs.find(
          d => d.data().codActivoFijo === selectedAsignacion.codActivoFijo
        );
        if (equipoToUpdate) {
          await updateDoc(doc(db, 'equipos', equipoToUpdate.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      }

      // 3. LIBERAR EQUIPO SECUNDARIO
      if (selectedAsignacion.codActivoFijoSecundario && typeof selectedAsignacion.codActivoFijoSecundario === 'string' && selectedAsignacion.codActivoFijoSecundario.trim()) {
        const equiposSnapshot = await getDocs(collection(db, 'equipos'));
        const equipoSecundarioToUpdate = equiposSnapshot.docs.find(
          d => d.data().codActivoFijo === selectedAsignacion.codActivoFijoSecundario
        );
        if (equipoSecundarioToUpdate) {
          await updateDoc(doc(db, 'equipos', equipoSecundarioToUpdate.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      }

      // 4. LIBERAR CELULAR
      if (selectedAsignacion.serialCelular && typeof selectedAsignacion.serialCelular === 'string' && selectedAsignacion.serialCelular.trim()) {
        const celularesSnapshot = await getDocs(collection(db, 'celulares'));
        const celularToUpdate = celularesSnapshot.docs.find(
          d => d.data().serial === selectedAsignacion.serialCelular
        );
        if (celularToUpdate) {
          await updateDoc(doc(db, 'celulares', celularToUpdate.id), {
            estado: 'disponible',
            asignado: false,
          });
        }
      }

      // 5. ELIMINAR la asignación
      await deleteDoc(doc(db, 'asignaciones', selectedAsignacion.id));

      showToast('✅ Descargo validado correctamente. Los equipos han sido liberados.', 'success');
      
      // Actualizar datos y deseleccionar
      setSelectedAsignacion(null);

    } catch (error) {
      console.error('Error al validar descargo:', error);
      showToast('Error al validar descargo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (descargoId) => {
    setDeleteId(descargoId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'descargos', deleteId));
      showToast('Registro eliminado correctamente', 'success');
      loadData();
    } catch (error) {
      console.error('Error eliminando registro:', error);
      showToast('Error al eliminar registro', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleClearHistory = () => {
    setShowClearHistoryConfirm(true);
  };

  const handleConfirmClearHistory = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando limpieza de historial...', descargos.length, 'registros');
      
      // Deduplicar registros
      const uniqueDescargos = descargos.filter((d, index, arr) => 
        arr.findIndex(item => item.id === d.id) === index
      );
      
      console.log('📋 Registros únicos encontrados:', uniqueDescargos.length);
      
      if (uniqueDescargos.length === 0) {
        showToast('No hay registros para eliminar', 'info');
        setShowClearHistoryConfirm(false);
        return;
      }
      
      // Usar batch para eliminar todos los registros
      const batch = writeBatch(db);
      
      for (const descargo of uniqueDescargos) {
        const docRef = doc(db, 'descargos', descargo.id);
        batch.delete(docRef);
        console.log(`⏳ Añadiendo a batch para eliminar: ${descargo.id}`);
      }
      
      console.log('📤 Commitiendo batch...');
      
      try {
        await batch.commit();
        console.log(`✅ ${uniqueDescargos.length} registros eliminados del batch`);
      } catch (batchError) {
        console.error('❌ ERROR en batch.commit():', batchError);
        console.error('Código:', batchError.code);
        console.error('Mensaje:', batchError.message);
        
        if (batchError.code === 'permission-denied') {
          showToast('❌ PERMISOS INSUFICIENTES: Las reglas de Firestore no permiten eliminar. Contacta al administrador.', 'error');
          return;
        }
        throw batchError;
      }
      
      // Esperar a que Firebase procese
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Recargando datos desde Firebase...');
      const descargosSnapshot = await getDocs(collection(db, 'descargos'));
      const descargosList = descargosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Deduplicar por si acaso
      const deduplicatedList = descargosList.filter((d, index, arr) => 
        arr.findIndex(item => item.id === d.id) === index
      );
      
      console.log('📦 Datos recargados:', deduplicatedList.length, 'registros restantes');
      
      setDescargos(deduplicatedList);
      showToast(`✅ ${uniqueDescargos.length} registro(s) eliminado(s) correctamente`, 'success');
      
    } catch (error) {
      console.error('❌ Error al limpiar historial:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      showToast('Error al limpiar historial: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setShowClearHistoryConfirm(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !validatedAsignacion) return;

    try {
      setLoading(true);
      await generatePDF();
      setShowPDFModal(false);
      setValidatedAsignacion(null);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      showToast('Error al descargar PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    if (!printRef.current) return;

    try {
      handlePrint();
      setShowPDFModal(false);
      setValidatedAsignacion(null);
    } catch (error) {
      console.error('Error al imprimir:', error);
      showToast('Error al imprimir', 'error');
    }
  };

  const handlePreviewPDF = () => {
    if (!printRef.current || !validatedAsignacion) {
      showToast('No hay datos para previsualizar', 'error');
      return;
    }

    try {
      // Abrir en nueva ventana
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('Por favor, permite las ventanas emergentes', 'error');
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Vista Previa - Descargo de Equipo</title>
            <link href="https://fonts.googleapis.com/css2?family=Kodchasan:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: Kodchasan; margin: 0; padding: 20px; background-color: #f5f5f5; }
              .container { background: white; padding: 40px; margin: 20px auto; max-width: 850px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .page { page-break-after: always; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              ${printRef.current.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error al previsualizar:', error);
      showToast('Error al previsualizar PDF', 'error');
    }
  };

  const generatePDF = async () => {
    if (!printRef.current) return;

    let pdfContainer = null;

    try {
      pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 210mm;
        height: 297mm;
        padding: 12.45mm 21.84mm 9.91mm 21.84mm;
        background: white;
        box-sizing: border-box;
        font-family: Kodchasan;
        margin: 0;
        position: absolute;
        left: -9999px;
        top: 0;
        display: block;
      `;
      
      // Agregar estilos CSS antes del contenido
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Kodchasan:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Kodchasan', sans-serif !important; }
      `;
      pdfContainer.appendChild(styleTag);
      
      pdfContainer.innerHTML += printRef.current.innerHTML;
      document.body.appendChild(pdfContainer);

      // Esperar a que se carguen todas las imágenes
      const images = pdfContainer.querySelectorAll('img');
      
      if (images.length > 0) {
        await new Promise((resolve) => {
          let loadedImages = 0;
          let resolved = false;
          
          const checkIfDone = () => {
            if (loadedImages === images.length && !resolved) {
              resolved = true;
              resolve(true);
            }
          };
          
          const onImageLoad = () => {
            loadedImages++;
            checkIfDone();
          };
          
          images.forEach(img => {
            if (img.complete) {
              loadedImages++;
            } else {
              img.addEventListener('load', onImageLoad);
              img.addEventListener('error', onImageLoad);
            }
          });
          
          // Verificar inmediatamente si todas ya están cargadas
          checkIfDone();
          
          // Fallback después de 2 segundos como máximo
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(true);
            }
          }, 2000);
        });
      }
      
      // Esperar un poco adicional para que se renderice bien
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,  
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: pdfContainer.offsetWidth,
        windowHeight: pdfContainer.offsetHeight,
        timeout: 30000,
        imageTimeout: 30000,
        removeContainer: false,
        ignoreElements: (element) => {
          // Ignorar elementos que no queremos en la captura
          if (element.classList && element.classList.contains('no-print')) {
            return true;
          }
          return false;
        }
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vacío o inválido.');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidthMm = 210;
      const imgHeightMm = imgWidthMm * canvasHeight / canvasWidth;

      if (imgHeightMm <= 297) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
      } else {
        let heightLeft = imgHeightMm;
        let position = 0;
        let pageNumber = 0;

        while (heightLeft > 0) {
          if (pageNumber > 0) {
            pdf.addPage();
          }

          const pageHeight = Math.min(297, heightLeft);
          const srcTop = (position / imgHeightMm) * canvasHeight;
          const srcHeight = (pageHeight / imgHeightMm) * canvasHeight;

          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = canvasWidth;
          srcCanvas.height = srcHeight;

          const ctx = srcCanvas.getContext('2d');
          if (!ctx) throw new Error('No se pudo obtener contexto 2D');

          ctx.drawImage(
            canvas,
            0, srcTop,
            canvasWidth, srcHeight,
            0, 0,
            canvasWidth, srcHeight
          );

          const pageImgData = srcCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidthMm, pageHeight);

          heightLeft -= pageHeight;
          position += pageHeight;
          pageNumber++;
        }
      }

      const fileName = validatedAsignacion
        ? `FO-TEC-002 Formulario de Descargo de ${validatedAsignacion.nombre} ${validatedAsignacion.fechaDescargo || new Date().toISOString().split('T')[0]}.pdf`
        : 'FO-TEC-002 Formulario de Descargo.pdf';

      pdf.save(fileName);
      showToast('PDF descargado correctamente', 'success');
    } catch (err) {
      console.error('Error generando PDF:', err);
      showToast('Error al generar PDF', 'error');
    } finally {
      if (pdfContainer && pdfContainer.parentNode) {
        document.body.removeChild(pdfContainer);
      }
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    // Crear una copia del contenido sin transformaciones
    const originalContent = printRef.current.innerHTML;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Descargo de Equipo</title>
          <style>
            @page {
              margin: 0 !important;
              padding: 0 !important;
              size: letter portrait;
              orphans: 0;
              widows: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif !important; 
              background: #fff !important; 
              color: #000 !important;
              line-height: 1.6;
            }
            div[style*="width: 210mm"] {
              width: 8.5in !important;
              height: auto !important;
              margin: 0 !important;
              padding: 14.4mm 22mm 10mm 22mm !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              overflow: visible !important;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
              page-break-inside: avoid;
            }
            table { 
              border-collapse: collapse; 
              width: 100%;
              page-break-inside: avoid;
            }
            td, th {
              page-break-inside: avoid;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${originalContent}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Esperar a que se carguen todas las imágenes antes de imprimir
    const images = iframeDoc.querySelectorAll('img');
    let loadedImages = 0;
    let printCalled = false; // Flag para evitar llamadas múltiples a print()
    
    const doPrint = () => {
      if (printCalled) return; // Evitar múltiples llamadas
      printCalled = true;

      setTimeout(() => {
        iframe.contentWindow.print();
        // Limpiar después de que se cierre el diálogo de impresión
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 500);
      }, 300);
    };
    
    if (images.length === 0) {
      // Si no hay imágenes, imprimir inmediatamente
      doPrint();
    } else {
      // Esperar a que todas las imágenes carguen
      const onImageLoad = () => {
        loadedImages++;
        if (loadedImages === images.length) {
          doPrint();
        }
      };
      
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', onImageLoad);
          img.addEventListener('error', onImageLoad);
        }
      });
      
      // Si todas las imágenes ya están cargadas
      if (loadedImages === images.length) {
        doPrint();
      }
      
      // Fallback: si las imágenes no cargan después de 5 segundos, imprimir de todas formas
      setTimeout(() => {
        doPrint(); // Usar el flag en doPrint para evitar duplicados
      }, 5000);
    }
  };

  const generateReportPDF = async () => {
    if (!reportPrintRef.current) return;

    let pdfContainer = null;

    try {
      pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 8.5in;
        height: 11in;
        padding: 1in 1in 0 1in;
        background: white;
        box-sizing: border-box;
        font-family: 'Kodchasan', sans-serif;
        margin: 0;
        position: absolute;
        left: -9999px;
        top: 0;
        display: block;
      `;
      
      // Agregar estilos CSS antes del contenido
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Kodchasan:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Kodchasan', sans-serif !important; }
      `;
      pdfContainer.appendChild(styleTag);
      
      pdfContainer.innerHTML += reportPrintRef.current.innerHTML;
      document.body.appendChild(pdfContainer);

      // Esperar a que se carguen todas las imágenes
      const images = pdfContainer.querySelectorAll('img');
      
      if (images.length > 0) {
        await new Promise((resolve) => {
          let loadedImages = 0;
          let resolved = false;
          
          const checkIfDone = () => {
            if (loadedImages === images.length && !resolved) {
              resolved = true;
              resolve(true);
            }
          };
          
          const onImageLoad = () => {
            loadedImages++;
            checkIfDone();
          };
          
          images.forEach(img => {
            if (img.complete) {
              loadedImages++;
            } else {
              img.addEventListener('load', onImageLoad);
              img.addEventListener('error', onImageLoad);
            }
          });
          
          // Verificar inmediatamente si todas ya están cargadas
          checkIfDone();
          
          // Fallback después de 2 segundos como máximo
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(true);
            }
          }, 2000);
        });
      }
      
      // Esperar un poco adicional para que se renderice bien
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: pdfContainer.offsetWidth,
        timeout: 30000,
        imageTimeout: 30000,
        removeContainer: false,
        ignoreElements: (element) => {
          // Ignorar elementos que no queremos en la captura
          if (element.classList && element.classList.contains('no-print')) {
            return true;
          }
          return false;
        }
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidthMm = 297;
      const imgHeightMm = imgWidthMm * canvasHeight / canvasWidth;

      if (imgHeightMm <= 210) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
      } else {
        let heightLeft = imgHeightMm;
        let position = 0;
        let pageNumber = 0;

        while (heightLeft > 0) {
          if (pageNumber > 0) {
            pdf.addPage();
          }

          const pageHeight = Math.min(210, heightLeft);
          const srcTop = (position / imgHeightMm) * canvasHeight;
          const srcHeight = (pageHeight / imgHeightMm) * canvasHeight;

          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = canvasWidth;
          srcCanvas.height = srcHeight;

          const ctx = srcCanvas.getContext('2d');
          if (!ctx) throw new Error('No se pudo obtener contexto 2D');

          ctx.drawImage(
            canvas,
            0, srcTop,
            canvasWidth, srcHeight,
            0, 0,
            canvasWidth, srcHeight
          );

          const pageImgData = srcCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidthMm, pageHeight);

          heightLeft -= pageHeight;
          position += pageHeight;
          pageNumber++;
        }
      }

      const fileName = `Reporte-Descargos-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showToast('Reporte PDF descargado correctamente', 'success');
    } catch (err) {
      console.error('Error generando reporte PDF:', err);
      showToast('Error al generar reporte PDF', 'error');
    } finally {
      if (pdfContainer && pdfContainer.parentNode) {
        document.body.removeChild(pdfContainer);
      }
    }
  };

  const generateReportExcel = () => {
    try {
      const dataExcel = filteredDescargos.map(d => ({
        'Nombre Usuario': d.nombre,
        'Usuario': d.usuario,
        'Tipo Equipo': d.codActivoFijo ? 'Equipo' : 'Celular',
        'Código/Serial': d.codActivoFijo || d.serialCelular,
        'Marca': d.marca || d.marcaCelular,
        'Modelo': d.modelo || d.modeloCelular,
        'Fecha Asignación': d.fechaAsignacion,
        'Fecha Descargo': d.fechaDescargo,
        'Responsable Asignación': d.asignadoPor,
        'Responsable Descargo': d.usuarioDescargo,
        'Observaciones': d.observacionesDescargo || 'N/A',
      }));

      if (dataExcel.length === 0) {
        showToast('No hay descargas que coincidan con los filtros para exportar', 'warning');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(dataExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Descargos');

      ws['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 30 },
      ];

      const fileName = `Reporte-Descargos-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Reporte Excel descargado correctamente', 'success');
    } catch (err) {
      console.error('Error generando reporte Excel:', err);
      showToast('Error al generar reporte Excel', 'error');
    }
  };

  return (
    <>
      <Toast {...toast} onClose={hideToast} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3"><Icon name="ClipboardOutline" size="lg" color="#0ea5e9" /> Gestión de Descargos</h1>
            <p className="text-gray-600">Registra, visualiza y genera reportes de descargos de equipos</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('descargo')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'descargo'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-500'
              }`}
            >
              <Icon name="ClipboardOutline" size="sm" color={activeTab === 'descargo' ? 'white' : '#374151'} />
              Registrar Descargo
            </button>
            <button
              onClick={() => setActiveTab('descargos')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'descargos'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-green-500'
              }`}
            >
              <Icon name="CheckmarkDoneOutline" size="sm" color={activeTab === 'descargos' ? 'white' : '#374151'} />
              Equipos Descargados ({descargos.length})
            </button>
          </div>

          {activeTab === 'descargo' ? (
            // Pestaña de Descargo - Similar a Entrega
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Panel de búsqueda y selección */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Icon name="SearchOutline" size="sm" color="#0ea5e9" /> Seleccionar Asignación</h2>

                  {/* Búsqueda */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o usuario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
                    />
                  </div>

                  {loading && (
                    <div className="p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-blue-200 border-t-blue-600"></div>
                      <p className="text-gray-600 mt-2 text-sm">Cargando...</p>
                    </div>
                  )}

                  {/* Lista de asignaciones */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredAsignaciones.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-4">No hay asignaciones disponibles</p>
                    ) : (
                      filteredAsignaciones.map(asignacion => (
                        <button
                          key={asignacion.id}
                          onClick={() => {
                            // Buscar la asignación actualizada en el array completo
                            const asignacionActualizada = asignaciones.find(a => a.id === asignacion.id) || asignacion;
                            setSelectedAsignacion(asignacionActualizada);
                            setSearchTerm('');
                          }}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedAsignacion?.id === asignacion.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300 bg-white'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{asignacion.nombre}</p>
                          <p className="text-xs text-gray-600">Usuario: {asignacion.usuario}</p>
                          <p className="text-xs text-gray-600">{asignacion.codActivoFijo || 'Sin equipo'}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Vista previa del PDF y Botones de acción */}
              <div className="lg:col-span-2">
                {!selectedAsignacion ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <Icon name="DocumentOutline" size="xl" color="#9ca3af" />
                      </div>
                      <p className="text-gray-600 text-lg">Selecciona una asignación para ver el formulario de descargo</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header con nombre y botones de acción */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{selectedAsignacion.nombre}</h3>
                          <p className="text-sm text-gray-600 mt-1">Usuario: {selectedAsignacion.usuario}</p>
                          <p className="text-sm text-gray-600">{selectedAsignacion.codActivoFijo || 'Sin equipo'}</p>
                        </div>
                        
                        {/* Botones de acción en fila */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleSaveEdit(selectedAsignacion)}
                            disabled={loading}
                            className="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                          >
                            {loading ? (
                              <>
                                <Icon name="HourglassOutline" size="sm" color="white" />
                                Validando...
                              </>
                            ) : (
                              <>
                                <Icon name="CheckmarkDoneOutline" size="sm" color="white" />
                                Validar
                              </>
                            )}
                          </button>
                          <button
                            onClick={handlePrint}
                            className="px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                          >
                            <Icon name="PrintOutline" size="sm" color="white" />
                            Imprimir
                          </button>
                          <button
                            onClick={() => setSelectedAsignacion(null)}
                            className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                          >
                            <Icon name="CloseOutline" size="sm" color="#374151" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vista previa del PDF */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="bg-gray-50 rounded-lg p-4 max-h-screen overflow-y-auto border border-gray-200" style={{ height: '600px' }}>
                        <div ref={printRef} style={{ width: '100%' }}>
                          <DescargoPDFTemplate asignacion={selectedAsignacion} userPermissions={userPermissions} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Pestaña de Equipos Descargados
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Equipos Descargados</h2>
                <div className="flex gap-3">
                  <button
                    onClick={generateReportPDF}
                    className="hidden px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all text-sm items-center justify-center gap-2"
                  >
                    <Icon name="DocumentOutline" size="sm" color="white" />
                    Descargar PDF
                  </button>
                  <button
                    onClick={generateReportExcel}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Icon name="BarChartOutline" size="sm" color="white" />
                    Descargar Excel
                  </button>
                  <button
                    onClick={handleClearHistory}
                    disabled={descargos.length === 0 || loading}
                    className="hidden px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all text-sm items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="TrashOutline" size="sm" color="white" />
                    Limpiar Historial
                  </button>
                </div>
              </div>

              {/* Búsqueda */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar equipos descargados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {/* Gridview de Descargos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Código/Serial</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Marca</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Modelo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">F. Asignación</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">F. Descargo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Asignado Por</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Descargado Por</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="text-center py-4 text-gray-600">Cargando...</td>
                      </tr>
                    ) : filteredDescargos.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-4 text-gray-600">No hay equipos descargados</td>
                      </tr>
                    ) : (
                      filteredDescargos.map((descargo, idx) => (
                        <tr key={`${descargo.id}-${idx}`} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{descargo.nombre}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                            {descargo.codActivoFijo ? (
                              <>
                                <Icon name="LaptopOutline" size="sm" color="#6b7280" />
                                Equipo
                              </>
                            ) : (
                              <>
                                <Icon name="PhonePortraitOutline" size="sm" color="#6b7280" />
                                Celular
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {descargo.codActivoFijo || descargo.serialCelular}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {descargo.marca || descargo.marcaCelular || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {descargo.modelo || descargo.modeloCelular || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{descargo.fechaAsignacion}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            {descargo.fechaDescargo}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{descargo.asignadoPor}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{descargo.usuarioDescargo}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDelete(descargo.id)}
                              className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                            >
                              <Icon name="TrashOutline" size="sm" color="#ef4444" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Reporte para PDF - Oculto */}
              <div ref={reportPrintRef} style={{ display: 'none' }}>
                <ReportePDFTemplate descargos={filteredDescargos} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación PDF después de validar */}
      {showPDFModal && validatedAsignacion && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-200">
            <div className="text-center mb-6">
              <div className="mb-2 flex justify-center">
                <Icon name="CheckmarkCircleOutline" size="xl" color="#10b981" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Descargo Validado!</h2>
              <p className="text-gray-600">
                Los equipos de <strong>{validatedAsignacion.nombre}</strong> han sido liberados correctamente.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">¿Qué deseas hacer ahora?</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePreviewPDF}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="EyeOutline" size="sm" color="white" />
                Vista Previa
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Icon name="HourglassOutline" size="sm" color="white" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Icon name="CloudDownloadOutline" size="sm" color="white" />
                    Descargar PDF
                  </>
                )}
              </button>
              <button
                onClick={handlePrintPDF}
                className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="PrintOutline" size="sm" color="white" />
                Imprimir
              </button>
              <button
                onClick={() => {
                  setShowPDFModal(false);
                  setValidatedAsignacion(null);
                }}
                className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      , document.getElementById('portal') || document.body
      )}

      {/* Template PDF oculto */}
      {validatedAsignacion && (
        <div ref={printRef} style={{ display: 'none' }}>
          <DescargoPDFTemplate asignacion={validatedAsignacion} userPermissions={userPermissions} />
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Descargo"
          message="¿Estás seguro de que deseas eliminar este registro de descargo? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showClearHistoryConfirm && (
        <ConfirmDialog
          title="Limpiar Historial"
          message={`¿Estás seguro de que deseas eliminar todo el historial de descargos (${descargos.length} registro${descargos.length !== 1 ? 's' : ''})? Esta acción no se puede deshacer.`}
          confirmText="Limpiar Todo"
          cancelText="Cancelar"
          onConfirm={handleConfirmClearHistory}
          onCancel={() => setShowClearHistoryConfirm(false)}
          isDangerous={true}
        />
      )}
    </>
  );
}

// Componente para el template del PDF - Formato FO-TEC-002
function DescargoPDFTemplate({ asignacion, userPermissions }) {
  const codigo = 'FO-TEC-002';
  const vigencia = '05-jun-2025';
  const pagina = '1 de 1';

  // Construir lista de equipos
  const equipos = [];

  if (asignacion.sn && asignacion.codActivoFijo) {
    equipos.push({
      tipo: asignacion.tipoEquipo || 'PC',
      cantidad: '1',
      marca: asignacion.marca || '',
      serial: asignacion.sn || '',
      especificaciones: `${asignacion.disco || ''}, ${asignacion.memoria || ''}, ${asignacion.procesador || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
    });
  }

  if (asignacion.snSecundario && asignacion.equipoSecundario) {
    equipos.push({
      tipo: asignacion.tipoEquipoSecundario || 'PC',
      cantidad: '1',
      marca: asignacion.marcaSecundario || '',
      serial: asignacion.snSecundario || '',
      especificaciones: `${asignacion.discoSecundario || ''}, ${asignacion.memoriaSecundario || ''}, ${asignacion.procesadorSecundario || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
    });
  }

  if (asignacion.serialCelular && asignacion.celularId) {
    equipos.push({
      tipo: 'Teléfono',
      cantidad: '1',
      marca: asignacion.marcaCelular || '',
      serial: asignacion.serialCelular || '',
      especificaciones: asignacion.modeloCelular || '',
    });
  }

  if (asignacion.accesorioId && asignacion.accesorioNombre) {
    equipos.push({
      tipo: 'Accesorio',
      cantidad: '1',
      marca: asignacion.marcaAccesorio || 'N/A',
      serial: asignacion.codigoActivoFijoAccesorio || asignacion.accesorioNombre || '',
      especificaciones: asignacion.tipoAccesorio || 'Accesorio',
    });
  }

  return (
    <div style={{
      width: '210mm',
      height: 'auto',
      minHeight: '297mm',
      maxHeight: '297mm',
      overflow: 'hidden',
      padding: '14.4mm 22mm 10mm 22mm',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      fontFamily: "'Kodchasan', sans-serif",
      fontSize: '9pt',
      lineHeight: '1.2',
      color: '#000000',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kodchasan:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Kodchasan', sans-serif !important; }
      `}</style>
        {/* --- HEADER: tabla con logo, título y datos - Igual a Descargo --- */}
              <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    {/* Logo/Nombre empresa */}
                    <td style={{ 
                      width: '25%', 
                      fontWeight: 'bold', 
                      fontSize: '12pt',
                      border: '1.5px solid #000000',
                      padding: '6px 4px',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      fontFamily: "'Kodchasan', sans-serif"
                    }}>
                      <img 
                        src="/logo.png" 
                        alt="AUTOMÍA Logo"
                        style={{ 
                          // PUEDES MODIFICAR ESTOS VALORES PARA AJUSTAR EL TAMAÑO DEL LOGO
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: '60px',
                          // FIN DE VALORES MODIFICABLES
                          display: 'block',
                          margin: '0 auto'
                        }} 
                      />
                    </td>
            {/* Título central */}
            <td style={{ 
              width: '50%', 
              textAlign: 'center', 
              fontWeight: 'bold', 
              fontSize: '11pt',
              border: '1.5px solid #000000',
              padding: '6px 4px',
              verticalAlign: 'middle'
            }}>
              Formulario de Descargo de Equipos
            </td>
            {/* Info lado derecho */}
            <td style={{ 
              width: '25%', 
              border: '1.5px solid #000000',
              padding: '4px',
              verticalAlign: 'top',
              fontSize: '7.5pt'
            }}>
              <div style={{ marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Código:</span>
                <span>{codigo}</span>
              </div>
              <div style={{ marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Vigencia:</span>
                <span>{vigencia}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Página:</span>
                <span>{pagina}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* RESPONSABLE Y ÁREA */}
      <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ 
              width: '25%',
              fontWeight: 'bold',
              fontSize: '9pt',
              border: '1px solid #000000',
              padding: '4px',
              verticalAlign: 'middle'
            }}>
              Responsable:
            </td>
            <td style={{ 
              width: '75%',
              border: '1px solid #000000',
              padding: '4px',
              fontSize: '9pt',
              verticalAlign: 'middle'
            }}>
              {asignacion.asignadoPor || '___________________________________________'}
            </td>
          </tr>
          <tr>
            <td style={{ 
              fontWeight: 'bold',
              fontSize: '9pt',
              border: '1px solid #000000',
              padding: '4px',
              verticalAlign: 'middle'
            }}>
              Departamento:
            </td>
            <td style={{ 
              border: '1px solid #000000',
              padding: '4px',
              fontSize: '9pt',
              verticalAlign: 'middle'
            }}>
              {userPermissions?.departamento || '___________________________________________'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TÍTULO CENTRAL */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        fontWeight: 'bold', 
        fontSize: '11pt',
              }}>
             Descargo de Equipos Asignados    
      </div>

      {/* DATOS DEL COLABORADOR */}
      <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', border: '1.5px solid #000000' }}>
        <tbody>
          <tr>
            <td style={{ 
              backgroundColor: '#FF9500',
              color: '#ffffff',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '9pt',
              border: '1.5px solid #000000'
            }}>
              Datos del Colaborador
            </td>
          </tr>
          <tr>
            <td style={{ padding: '0px', border: '1.5px solid #000000' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ 
                      width: '25%',
                      fontWeight: 'bold',
                      fontSize: '9pt',
                      borderRight: '1px solid #000000',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      Empresa:
                    </td>
                    <td style={{ 
                      fontSize: '9pt',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      {asignacion.empresa || 'AUTOMÍA SAS'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      fontWeight: 'bold',
                      fontSize: '9pt',
                      borderRight: '1px solid #000000',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      Nombre:
                    </td>
                    <td style={{ 
                      fontSize: '9pt',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      {asignacion.nombre || '___________________________________________'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      fontWeight: 'bold',
                      fontSize: '9pt',
                      borderRight: '1px solid #000000',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      Posición:
                    </td>
                    <td style={{ 
                      fontSize: '9pt',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      {asignacion.puesto || '___________________________________________'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      fontWeight: 'bold',
                      fontSize: '9pt',
                      borderRight: '1px solid #000000',
                      padding: '4px'
                    }}>
                      Departamento/Sucursal:
                    </td>
                    <td style={{ 
                      fontSize: '9pt',
                      padding: '4px'
                    }}>
                      {asignacion.sucursal || '___________________________________________'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABLA DE EQUIPOS */}
      {equipos.length > 0 && (
        <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', border: '1px solid #000000' }}>
          <tbody>
            <tr>
              <td style={{ 
                backgroundColor: '#FF9500',
                color: '#ffffff',
                padding: '10px',
                fontWeight: 'bold',
                fontSize: '9pt',
                border: '1px solid #000000'
              }}>
                Equipos
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0px', border: '1px solid #000000' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FF9500', color: '#ffffff' }}>
                      <th style={{ 
                        width: '6%',
                        border: '1px solid #000000',
                        padding: '4px',
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        ☑
                      </th>
                      <th style={{ 
                        width: '14%',
                        border: '1px solid #000000',
                        padding: '4px',
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}>
                        Tipo
                      </th>
                      <th style={{ 
                        width: '8%',
                        border: '1px solid #000000',
                        padding: '4px',
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        Cant.
                      </th>
                      <th style={{ 
                        width: '14%',
                        border: '1px solid #000000',
                        padding: '4px',
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}>
                        Marca
                      </th>
                      <th style={{ 
                        width: '18%',
                        border: '1px solid #000000',
                        padding: '4px',
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}>
                        Serial/Código
                      </th>
                      <th style={{ 
                        width: '40%',
                        border: '1px solid #000000',
                        padding: '4px',
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}>
                        Especificaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipos.map((equipo, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f8f8f8' : '#ffffff' }}>
                        <td style={{ 
                          border: '1px solid #000000',
                          padding: '3px',
                          textAlign: 'center',
                          fontSize: '9pt',
                          fontWeight: 'bold'
                        }}>
                          ☐
                        </td>
                        <td style={{ 
                          border: '1px solid #000000',
                          padding: '3px',
                          fontSize: '9pt'
                        }}>
                          {equipo.tipo}
                        </td>
                        <td style={{ 
                          border: '1px solid #000000',
                          padding: '3px',
                          textAlign: 'center',
                          fontSize: '9pt'
                        }}>
                          {equipo.cantidad}
                        </td>
                        <td style={{ 
                          border: '1px solid #000000',
                          padding: '3px',
                          fontSize: '9pt'
                        }}>
                          {equipo.marca}
                        </td>
                        <td style={{ 
                          border: '1px solid #000000',
                          padding: '3px',
                          fontSize: '9pt'
                        }}>
                          {equipo.serial}
                        </td>
                        <td style={{ 
                          border: '1px solid #000000',
                          padding: '3px',
                          fontSize: '8pt'
                        }}>
                          {equipo.especificaciones}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* OBSERVACIONES */}
      <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', border: '1.5px solid #000000' }}>
        <tbody>
          <tr>
            <td style={{ 
              backgroundColor: '#FF9500',
              color: '#ffffff',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '9pt',
              border: '1.5px solid #000000'
            }}>
              Observaciones
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '16px',
              minHeight: '50px',
              fontSize: '9pt',
              verticalAlign: 'top',
              border: '1.5px solid #000000',
              wordWrap: 'break-word'
            }}>
            </td>
          </tr>
        </tbody>
      </table>

      {/* DATOS DE QUIÉN RECIBE */}
      <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', border: '1.5px solid #000000' }}>
        <tbody>
          <tr>
            <td style={{ 
              backgroundColor: '#FF9500',
              color: '#ffffff',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '9pt',
              border: '1.5px solid #000000'
            }}>
              Datos de quién Recibe
            </td>
          </tr>
          <tr>
            <td style={{ padding: '0px', border: '1.5px solid #000000' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ 
                      width: '25%',
                      fontWeight: 'bold',
                      fontSize: '9pt',
                      borderRight: '1px solid #000000',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                      Nombres:
                    </td>
                    <td style={{ 
                      fontSize: '9pt',
                      borderBottom: '1px solid #000000',
                      padding: '4px'
                    }}>
                     
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      fontWeight: 'bold',
                      fontSize: '9pt',
                      borderRight: '1px solid #000000',
                      padding: '4px'
                    }}>
                      Fecha de Descargo:
                    </td>
                    <td style={{ 
                      fontSize: '9pt',
                      padding: '4px'
                    }}>
                    
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* TEXTO DE CERTIFICACIÓN */}
      <div style={{
        marginTop: '15px',
        marginBottom: '20px',
        padding: '15px',
        fontSize: '8.5pt',
        lineHeight: '1.4',
        textAlign: 'justify',
        border: '0px solid #cccccc'
      }}>
        Yo, ______________________________ identificado con cédula/pasaporte número: ___________________ certifico que he devuelto los equipos descritos en este documento en las condiciones indicadas en la sección de observaciones.
      </div>

      {/* FIRMAS */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <tbody>
          <tr>
            <td style={{ 
              width: '20%',
              textAlign: 'center',
              padding: '35px 10px 5px 5px',
              fontSize: '9pt'
            }}>
              <div style={{ borderTop: '1px solid #000000', paddingTop: '1px' }}>
                Firma del Colaborador
              </div>
            </td>
            <td style={{ 
               width: '20%',
              textAlign: 'center',
              padding: '35px 10px 5px 15px',
              fontSize: '9pt'
            }}>
              <div style={{ borderTop: '1px solid #000000', paddingTop: '1px' }}>
                Representante de Gestión Humana
              </div>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}

// Componente para el template del Reporte PDF
function ReportePDFTemplate({ descargos }) {
  const currentDate = new Date().toLocaleDateString('es-ES');

  return (
    <div style={{
      width: '297mm',
      padding: '12.45mm 21.84mm',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      fontFamily: "'Kodchasan', sans-serif",
      fontSize: '10px',
      color: '#333',
    }}>
      <div style={{ marginBottom: '20px', textAlign: 'center', borderBottom: '2px solid #003399', paddingBottom: '15px' }}>
        <h1 style={{
          margin: '0 0 5px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#003399',
        }}>
          REPORTE DE EQUIPOS DESCARGADOS
        </h1>
        <p style={{
          margin: '5px 0',
          color: '#666',
          fontSize: '9px',
        }}>
          Generado: {currentDate}
        </p>
      </div>
    </div>
  );
}



