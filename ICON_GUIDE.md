// GUÍA DE USO - React Icons en la Aplicación

/*
================================================================================
                         SISTEMA DE ICONOS PROFESIONAL
================================================================================

Se ha integrado React Icons v5.0.1 con estilos iOS/SF Symbols en toda la 
aplicación. Todos los módulos ahora usan iconos profesionales y consistentes.

================================================================================
                         CÓMO USAR LOS ICONOS
================================================================================

1. IMPORTAR EL COMPONENTE Icon:
   ────────────────────────────────────────────────────────────────────────
   import Icon from '../components/Icon';

2. USAR EL COMPONENTE:
   ────────────────────────────────────────────────────────────────────────
   <Icon 
     name="HomeOutline"        // Nombre del icono (sin el prefijo "Io")
     size="md"                 // Tamaño: xs, sm, md, lg, xl
     color="primary"           // Color: primary, success, warning, error, info, neutral, o hex directo
     className="..."           // Clases CSS adicionales (opcional)
     style={{...}}             // Estilos inline (opcional)
   />

3. EJEMPLOS DE USO:
   ────────────────────────────────────────────────────────────────────────
   
   // Icono simple
   <Icon name="MenuOutline" size="md" color="neutral" />
   
   // Con color personalizado
   <Icon name="LaptopOutline" size="lg" color="#3b82f6" />
   
   // Con estilos adicionales
   <Icon name="CheckmarkCircleOutline" size="md" color="success" className="hover:text-green-600" />
   
   // Icono en botón
   <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
     <Icon name="AddOutline" size="sm" color="white" />
     Agregar
   </button>

================================================================================
                         ICONOS DISPONIBLES
================================================================================

NAVEGACIÓN Y MENÚ:
  • MenuOutline          - Menú hamburguesa
  • CloseOutline         - Cerrar/cancelar
  • GridOutline          - Dashboard
  • SettingsOutline      - Configuración

EQUIPOS:
  • LaptopOutline        - Computadora
  • DesktopOutline       - Escritorio
  • PhonePortraitOutline - Teléfono
  • TabletPortraitOutline- Tablet
  • BoxOutline           - Paquete/equipo

ACCIONES:
  • AddOutline           - Agregar/crear
  • PencilOutline        - Editar
  • TrashOutline         - Eliminar
  • CheckmarkOutline     - Confirmar/guardar
  • CloseOutline         - Cancelar
  • DownloadOutline      - Descargar
  • UploadOutline        - Cargar
  • PrintOutline         - Imprimir
  • SearchOutline        - Buscar
  • FunnelOutline        - Filtrar

ASIGNACIONES:
  • PersonOutline        - Usuario individual
  • PeopleOutline        - Múltiples usuarios
  • LinkOutline          - Asignar/vincular
  • ArrowRedoOutline     - Devolver/retornar

ESTADOS:
  • CheckmarkCircleOutline   - Confirmado/disponible
  • AlertCircleOutline       - Alerta
  • InformationCircleOutline - Información
  • CloseCircleOutline       - Error
  • WarningOutline           - Advertencia

DOCUMENTOS:
  • DocumentOutline      - Documento genérico
  • DocumentTextOutline  - Documento con texto
  • BarChartOutline      - Reporte/gráfica

NAVEGACIÓN:
  • ChevronForwardOutline - Siguiente/expandir
  • ChevronBackOutline    - Anterior
  • ChevronUpOutline      - Arriba
  • ChevronDownOutline    - Abajo

OTROS:
  • CalendarOutline      - Calendario/fecha
  • TimeOutline          - Reloj/hora
  • LocationOutline      - Ubicación
  • EyeOutline           - Ver
  • EyeOffOutline        - Ocultar
  • ExpandOutline        - Expandir

================================================================================
                         COLORES PREDEFINIDOS
================================================================================

COLORES DISPONIBLES (nombres):
  • primary              - Azul principal (#003399)
  • success              - Verde (#10b981)
  • warning              - Naranja (#f59e0b)
  • error                - Rojo (#ef4444)
  • info                 - Azul claro (#3b82f6)
  • neutral              - Gris (#6b7280)

EJEMPLO - Usar colores por nombre:
  <Icon name="CheckmarkCircleOutline" color="success" />

EJEMPLO - Usar color hexadecimal directo:
  <Icon name="LaptopOutline" color="#ff6b6b" />

================================================================================
                         TAMAÑOS DISPONIBLES
================================================================================

  • xs = 16px
  • sm = 20px
  • md = 24px (DEFAULT)
  • lg = 32px
  • xl = 40px

================================================================================
                         APLICACIÓN ACTUAL
================================================================================

✅ NAVBAR.jsx
   - Menú hamburguesa con icono MenuOutline/CloseOutline
   - Links de navegación con iconos específicos

✅ DASHBOARD.jsx
   - Tarjetas de estadísticas con iconos grandes
   - Botones de acciones rápidas con iconos
   - Secciones de información con iconos

✅ READY PARA ACTUALIZAR:
   - Equipos.jsx
   - Celulares.jsx
   - Asignacion.jsx
   - Descargo.jsx
   - EquiposDisponibles.jsx
   - Y otros módulos...

================================================================================
                         PRÓXIMOS PASOS
================================================================================

1. Actualizar botones en páginas de equipos con AddOutline, EditOutline, etc.
2. Reemplazar emojis en formularios con iconos profesionales
3. Agregar iconos en validaciones y estados de error
4. Usar iconos en tablas de datos para acciones
5. Implementar iconos en notificaciones Toast

================================================================================
*/
