import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import ConfirmDialog from '../components/ConfirmDialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function HojaEntrega() {
  const { currentUser, userPermissions } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [tipoEquipo, setTipoEquipo] = useState('laptop');
  const printRef = useRef();
  const printRefsMap = useRef(new Map()); // Para múltiples referencias

  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    sucursal: '',
    puesto: '',
    marca: '',
    tipoEquipo: '',
    fechaInicio: '',
    fechaFin: '',
  });

  // Estados para selección masiva
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [generatingPdfs, setGeneratingPdfs] = useState(false);

  // Estados para diálogo de confirmación personalizado
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
    isDangerous: false
  });

  useEffect(() => {
    // Usar listener en tiempo real para asignaciones
    const unsubscribe = onSnapshot(collection(db, 'asignaciones'), (snapshot) => {
      try {
        const asignacionesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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

    // Listener para celulares
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
    
    return () => {
      unsubscribe();
      unsubscribeCelulares();
    }; // Limpiar listeners al desmontar
  }, [selectedAsignacion?.id]);

  const filteredAsignaciones = asignaciones.filter(a => {
    // Búsqueda por nombre/usuario
    const matchSearch = !searchTerm || 
      (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.usuario || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por sucursal
    const matchSucursal = !filtros.sucursal || (a.sucursal || '').toLowerCase() === filtros.sucursal.toLowerCase();

    // Filtro por puesto
    const matchPuesto = !filtros.puesto || (a.puesto || '').toLowerCase() === filtros.puesto.toLowerCase();

    // Filtro por marca (buscar en equipos principales, celulares y secundarios)
    const matchMarca = !filtros.marca || 
      (a.marca || '').toLowerCase() === filtros.marca.toLowerCase() ||
      (a.marcaCelular || '').toLowerCase() === filtros.marca.toLowerCase() ||
      (a.marcaSecundario || '').toLowerCase() === filtros.marca.toLowerCase();

    // Filtro por tipo de equipo (buscar en todos los tipos: principal, celular, secundario)
    const matchTipo = !filtros.tipoEquipo || 
      (a.tipoEquipo || '').toLowerCase() === filtros.tipoEquipo.toLowerCase() ||
      (a.tipoEquipoCelular || '').toLowerCase() === filtros.tipoEquipo.toLowerCase() ||
      (a.tipoEquipoSecundario || '').toLowerCase() === filtros.tipoEquipo.toLowerCase();

    // Filtro por rango de fecha
    let matchFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaAsignacion = new Date(a.fechaAsignacion);
      if (filtros.fechaInicio) {
        const inicio = new Date(filtros.fechaInicio);
        matchFecha = matchFecha && fechaAsignacion >= inicio;
      }
      if (filtros.fechaFin) {
        const fin = new Date(filtros.fechaFin);
        fin.setHours(23, 59, 59, 999);
        matchFecha = matchFecha && fechaAsignacion <= fin;
      }
    }

    return matchSearch && matchSucursal && matchPuesto && matchMarca && matchTipo && matchFecha;
  });

  // Obtener valores únicos para dropdowns de filtros
  const sucursalesUnicas = [...new Set(asignaciones.map(a => a.sucursal).filter(Boolean))].sort();
  const puestosUnicos = [...new Set(asignaciones.map(a => a.puesto).filter(Boolean))].sort();
  // Incluir marcas de equipos principales, celulares y secundarios
  const marcasUnicas = [...new Set([
    ...asignaciones.map(a => a.marca).filter(Boolean),
    ...asignaciones.map(a => a.marcaCelular).filter(Boolean),
    ...asignaciones.map(a => a.marcaSecundario).filter(Boolean)
  ])].sort();
  // Incluir tipos de equipo tanto de equipos principales como de celulares
  const tiposUnicosEquipo = [...new Set([
    ...asignaciones.map(a => a.tipoEquipo).filter(Boolean),
    ...asignaciones.map(a => a.tipoEquipoCelular).filter(Boolean),
    ...asignaciones.map(a => a.tipoEquipoSecundario).filter(Boolean),
    ...celulares.map(c => c.tipoEquipo).filter(Boolean)
  ])].sort();

  const handleSelectAsignacion = (asignacion) => {
    // Buscar la asignación actualizada en el array de asignaciones completo
    // para asegurar que tenemos los datos más recientes
    const asignacionActualizada = asignaciones.find(a => a.id === asignacion.id) || asignacion;
    setSelectedAsignacion(asignacionActualizada);
  };

  /**
   * Abre diálogo de confirmación personalizado
   */
  const openConfirmDialog = (config) => {
    setConfirmDialogConfig(config);
    setShowConfirmDialog(true);
  };

  /**
   * Cierra diálogo y ejecuta confirmación
   */
  const handleConfirmAction = () => {
    if (confirmDialogConfig.onConfirm) {
      confirmDialogConfig.onConfirm();
    }
    setShowConfirmDialog(false);
  };

  /**
   * Cierra diálogo sin hacer nada
   */
  const handleCancelAction = () => {
    setShowConfirmDialog(false);
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
      sucursal: '',
      puesto: '',
      marca: '',
      tipoEquipo: '',
      fechaInicio: '',
      fechaFin: '',
    });
    setSearchTerm('');
    setSelectedIds(new Set());
  };

  // Manejar selección de checkbox
  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Seleccionar todos los filtrados
  const handleSelectAll = () => {
    if (selectedIds.size === filteredAsignaciones.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAsignaciones.map(a => a.id)));
    }
  };

  // Efecto para mantener selectedAsignacion actualizada con los cambios en asignaciones
  useEffect(() => {
    if (selectedAsignacion) {
      const asignacionActualizada = asignaciones.find(a => a.id === selectedAsignacion.id);
      if (asignacionActualizada) {
        setSelectedAsignacion(asignacionActualizada);
      }
    }
  }, [asignaciones]);

  /**
   * Obtiene los datos actualizados de un celular desde la colección de celulares
   * Busca por serial y retorna los datos más recientes incluyendo tipoEquipo
   */
  const getCelularActualizado = (serialCelular) => {
    if (!serialCelular || !celulares || celulares.length === 0) {
      return null;
    }
    return celulares.find(c => c.serial && c.serial.trim() === serialCelular.trim());
  };

  /**
   * Obtiene el tipoEquipo actualizado de un celular
   * Primero busca en la colección de celulares, si no encuentra usa el valor en la asignación
   */
  const getTipoEquipoCelularActualizado = (asignacion) => {
    if (!asignacion || !asignacion.serialCelular) return asignacion?.tipoEquipoCelular || 'No especificado';
    
    const celularActualizado = getCelularActualizado(asignacion.serialCelular);
    if (celularActualizado && celularActualizado.tipoEquipo) {
      return celularActualizado.tipoEquipo;
    }
    return asignacion.tipoEquipoCelular || 'No especificado';
  };

  /**
   * Genera PDF para una asignación específica
   */
  const generatePDFForAsignacion = async (asignacion) => {
    if (!asignacion) return false;

    let pdfContainer = null;

    try {
      // Crear contenedor temporal para renderizar
      pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 210mm;
        height: 297mm;
        padding: 25.4mm 25.4mm 0 25.4mm;
        background: white;
        box-sizing: border-box;
        font-family: 'Kodchasan', sans-serif;
        margin: 0;
        position: absolute;
        left: -9999px;
        top: 0;
        display: block;
      `;

      // Renderizar el contenido de la asignación (mismo que printRef pero para otra asignación)
      const content = generatePDFContent(asignacion);
      pdfContainer.innerHTML = content;
      document.body.appendChild(pdfContainer);

      // Esperar a que carguen imágenes
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
          
          checkIfDone();
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(true);
            }
          }, 2000);
        });
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Capturar canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: pdfContainer.offsetWidth,
        windowHeight: pdfContainer.offsetHeight,
        timeout: 30000,
        imageTimeout: 30000,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vacío');
      }

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
        compress: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidthIn = 7.5;
      const imgHeightIn = imgWidthIn * canvasHeight / canvasWidth;

      if (imgHeightIn <= 10) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthIn, imgHeightIn);
      } else {
        let heightLeft = imgHeightIn;
        let position = 0;
        let pageNumber = 0;

        while (heightLeft > 0) {
          if (pageNumber > 0) {
            pdf.addPage();
          }

          const pageHeight = Math.min(10, heightLeft);
          const srcTop = (position / imgHeightIn) * canvasHeight;
          const srcHeight = (pageHeight / imgHeightIn) * canvasHeight;

          const srcCanvas = document.createElement('canvas');
          srcCanvas.width = canvasWidth;
          srcCanvas.height = srcHeight;
          
          const ctx = srcCanvas.getContext('2d');
          if (!ctx) throw new Error('No se pudo obtener contexto 2D');
          
          ctx.drawImage(
            canvas,
            0, srcTop,
            canvasWidth, srcHeight,
            0, srcTop,
            canvasWidth, srcHeight
          );

          const pageImgData = srcCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidthIn, pageHeight);

          heightLeft -= pageHeight;
          position += pageHeight;
          pageNumber++;
        }
      }

      // Guardar PDF
      const fileName = `FO-TEC-001 ${asignacion.nombre} ${asignacion.fechaEntrega || new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      return true;

    } catch (err) {
      console.error('Error generando PDF para', asignacion.nombre, ':', err);
      return false;
    } finally {
      if (pdfContainer && pdfContainer.parentNode) {
        document.body.removeChild(pdfContainer);
      }
    }
  };

  /**
   * Genera el contenido HTML del PDF (reutilizable)
   */
  const generatePDFContent = (asignacion) => {
    // Aquí va todo el contenido del PDF que está en printRef
    // Por ahora retornamos el HTML básico - se puede expandir
    return `
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="width: 25%; font-weight: bold; font-size: 12pt; border: 1.5px solid #000; padding: 6px 4px; text-align: center; font-family: 'Kodchasan', sans-serif;">
              <img src="${import.meta.env.BASE_URL}logo.png" alt="AUTOMÍA Logo" style="max-width: 100%; height: auto; max-height: 60px; display: block; margin: 0 auto;" />
            </td>
            <td style="width: 50%; text-align: center; font-weight: bold; font-size: 11pt; border: 1.5px solid #000; padding: 6px 4px; vertical-align: middle;">
              Formulario de Entrega de Equipos
            </td>
            <td style="width: 25%; border: 1.5px solid #000; padding: 4px; vertical-align: top; font-size: 7.5pt;">
              <div style="margin-bottom: 2px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Código:</span>
                <span>FO-TEC-001</span>
              </div>
              <div style="margin-bottom: 2px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Vigencia:</span>
                <span>06-jun-2025</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p style="text-align: center; font-weight: bold; margin: 20px 0;">
        ${asignacion.nombre} - ${asignacion.marca} ${asignacion.modelo}
      </p>
    `;
  };

  /**
   * Genera un único PDF unificado con todas las asignaciones seleccionadas
   */
  const generateUnifiedPDF = async () => {
    const toGenerate = Array.from(selectedIds).map(id => 
      asignaciones.find(a => a.id === id)
    ).filter(Boolean);

    if (toGenerate.length === 0) {
      alert('Selecciona al menos una asignación');
      return;
    }

    setGeneratingPdfs(true);
    const originalAsignacion = selectedAsignacion;

    try {
      // Crear contenedor unificado
      const unifiedContainer = document.createElement('div');
      unifiedContainer.style.cssText = `
        width: 100%;
        background: white;
        box-sizing: border-box;
        font-family: 'Kodchasan', sans-serif;
        margin: 0;
        position: absolute;
        left: -9999px;
        top: 0;
        display: block;
      `;
      
      document.body.appendChild(unifiedContainer);

      // Para cada asignación, generar el contenido
      for (let i = 0; i < toGenerate.length; i++) {
        const asignacion = toGenerate[i];
        
        // Actualizar selectedAsignacion
        setSelectedAsignacion(asignacion);
        
        // Esperar a que React renderice el cambio
        await new Promise(resolve => setTimeout(resolve, 600));

        // Crear contenedor para esta página
        if (printRef.current) {
          const pageContainer = document.createElement('div');
          pageContainer.style.cssText = `
            width: 210mm;
            padding: 25.4mm 25.4mm 0 25.4mm;
            background: white;
            box-sizing: border-box;
            font-family: 'Kodchasan', sans-serif;
            page-break-after: always;
          `;
          
          // Clonar el contenido del printRef
          const clone = printRef.current.cloneNode(true);
          pageContainer.appendChild(clone);
          unifiedContainer.appendChild(pageContainer);
        }
      }

      // Restaurar asignación original
      setSelectedAsignacion(originalAsignacion);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Esperar a que carguen imágenes
      const images = unifiedContainer.querySelectorAll('img');
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
          
          checkIfDone();
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(true);
            }
          }, 3000);
        });
      }

      // Capturar canvas de todo el contenedor
      const canvas = await html2canvas(unifiedContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 210,
        windowHeight: 297,
        timeout: 30000,
        imageTimeout: 30000,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vacío');
      }

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
        compress: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidthIn = 7.5;
      const imgHeightIn = imgWidthIn * canvasHeight / canvasWidth;

      // Agregar imagen al PDF con múltiples páginas si es necesario
      if (imgHeightIn <= 10) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthIn, imgHeightIn);
      } else {
        let heightLeft = imgHeightIn;
        let position = 0;
        let pageNumber = 0;

        while (heightLeft > 0) {
          if (pageNumber > 0) {
            pdf.addPage();
          }

          const pageHeight = Math.min(10, heightLeft);
          const srcTop = (position / imgHeightIn) * canvasHeight;
          const srcHeight = (pageHeight / imgHeightIn) * canvasHeight;

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
          pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidthIn, pageHeight);

          heightLeft -= pageHeight;
          position += pageHeight;
          pageNumber++;
        }
      }

      // Guardar PDF unificado
      const fileName = `FO-TEC-001_Hojas-Entrega_${toGenerate.length}_items_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert(`✓ PDF unificado descargado: ${toGenerate.length} hoja${toGenerate.length !== 1 ? 's' : ''} en 1 solo documento`);
      setSelectedIds(new Set()); // Limpiar selección

    } catch (error) {
      console.error('Error generando PDF unificado:', error);
      alert('Error al generar PDF: ' + error.message);
    } finally {
      // Limpiar contenedor
      try {
        const container = document.body.querySelector('div[style*="left: -9999px"]');
        if (container) {
          document.body.removeChild(container);
        }
      } catch (e) {}
      setGeneratingPdfs(false);
    }
  };

  /**
   * Imprime múltiples asignaciones en un único documento
   */
  const printMultipleUnified = async () => {
    const toPrint = Array.from(selectedIds).map(id => 
      asignaciones.find(a => a.id === id)
    ).filter(Boolean);

    if (toPrint.length === 0) {
      alert('Selecciona al menos una asignación');
      return;
    }

    // Abrir diálogo personalizado
    openConfirmDialog({
      title: '¿Imprimir hojas de entrega?',
      message: `Se abrirá un único documento con ${toPrint.length} hoja${toPrint.length !== 1 ? 's' : ''} de entrega para imprimir en una sola acción.`,
      confirmText: `Imprimir ${toPrint.length} Hoja${toPrint.length !== 1 ? 's' : ''}`,
      cancelText: 'Cancelar',
      isDangerous: false,
      onConfirm: () => executePrintMultiple(toPrint)
    });
  };

  /**
   * Ejecuta la impresión múltiple (después de confirmación)
   */
  const executePrintMultiple = async (toPrint) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    let htmlContent = `
      <html>
        <head>
          <title>Hojas de Entrega de Equipos</title>
          <style>
            @page {
              margin-top: 1in;
              margin-left: 1in;
              margin-right: 1in;
              margin-bottom: 0;
              size: letter portrait;
            }
            * {
              margin: 0;
              padding: 0;
              font-family: 'Kodchasan', sans-serif !important;
            }
            body { 
              font-family: 'Kodchasan', sans-serif !important; 
              background: #fff; 
              color: #000;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            table { border-collapse: collapse; width: 100%; }
            .page-break {
              page-break-after: always;
              break-after: always;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
    `;

    // Renderizar cada asignación en el HTML
    const originalAsignacion = selectedAsignacion;
    
    for (let i = 0; i < toPrint.length; i++) {
      const asignacion = toPrint[i];
      setSelectedAsignacion(asignacion);
      
      // Esperar a que se renderice (aumentado para asegurar renderización completa)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (printRef.current) {
        htmlContent += `<div class="page-break">${printRef.current.innerHTML}</div>`;
      }
    }

    // Restaurar asignación original
    setSelectedAsignacion(originalAsignacion);

    htmlContent += `
        </body>
      </html>
    `;

    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Esperar a que se carguen todas las imágenes
    const images = iframeDoc.querySelectorAll('img');
    let loadedImages = 0;
    let printCalled = false;
    
    const doPrint = () => {
      if (printCalled) return;
      printCalled = true;
      
      iframe.contentWindow.print();
      // Limpiar después de que se cierre el diálogo
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 100);
    };
    
    if (images.length === 0) {
      doPrint();
    } else {
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
      
      if (loadedImages === images.length) {
        doPrint();
      }
      
      setTimeout(() => {
        doPrint();
      }, 5000);
    }
  };

  /**
   * Genera PDF para la asignación seleccionada
   */
  const generatePDF = async () => {
    if (!selectedAsignacion) return;
    const success = await generatePDFForAsignacion(selectedAsignacion);
    if (!success) {
      alert('Error al generar PDF');
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`
       <html>
        <head>
          <title>Hoja de Entrega de Equipo</title>
          <style>
            @page {
              margin-top: 1in;
              margin-left: 1in;
              margin-right: 1in;
              margin-bottom: 0;
              size: letter portrait;
            }
            * {
              margin: 0;
              padding: 0;
              font-family: 'Kodchasan', sans-serif !important;
            }
            body { 
              font-family: 'Kodchasan', sans-serif !important; 
              background: #fff; 
              color: #000;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            table { border-collapse: collapse; width: 100%; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
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
      
      iframe.contentWindow.print();
      // Limpiar después de que se cierre el diálogo de impresión
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 100);
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
      
      // Verificar si ya están todas cargadas
      if (loadedImages === images.length) {
        doPrint();
      }
      
      // Fallback: si las imágenes no cargan después de 5 segundos, imprimir de todas formas
      setTimeout(() => {
        doPrint(); // Usar el flag en doPrint para evitar duplicados
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Diálogo de Confirmación Personalizado */}
      {showConfirmDialog && (
        <ConfirmDialog
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
          confirmText={confirmDialogConfig.confirmText}
          cancelText={confirmDialogConfig.cancelText}
          isDangerous={confirmDialogConfig.isDangerous}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}

      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Módulo de Hoja de Entrega</h1>
          <p className="text-gray-600 text-base">Genera y descarga hojas de entrega en PDF | Filtra por sucursal, puesto, marca, tipo | Descarga masiva con checkboxes</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panel de búsqueda y filtros */}
          <div className="lg:col-span-1">
            <div className="card-saas sticky top-24">
              {/* Búsqueda */}
              <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                <Icon name="SearchOutline" size="sm" color="#0ea5e9" /> Buscar
              </h2>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Por nombre o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Toggle Filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full mb-4 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="FunnelOutline" size="sm" color="#2563eb" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>

              {/* Panel de Filtros */}
              {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Sucursal</label>
                    <select
                      name="sucursal"
                      value={filtros.sucursal}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Todas</option>
                      {sucursalesUnicas.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Puesto</label>
                    <select
                      name="puesto"
                      value={filtros.puesto}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Todos</option>
                      {puestosUnicos.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Marca</label>
                    <select
                      name="marca"
                      value={filtros.marca}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Todas</option>
                      {marcasUnicas.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Tipo de Equipo</label>
                    <select
                      name="tipoEquipo"
                      value={filtros.tipoEquipo}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Todos</option>
                      {tiposUnicosEquipo.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Desde</label>
                    <input
                      type="date"
                      name="fechaInicio"
                      value={filtros.fechaInicio}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Hasta</label>
                    <input
                      type="date"
                      name="fechaFin"
                      value={filtros.fechaFin}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <button
                    onClick={handleLimpiarFiltros}
                    className="w-full px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )}

              {/* Info de resultados */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">
                  {filteredAsignaciones.length} asignación{filteredAsignaciones.length !== 1 ? 'es' : ''} encontrada{filteredAsignaciones.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Selección masiva */}
              {filteredAsignaciones.length > 0 && (
                <div className="mb-4 space-y-2 pb-4 border-b border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredAsignaciones.length && filteredAsignaciones.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {selectedIds.size === filteredAsignaciones.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </span>
                  </label>
                  {selectedIds.size > 0 && (
                    <p className="text-xs text-gray-600 px-2">
                      {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {loading && (
                <div className="p-4 text-center">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-200 border-t-blue-600"></div>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">Cargando...</p>
                </div>
              )}

              {/* Lista de asignaciones con checkboxes */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAsignaciones.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-4">No hay asignaciones disponibles</p>
                ) : (
                  filteredAsignaciones.map(asignacion => (
                    <div
                      key={asignacion.id}
                      className={`p-3 rounded-xl border-2 transition-colors ${
                        selectedAsignacion?.id === asignacion.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex gap-2 items-start">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(asignacion.id)}
                          onChange={() => handleToggleSelect(asignacion.id)}
                          className="w-4 h-4 rounded cursor-pointer mt-0.5"
                        />
                        <button
                          onClick={() => handleSelectAsignacion(asignacion)}
                          className="flex-1 text-left"
                        >
                          <p className="font-semibold text-gray-900 text-sm">{asignacion.nombre}</p>
                          <p className="text-xs text-gray-600">Usuario: {asignacion.usuario}</p>
                          <p className="text-xs text-gray-600">{asignacion.marca} {asignacion.modelo}</p>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botones de acción masiva */}
              {selectedIds.size > 0 && (
                <div className="mt-4 space-y-2 pb-4 border-t border-gray-200 pt-4">
                  <button
                    onClick={generateUnifiedPDF}
                    disabled={generatingPdfs}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="DownloadOutline" size="sm" color="white" />
                    {generatingPdfs ? 'Generando...' : `Descargar ${selectedIds.size} PDF${selectedIds.size !== 1 ? 's' : ''}`}
                  </button>
                  <button
                    onClick={printMultipleUnified}
                    disabled={generatingPdfs}
                    className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="PrintOutline" size="sm" color="#6b7280" />
                    Imprimir {selectedIds.size} {selectedIds.size !== 1 ? 'Hojas' : 'Hoja'}
                  </button>
                </div>
              )}

              {/* Botones para selección única */}
              {selectedAsignacion && selectedIds.size === 0 && (
                <div className="mt-4 space-y-2 pb-4 border-t border-gray-200 pt-4">
                  <button
                    onClick={generatePDF}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Icon name="DownloadOutline" size="sm" color="white" />
                    Descargar PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Icon name="PrintOutline" size="sm" color="#6b7280" />
                    Imprimir
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa del documento */}
          <div className="lg:col-span-3">
            {!selectedAsignacion ? (
              <div className="card-saas flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <Icon name="DocumentOutline" size="xl" color="#9ca3af" />
                  </div>
                  <p className="text-gray-600 text-lg">Selecciona una asignación para ver la hoja de entrega</p>
                </div>
              </div>
            ) : (
              <div className="print-preview-container">
                <div
                  ref={printRef}
                  className="a4-page"
                >
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
                        src={import.meta.env.BASE_URL + 'logo.png'} 
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
                      Formulario de Entrega de Equipos
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
                        <span>FO-TEC-001</span>
                      </div>
                      <div style={{ marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Vigencia:</span>
                        <span>06-jun-2025</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Página:</span>
                        <span>1 de 1</span>
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
                      {selectedAsignacion.asignadoPor || '___________________________________________'}
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

              {/* Datos del Colaborador */}
              <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', border: '1.5px solid #000000' }}>
                <tbody>
                  <tr>
                    <td style={{ 
                      backgroundColor: '#EB7A00',
                      color: '#ffffff',
                      padding: '5px',
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
                            <td style={{ fontWeight: 'bold',
                              fontSize: '9pt',
                              borderBottom: '1px solid #000000',
                              padding: '4px'
                            }}>
                              {selectedAsignacion.empresa || 'AUTOMÍA SAS'}
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
                              {selectedAsignacion.nombre || '___________________________________________'}
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
                              {selectedAsignacion.puesto || '___________________________________________'}
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
                              {selectedAsignacion.sucursal || '___________________________________________'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Descripción del Equipo */}
              
              <div style={{ backgroundColor: '#EB7A00', color: '#ffffff', padding: '5px', fontWeight: 'bold', fontSize: '9pt', border: '1.5px solid #000000', fontFamily: "'Kodchasan', sans-serif !important" }}>
                Descripción del Equipo
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', marginBottom: '20px', tableLayout: 'fixed' }}>
                <tbody style={{ fontSize: '8.5px' }}>
                  <tr style={{ display: 'table-row' }}>
                    {/* LÓGICA: Determinar qué equipos mostrar */}
                    {selectedAsignacion.sn && selectedAsignacion.snSecundario ? (
                      // Caso 1: Equipo Primario + Equipo Secundario - mostrar ambos
                      <>
                        <td style={{ borderRight: '1px solid #000', verticalAlign: 'top', padding: 0, width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', padding: '2px' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.condicion}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.tipoEquipo || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.sn}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.marca}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.modelo}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Especificaciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(8, 8, 8, 1)' }}>{selectedAsignacion.especificaciones || `${selectedAsignacion.disco}, ${selectedAsignacion.memoria}, ${selectedAsignacion.procesador}`.replace(/undefined/g, '').trim()}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Código Activo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.codActivoFijo}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Fecha de Entrega:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.fechaAsignacion}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '0px', width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ width: '60%', padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                  {selectedAsignacion.condicionSecundario}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoSecundario || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.snSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Especificaciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{`${selectedAsignacion.discoSecundario || ''}, ${selectedAsignacion.memoriaSecundario || ''}, ${selectedAsignacion.procesadorSecundario || ''}`.replace(/undefined|, , |,  |^,|,$/g, '').trim() || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Código Activo:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.codActivoFijoSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Fecha de Entrega:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.fechaAsignacionSecundario || selectedAsignacion.fechaAsignacion}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </>
                    ) : selectedAsignacion.snSecundario && selectedAsignacion.serialCelular ? (
                      // Caso 2: Equipo Secundario + Celular - mostrar solo estos dos
                      <>
                        <td style={{ borderRight: '1px solid #000', verticalAlign: 'top', padding: 0, width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', padding: '2px' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                  {selectedAsignacion.condicionSecundario}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoSecundario || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.snSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Especificaciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{`${selectedAsignacion.discoSecundario || ''}, ${selectedAsignacion.memoriaSecundario || ''}, ${selectedAsignacion.procesadorSecundario || ''}`.replace(/undefined|, , |,  |^,|,$/g, '').trim() || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Código Activo:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.codActivoFijoSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Fecha de Entrega:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.fechaAsignacionSecundario || selectedAsignacion.fechaAsignacion}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '0px', width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ width: '60%', padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                  {selectedAsignacion.condicionCelular}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{getTipoEquipoCelularActualizado(selectedAsignacion)}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Restricción:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.restriccionCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.serialCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>IMEI:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.imeiCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Número:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.numeroCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Plan:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.planCelular}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </>
                    ) : selectedAsignacion.sn ? (
                      // Caso 3: Solo Equipo Primario
                      <>
                        <td style={{ borderRight: '1px solid #000', verticalAlign: 'top', padding: 0, width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', padding: '2px' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.condicion}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.tipoEquipo || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.sn}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.marca}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.modelo}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Especificaciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(8, 8, 8, 1)' }}>{selectedAsignacion.especificaciones || `${selectedAsignacion.disco}, ${selectedAsignacion.memoria}, ${selectedAsignacion.procesador}`.replace(/undefined/g, '').trim()}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Código Activo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>{selectedAsignacion.codActivoFijo}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Fecha de Entrega:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.fechaAsignacion}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '0px', width: '50%', height: '100%' }}>
                          {selectedAsignacion.serialCelular ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody style={{ fontSize: '12px' }}>
                                <tr>
                                  <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                  <td style={{ width: '60%', padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                    {selectedAsignacion.condicionCelular}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{getTipoEquipoCelularActualizado(selectedAsignacion)}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Restricción:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.restriccionCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.serialCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>IMEI:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.imeiCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Número:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.numeroCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700 }}>Plan:</td>
                                  <td style={{ padding: '2px' }}>{selectedAsignacion.planCelular}</td>
                                </tr>
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ padding: '2px', textAlign: 'center', color: '#999' }}>Sin datos</div>
                          )}
                        </td>
                      </>
                    ) : selectedAsignacion.snSecundario ? (
                      // Caso 4: Solo Equipo Secundario
                      <>
                        <td style={{ borderRight: '1px solid #000', verticalAlign: 'top', padding: 0, width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', padding: '2px' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                  {selectedAsignacion.condicionSecundario}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoSecundario || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.snSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Especificaciones:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{`${selectedAsignacion.discoSecundario || ''}, ${selectedAsignacion.memoriaSecundario || ''}, ${selectedAsignacion.procesadorSecundario || ''}`.replace(/undefined|, , |,  |^,|,$/g, '').trim() || 'No especificado'}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Código Activo:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.codActivoFijoSecundario}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Fecha de Entrega:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.fechaAsignacionSecundario || selectedAsignacion.fechaAsignacion}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '0px', width: '50%', height: '100%' }}>
                          {selectedAsignacion.serialCelular ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody style={{ fontSize: '12px' }}>
                                <tr>
                                  <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                  <td style={{ width: '60%', padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                    {selectedAsignacion.condicionCelular}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{getTipoEquipoCelularActualizado(selectedAsignacion)}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Restricción:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.restriccionCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.serialCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>IMEI:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.imeiCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Número:</td>
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.numeroCelular}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '2px', fontWeight: 700 }}>Plan:</td>
                                  <td style={{ padding: '2px' }}>{selectedAsignacion.planCelular}</td>
                                </tr>
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ padding: '2px', textAlign: 'center', color: '#999' }}>Sin datos</div>
                          )}
                        </td>
                      </>
                    ) : selectedAsignacion.serialCelular ? (
                      // Caso 5: Solo Celular
                      <>
                        <td style={{ borderRight: '1px solid #000', verticalAlign: 'top', padding: 0, width: '50%', height: '100%' }}>
                          <div style={{ padding: '2px', textAlign: 'center', color: '#999' }}>Sin datos</div>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '0px', width: '50%', height: '100%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody style={{ fontSize: '12px' }}>
                              <tr>
                                <td style={{ width: '40%', padding: '2px', fontWeight: 700, borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>Condiciones:</td>
                                <td style={{ width: '60%', padding: '2px', borderBottom: '1px solid rgba(0, 0, 0, 1)' }}>
                                  {selectedAsignacion.condicionCelular}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Tipo de Equipo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{getTipoEquipoCelularActualizado(selectedAsignacion)}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Restricción:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.restriccionCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Serial:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.serialCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Marca:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.marcaCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Modelo:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.modeloCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>IMEI:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.imeiCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700, borderBottom: '1px solid #000000ff' }}>Número:</td>
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.numeroCelular}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '2px', fontWeight: 700 }}>Plan:</td>
                                <td style={{ padding: '2px' }}>{selectedAsignacion.planCelular}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </>
                    ) : (
                      // Caso 6: Sin datos
                      <>
                        <td style={{ borderRight: '1px solid #000', verticalAlign: 'top', padding: 0, width: '50%', height: '100%' }}>
                          <div style={{ padding: '2px', textAlign: 'center', color: '#999' }}>Sin datos</div>
                        </td>
                        <td style={{ verticalAlign: 'top', padding: '0px', width: '50%', height: '100%' }}>
                          <div style={{ padding: '2px', textAlign: 'center', color: '#999' }}>Sin datos</div>
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>

              {/* Observaciones */}
              <div style={{ backgroundColor: '#EB7A00', color: '#ffffff', padding: '5px', fontWeight: 'bold', fontSize: '9pt', border: '1.5px solid #000000', fontFamily: "'Kodchasan', sans-serif !important" }}>
                Observaciones:
              </div>

              <div style={{ border: '1px solid #000', padding: '5px', minHeight: '35px', marginBottom: '20px', fontSize: '12px' }}>
                <p style={{ margin: 0 }}>• {selectedAsignacion.observaciones || `Entrega de ${selectedAsignacion.marca} ${selectedAsignacion.modelo} con su cargador original y mochila.`}</p>
              </div>

              {/* Datos de quién realiza la entrega */}
              <div style={{ backgroundColor: '#EB7A00', color: '#ffffff', padding: '5px', fontWeight: 'bold', fontSize: '9pt', border: '1.5px solid #000000', fontFamily: "'Kodchasan', sans-serif !important" }}>
                Datos de quién realiza la entrega
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', marginBottom: '8px' }}>
                <tbody style={{ fontSize: '12px' }}>
                  <tr>
                    <td style={{ width: '15%', background: 'rgba(255, 255, 255, 1)', padding: '3px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 700 }}>Nombre:</td>
                    <td style={{ width: '60%', padding: '3px', borderRight: '1px solid #000', borderBottom: '1px solid #000' }}>{selectedAsignacion.nombreEntrega || currentUser?.displayName || currentUser?.email}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '15%', background: 'rgba(255, 255, 255, 1)', padding: '3px', borderRight: '1px solid #000', fontWeight: 700 }}>Fecha de entrega:</td>
                    <td style={{ width: '60%', padding: '3px', borderRight: '1px solid #000' }}>{selectedAsignacion.fechaEntrega || selectedAsignacion.fechaAsignacion}</td>
                  </tr>
                </tbody>
              </table>

              {/* Firmas */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '33%', textAlign: 'center', paddingTop: '10px' }}>
                      <div style={{ borderTop: '1px solid #000', margin: '0 auto', width: '80%', height: '8px' }} />
                      <div style={{ fontWeight: 'bold', fontSize: '9pt', marginTop: '4px', fontFamily: "'Kodchasan', sans-serif !important" }}>Firma del Colaborador</div>
                    </td>
                     <td style={{ width: '33%', textAlign: 'center', paddingTop: '200px' }}>
                      <div style={{ borderTop: '1px solid #000', margin: '0 auto', width: '90%', height: '8px' }} />
                      <div style={{ fontWeight: 'bold', fontSize: '9pt', marginTop: '4px', fontFamily: "'Kodchasan', sans-serif !important" }}>Coordinador de TI y Proyectos</div>
                    </td>
                    <td style={{ width: '33%', textAlign: 'center', paddingTop: '10px' }}>
                      <div style={{ borderTop: '1px solid #000', margin: '0 auto', width: '80%', height: '8px' }} />
                      <div style={{ fontWeight: 'bold', fontSize: '9pt', marginTop: '4px', fontFamily: "'Kodchasan', sans-serif !important" }}>Firma Supervisor/a</div>
                    </td>
                   
                  </tr>
                </tbody>
              </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
