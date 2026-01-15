import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function HojaEntrega() {
  const { currentUser, userPermissions } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [tipoEquipo, setTipoEquipo] = useState('laptop');
  const printRef = useRef();

  useEffect(() => {
    // Usar listener en tiempo real en lugar de getDocs
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
    
    return () => unsubscribe(); // Limpiar listener al desmontar
  }, [selectedAsignacion?.id]);

  const filteredAsignaciones = asignaciones.filter(a =>
    (a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.usuario || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAsignacion = (asignacion) => {
    // Buscar la asignación actualizada en el array de asignaciones completo
    // para asegurar que tenemos los datos más recientes
    const asignacionActualizada = asignaciones.find(a => a.id === asignacion.id) || asignacion;
    setSelectedAsignacion(asignacionActualizada);
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
   * Genera PDF para A4 con márgenes personalizados - exactamente como la vista previa
   */
  const generatePDF = async () => {
    if (!printRef.current) return;

    let pdfContainer = null;

    try {
      // Crear un contenedor que simule la página Letter (8.5x11) con márgenes de 1"
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
      pdfContainer.innerHTML = printRef.current.innerHTML;
      document.body.appendChild(pdfContainer);

      // Esperar a que se renderize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Capturar con escala 100%
      const canvas = await html2canvas(pdfContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        windowWidth: pdfContainer.offsetWidth,
        windowHeight: pdfContainer.offsetHeight,
        timeout: 30000,
        imageTimeout: 30000,
        removeContainer: false,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vacío o inválido. Ancho: ' + canvas.width + ', Alto: ' + canvas.height);
      }

      console.log('Canvas capturado:', { width: canvas.width, height: canvas.height });

      // Crear PDF Letter
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
        compress: false,
      });

      // Usar JPEG
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (!imgData || imgData.length < 500) {
        throw new Error('Datos de imagen inválidos. Tamaño: ' + (imgData ? imgData.length : 0));
      }

      console.log('Imagen JPEG generada:', imgData.length + ' bytes');

      // Dimensiones
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidthIn = 7.5;
      const imgHeightIn = imgWidthIn * canvasHeight / canvasWidth;

      // Agregar imagen al PDF
      if (imgHeightIn <= 10) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthIn, imgHeightIn);
      } else {
        // Si no cabe en una página, paginar
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

      // Guardar PDF
      const fileName = selectedAsignacion
        ? `FO-TEC-001 Formulario de Entrega de ${selectedAsignacion.nombre} ${selectedAsignacion.fechaEntrega || new Date().toISOString().split('T')[0]}.pdf`
        : 'FO-TEC-001 Formulario de Entrega.pdf';

      pdf.save(fileName);
      console.log('PDF guardado:', fileName);

    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar PDF: ' + err.message);
    } finally {
      // Limpiar siempre
      if (pdfContainer && pdfContainer.parentNode) {
        document.body.removeChild(pdfContainer);
      }
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
    
    const doPrint = () => {
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
      
      // Fallback: si las imágenes no cargan después de 3 segundos, imprimir de todas formas
      setTimeout(() => {
        if (loadedImages < images.length) {
          doPrint();
        }
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-manrope mb-2">Módulo de Hoja de Entrega</h1>
          <p className="text-gray-600 text-base">Genera y descarga hojas de entrega de equipos en PDF</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de búsqueda */}
          <div className="lg:col-span-1">
            <div className="card-saas sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4 flex items-center gap-3">
                <Icon name="SearchOutline" size="sm" color="#0ea5e9" /> Seleccionar Asignación
              </h2>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {loading && (
                <div className="p-4 text-center">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-200 border-t-blue-600"></div>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">Cargando...</p>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAsignaciones.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-4">No hay asignaciones disponibles</p>
                ) : (
                  filteredAsignaciones.map(asignacion => (
                    <button
                      key={asignacion.id}
                      onClick={() => handleSelectAsignacion(asignacion)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                        selectedAsignacion?.id === asignacion.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{asignacion.nombre}</p>
                      <p className="text-xs text-gray-600">Usuario: {asignacion.usuario}</p>
                      <p className="text-xs text-gray-600">{asignacion.marca} {asignacion.modelo}</p>
                    </button>
                  ))
                )}
              </div>

              {selectedAsignacion && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={generatePDF}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Icon name="CloudDownloadOutline" size="sm" color="white" />
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
          <div className="lg:col-span-2">
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
                        src="https://www.dropbox.com/scl/fi/5du7bzgz607gtzl0puo7w/Logotipo_Autom-aeslogan-mueve-tu-mundo-ahora.png?rlkey=qgl1ljzqex8tfk7p4fivgu32k&st=68jij2ts&dl=1" 
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
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoCelular || 'No especificado'}</td>
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
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoCelular || 'No especificado'}</td>
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
                                  <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoCelular || 'No especificado'}</td>
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
                                <td style={{ padding: '2px', borderBottom: '1px solid #000000ff' }}>{selectedAsignacion.tipoEquipoCelular || 'No especificado'}</td>
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