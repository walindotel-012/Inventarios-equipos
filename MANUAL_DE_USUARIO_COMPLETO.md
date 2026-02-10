# 📘 Manual de Usuario - Sistema de Inventario de Equipos

## Tabla de Contenidos
1. [Introducción General](#introducción-general)
2. [Características Principales](#características-principales)
3. [Guía de Autenticación](#guía-de-autenticación)
4. [Dashboard](#dashboard)
5. [Módulo de Equipos](#módulo-de-equipos)
6. [Módulo de Celulares](#módulo-de-celulares)
7. [Módulo de Nomenclaturas](#módulo-de-nomenclaturas)
8. [Módulo de Asignaciones](#módulo-de-asignaciones)
9. [Módulo de Accesorios](#módulo-de-accesorios)
10. [Equipos Disponibles](#equipos-disponibles)
11. [Hoja de Entrega](#hoja-de-entrega)
12. [Descargos](#descargos)
13. [Bitácora de Auditoría](#bitácora-de-auditoría)
14. [Administración de Permisos](#administración-de-permisos)
15. [Automatizaciones](#automatizaciones)
16. [Ahorro de Tiempo](#ahorro-de-tiempo)
17. [Tips y Trucos](#tips-y-trucos)

---

## Introducción General

El **Sistema de Inventario de Equipos** es una plataforma web moderna y responsiva diseñada para gestionar eficientemente todos los equipos de tecnología de tu organización (laptops, computadoras, celulares, monitores, impresoras, etc.).

### ¿Para qué sirve?
- **Controlar el inventario** de todos los equipos tecnológicos
- **Registrar asignaciones** de equipos a empleados
- **Generar documentación** de entrega y descargo
- **Rastrear el ciclo de vida** de los equipos
- **Mantener un historial** de todas las operaciones
- **Gestionar nomenclaturas** y códigos NetBios
- **Controlar disponibilidad** de equipos

### Ventajas Principales
✅ **Acceso centralizado**: Todos los datos en un solo lugar  
✅ **Interfaz intuitiva**: Diseño moderno y fácil de usar  
✅ **Búsqueda rápida**: Encuentra equipos por serial, código, marca o modelo instantáneamente  
✅ **Generación automática de códigos**: Los códigos de activo fijo se crean automáticamente  
✅ **PDF automáticos**: Genera hojas de entrega y descargos listos para imprimir  
✅ **Historial completo**: Registra quién hizo qué y cuándo  
✅ **Sin sincronización manual**: Los cambios se actualizan en tiempo real  
✅ **Control de permisos**: Solo los usuarios autorizados ven ciertos módulos  

---

## Características Principales

### 1. **Gestión de Equipos** 💻
- Registrar nuevos equipos (laptops, CPUs, monitores, etc.)
- Organizar por marca, modelo, especificaciones
- Rastrear número de serie, disco duro, memoria RAM
- Estado del equipo (nuevo/usado)
- Importación masiva desde Excel
- Exportación de listados completos

### 2. **Gestión de Celulares** 📱
- Registrar dispositivos móviles con IMEI y serial
- Especificar tipo (FLOTA o ESIM)
- Planes asociados
- Restricción de uso
- Importación masiva

### 3. **Nomenclaturas** 🏷️
- Crear NetBios Names (máximo 14 caracteres)
- Validación automática de duplicados
- Nomenclaturas disponibles para asignación
- Importación masiva

### 4. **Asignaciones** 🔗
- Asignar equipos a empleados
- Vincular múltiples equipos por persona
- Registrar información de sucursal, puesto, usuario Windows
- Equipo principal y equipo secundario
- Celular asignado
- Accesorios vinculados
- Generación automática de hojas de entrega

### 5. **Accesorios** 🎧
- Controlar periféricos (mouse, teclado, headset, etc.)
- Vinculación a asignaciones
- Generación automática de códigos ATM-ACC-####

### 6. **Equipos Disponibles** ✅
- Vista centralizada de equipos sin asignar
- Filtrado por tipo y modelo
- Búsqueda por serial o código
- Exportación de disponibles

### 7. **Hojas de Entrega** 📄
- PDF profesionales con datos de empleado y equipos
- Formatos personalizados por tipo de equipo
- Firmas digitales
- Listo para imprimir

### 8. **Descargos** 🗑️
- Registrar devolución de equipos
- Estado final del equipo
- Observaciones de condición
- PDF de descargo
- Histórico de descargos

### 9. **Bitácora de Auditoría** 📊
- Registro completo de todas las operaciones
- Filtrado por módulo, acción, usuario, fecha
- Exportación de reportes
- Trazabilidad total

### 10. **Control de Acceso** 🔐
- Sistema de permisos granular
- Designar roles de administrador
- Controlar acceso a cada módulo
- Auditoría de cambios de permisos

---

## Guía de Autenticación

### Primer Acceso
1. Ve a la aplicación
2. Haz clic en "Iniciar sesión con Google"
3. Selecciona tu cuenta de Google
4. ✓ Ingresarás automáticamente si tienes permisos

### Permisos Necesarios
- El **administrador** debe configurar tus permisos primero en "Admin de Permisos"
- Si ves la pantalla de login pero no puedes ingresar, contacta al administrador

### Cerrar Sesión
- Haz clic en tu foto de perfil (arriba a la derecha)
- Selecciona "Cerrar sesión"

---

## Dashboard

Tu puerta de entrada a la aplicación. El dashboard muestra un resumen visual de:

### Tarjetas de Información
**Equipos**
- Total de computadoras registradas
- Haz clic para ir al módulo Equipos

**Celulares**
- Total de dispositivos móviles
- Haz clic para ir al módulo Celulares

**Nomenclaturas**
- Total de NetBios Names registrados

**Asignaciones**
- Total de asignaciones realizadas
- Haz clic para ver todas las asignaciones

**Accesorios**
- Total de periféricos en inventario

**Disponibles**
- Equipos y celulares sin asignar
- Vista rápida
- Haz clic para ver el detalle

**Hojas de Entrega**
- Total generado
- Accede al módulo

**Descargos**
- Total de devoluciones registradas

### Botones de Acción
- **Nuevo Equipo**: Abre el formulario para registrar equipo rápidamente
- **Nueva Asignación**: Crea una asignación nueva directamente
- **Limpiar Base de Datos**: ⚠️ Elimina todos los datos (solo admin, con confirmación)

### Actualización en Tiempo Real
El dashboard **se actualiza automáticamente** cuando cambias de pestaña del navegador o vuelves a la aplicación. No necesitas refrescar manualmente.

---

## Módulo de Equipos

### ¿Qué es?
Aquí registras toda computadora, monitor, impresora, router, etc. que ingrese a tu inventario.

### Campos del Formulario
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Código de Activo Fijo** | Se genera automáticamente | ATM-EQ-001 |
| **Tipo de Equipo** | Categoría (Laptop, Monitor, CPU, etc.) | Laptop |
| **Marca** | Fabricante | Lenovo, Dell, HP |
| **Modelo** | Modelo exacto | ThinkPad E15 |
| **Serial / S/N** | Número de serie único | ABC123DEF456 |
| **Disco Duro** | Capacidad almacenamiento | 512 GB, 1 TB, 2 TB |
| **Memoria RAM** | Capacidad de memoria | 8 GB, 16 GB, 32 GB, 64 GB |
| **Procesador** | Tipo y generación | Intel i7 10ª Gen |
| **Sistema Operativo** | SO instalado | Windows 10, Windows 11 |
| **Licencia** | Licencia asociada | Microsoft Office 2021 |
| **Condición** | Estado al registro | Nuevo, Usado |

### Pasos para Registrar un Equipo

**Opción 1: Desde el Dashboard**
1. Haz clic en "Nuevo Equipo" en Dashboard
2. Completa los campos
3. Haz clic en "Guardar Equipo"

**Opción 2: Desde el Módulo de Equipos**
1. Ve a "Equipos" en el menú
2. Haz clic en "Nuevo Equipo"
3. Completa los campos
4. Haz clic en "Guardar Equipo"

### Búsqueda y Filtros
- **Búsqueda general**: Escribe en la barra de búsqueda. Busca en serial, código y modelo
- **Filtros específicos**: Filtra por Tipo, Marca, Modelo, Condición
- Los campos se auto-completan con opciones existentes
- Puedes crear tipos y marcas nuevas

### Editar un Equipo
1. Encuentra el equipo en la tabla
2. Haz clic en el ícono de editar (lápiz)
3. Actualiza los campos necesarios
4. Haz clic en "Actualizar"

### Eliminar un Equipo
1. Haz clic en el ícono de papelera
2. Confirma la eliminación
3. ⚠️ Se requiere confirmación porque es irreversible

### Importación Masiva de Excel

**Este es uno de los mayores ahorros de tiempo**

1. Haz clic en "Importar Equipos"
2. Pega los datos en el formato correcto (columnas separadas por tabulaciones):
   ```
   codActivoFijo | marca | modelo | sn | disco | memoria | procesador | so | licencia | tipoEquipo | condicion
   ATM-EQ-001    | Dell  | 5480   | ABC123 | 512 GB | 16 GB | Intel i7 | Windows 10 | Office | Laptop | Nuevo
   ```
3. Haz clic en "Importar"
4. ✓ Todos los equipos se crean en segundos

### Exportación a Excel
1. Haz clic en "Exportar a Excel"
2. Se descarga un archivo .xlsx con todos los equipos
3. Puedes editarlo localmente y volver a importar

---

## Módulo de Celulares

### ¿Qué es?
Gestiona dispositivos móviles, números, planes y restricciones.

### Campos Principales
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Tipo de Equipo** | FLOTA (empresa) o ESIM | FLOTA |
| **Serial** | Número de serie unívoco | A1B2C3D4 |
| **IMEI** | Código internacional | 358839075643801 |
| **Marca** | Fabricante | Apple, Samsung |
| **Modelo** | Modelo exacto | iPhone 12 Pro |
| **Número** | Teléfono | +57 3001234567 |
| **Restricción** | Tipo de restricción | Abierta, Cerrada, Abierta LDI |
| **Plan** | Plan contratado | 10 GB Plus con bloqueo |
| **Condición** | Estado | Nuevo, Usado, Personal-ESIM |

### Registrar Celular
1. Ve a "Celulares"
2. Haz clic en "Nuevo Celular"
3. Completa todos los campos
4. Haz clic en "Guardar Celular"

### Búsqueda y Filtros
- Filtra por Serial, IMEI, Marca, Modelo, Número
- Filtros por Condición y Restricción
- Búsqueda rápida en tiempo real

### Importación Masiva
Similar a Equipos:
1. Haz clic en "Importar Celulares"
2. Pega los datos tabulados
3. Importa y listo

---

## Módulo de Nomenclaturas

### ¿Qué es?
Las nomenclaturas son los **NetBios Names** (nombres de computadora en red de Windows). Máximo 14 caracteres.

### Ejemplos Válidos
- ATMAUDIT
- ATM-USER01
- WS-OFICINA01

### Crear Nomenclatura
1. Ve a "Nomenclaturas"
2. Haz clic en "Nueva Nomenclatura"
3. Escribe el nombre (máx 14 caracteres)
4. Haz clic en "Guardar"

### Validaciones Automáticas
✓ No permite más de 14 caracteres  
✓ Previene duplicados automáticamente  
✓ Convierte a mayúsculas automáticamente  

### Editar y Eliminar
- **Editar**: Haz clic en el ícono de lápiz, actualiza, guarda
- **Eliminar**: Haz clic en papelera, confirma

### Búsqueda
- Escribe cualquier parte del nombre para filtrar

### Importación Masiva
1. Haz clic en "Importar Nomenclaturas"
2. Pega una nomenclatura por línea
3. Importa

---

## Módulo de Asignaciones

### ¿Qué es?
Las **asignaciones**
 vinculan equipos, celulares y accesorios a un empleado específico. Es el corazón del sistema.

### Información de Empleado
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Sucursal** | Ubicación | Barranquilla, Bogotá |
| **Oficina** | Departamento | Gerencia, Soporte IT |
| **Puesto** | Cargo | Gerente General, Técnico |
| **Nombre Completo** | Nombre del empleado | Juan Pérez García |
| **Usuario Windows** | Usuario de dominio | jperez |
| **Empresa** | Por defecto AUTOMÍA SAS | AUTOMÍA SAS |

### Equipo Principal
| Campo | Descripción |
|-------|-------------|
| Equipo | Selecciona de lista (auto-completa) |
| Código de Activo Fijo | Se auto-llena |
| NetBios Name | Nomenclatura de red |
| Marca, Modelo, Serial | Se auto-completan |
| Especificaciones | Se auto-llenan |
| Condición | Estado ahora |
| Fecha de Asignación | Cuándo se entregó |

### Equipo Secundario (Opcional)
- Igual que equipo principal
- Útil para varias laptops o monitores
- Completamente opcional

### Celular (Opcional)
- Selecciona celular disponible
- Se auto-completan especificaciones

### Accesorios (Opcional)
- Vincula periféricos (mouse, teclado, headset)
- Puedes agregar múltiples accesorios

### Pasos para Crear Asignación

**Método 1: Búsqueda por Equipo**
1. Ve a "Asignaciones"
2. Haz clic en "Nueva Asignación"
3. Comienza escribiendo el serial del equipo en "Búsqueda por Serial"
4. El formulario se **auto-completa automáticamente** ✨
5. Agrega datos del empleado
6. Clickea "Guardar Asignación"

**Método 2: Búsqueda por Nombre**
1. Escribe el nombre del empleado en "Búsqueda por Nombre"
2. Continúa con el equipo
3. Guarda

### Auto-completado Inteligente ⚡
Esta es una de las mayores **automatizaciones claves**:

1. **Escribes el serial del equipo** → El sistema:
   - Localiza el equipo automáticamente
   - Completa código de activo fijo
   - Completa marca, modelo, especificaciones
   - Marca como "asignado"

2. **Cambias el equipo** → El sistema actualiza automáticamente todo

3. **Escribes el NetBios** → Auto-completa al cambiar equipo

### Búsqueda Rápida de Asignaciones
- **Búsqueda por Serial**: Encuentra por número de serie del equipo
- **Búsqueda por Nombre**: Encuentra por nombre de empleado
- **Búsqueda por Usuario**: Busca por usuario de Windows
- **Búsqueda por Celular**: Filtra por teléfono asignado
- **Búsqueda por Equipo**: Busca por tipo (Laptop, Monitor, etc.)
- **Búsqueda por Modelo**: Filtra por modelo exacto

### Editar Asignación
1. Encuentra la asignación en la lista
2. Haz clic en el ícono de editar
3. Actualiza los campos
4. Haz clic en "Actualizar Asignación"

### Eliminar Asignación
1. Haz clic en papelera
2. Confirma eliminación
3. El equipo vuelve a "disponible"

### Exportación a Excel
1. Haz clic en "Exportar a Excel"
2. Descarga con todos los datos de asignaciones
3. Puedes usarlo para reportes

### Importación Masiva
1. Haz clic en "Importar Asignaciones"
2. Pega datos tabulados en el formato correcto
3. Importa

---

## Módulo de Accesorios

### ¿Qué es?
Controla periféricos: mouse, teclado, headset, base para monitor, etc.

### Campos
| Campo | Descripción |
|-------|-------------|
| **Código de Activo Fijo** | Se genera automáticamente (ATM-ACC-0001) |
| **Tipo de Accesorio** | Categoría |
| **Marca** | Fabricante |
| **Modelo** | Modelo |
| **Serial** | Número de serie |
| **Condición** | Nuevo/Usado |

### Registrar Accesorio
1. Ve a "Accesorios"
2. Haz clic en "Nuevo Accesorio"
3. Completa los campos
4. Guarda

### En Asignaciones
Cuando creas una **asignación**, desciende hasta "Accesorios asociados" y:
1. Selecciona accesorios del dropdown
2. Se auto-completan los datos
3. Puedes agregar múltiples

---

## Equipos Disponibles

### ¿Qué es?
Visualización **centralizada** de equipos, celulares y accesorios que **no están asignados**.

### Vista General
1. Ve a "Equipos Disponibles"
2. Ves todos los recursos sin asignar
3. Filtros rápidos:
   - **Tipo**: Todos, Equipos, Celulares, Accesorios
   - **Tipo Específico**: Laptop, Monitor, CPU, iPhone, etc.
   - **Modelo**: Filtra por modelo

### Búsqueda
- Escribe serial, código, marca, modelo
- Búsqueda en tiempo real

### Exportación
1. Haz clic en "Exportar Disponibles"
2. Descarga Excel con los equipos sin asignar

### Uso Práctico
**Ejemplo**: "¿Tengo laptops disponibles?"
1. Filtra por "Equipos"
2. Filtra "Tipo Específico" = "Laptop"
3. Ves solo laptops disponibles
4. Selecciona equipo → copia serial
5. Ve a "Asignaciones" → crea nueva asignación con ese serial

---

## Hoja de Entrega

### ¿Qué es?
Genera **documentos PDF profesionales** para que firmen los empleados al recibir los equipos.

### Contenido del PDF
✓ Datos del empleado (nombre, puesto, sucursal)  
✓ Equipo principal (marca, modelo, serial, especificaciones)  
✓ Equipo secundario (si aplica)  
✓ Celular asignado (si aplica)  
✓ Accesorios (si aplica)  
✓ Cuadros para firmas  
✓ Logo de la empresa  
✓ Pie de página profesional  

### Generar Hoja de Entrega

**Opción 1: Desde Asignaciones**
1. Ve a "Asignaciones"
2. Busca la asignación
3. Haz clic en el botón de "PDF" (ícono de documento)
4. Se abre vista previa del PDF
5. Haz clic en "Descargar PDF"
6. Archivo guardado como `Entrega_[Nombre]_[Fecha].pdf`

**Opción 2: Desde Hoja de Entrega**
1. Ve a "Hoja de Entrega"
2. Busca el empleado por nombre
3. Selecciona su asignación
4. Ves vista previa
5. Haz clic en "Descargar PDF"

### Uso
1. Descarga el PDF
2. Imprime
3. Empleado recibe equipos y firma
4. Archivo guardado como comprobante
5. Escanea y almacena

---

## Descargos

### ¿Qué es?
Cuando un empleado devuelve los equipos, registras el descargo (devolución).

### Información del Descargo
| Campo | Descripción |
|-------|-------------|
| **Empleado** | Quién devuelve |
| **Equipos** | Todos los que se le habían asignado |
| **Condición Final** | Estado al devolverse |
| **Observaciones** | Daños, problemas, etc. |
| **Fecha de Descargo** | Cuándo se devuelve |

### Crear un Descargo

**Método 1: Desde Asignaciones**
1. Ve a "Asignaciones"
2. Busca al empleado que devuelve
3. Haz clic en el ícono de "Descargo"
4. Se abre el formulario pre-cargado
5. Agrega observaciones si hay daños
6. Haz clic en "Realizar Descargo"

**Método 2: Desde Módulo de Descargos**
1. Ve a "Descargos"
2. Haz clic en "Nuevo Descargo"
3. Selecciona la asignación
4. Marca condición de devolución
5. Agrega notas
6. Guarda

### Pestaña de Descargos Completados
1. En el módulo "Descargos", verás dos pestañas:
   - "Pendientes de Descargo"
   - "Descargos Completados"
2. Cambia entre pestañas para ver historial

### Generar PDF de Descargo
1. En descargos completados, haz clic en PDF
2. Documento listo para imprimir
3. Comprobante de devolución

### Exportación
1. Haz clic en "Exportar a Excel"
2. Descarga historial de descargos

---

## Bitácora de Auditoría

### ¿Qué es?
Un **registro automático e inmutable** de TODA operación realizada en el sistema:
- Quién creó, actualizó o eliminó un registro
- Cuándo lo hizo
- Qué módulo fue afectado
- Qué cambios específicos se hicieron

### Información Registrada
✓ Usuario que realizó la acción  
✓ Timestamp exacto  
✓ Módulo afectado (Equipos, Asignaciones, etc.)  
✓ Tipo de acción (Crear, Actualizar, Eliminar, Exportar, Importar)  
✓ ID del registro modificado  
✓ Detalles adicionales  

### Acceder a la Bitácora
1. Ve a "Bitácora" en el menú
2. Ves todos los logs ordenados por más recientes

### Filtros Disponibles
- **Módulo**: Filtra por Equipos, Asignaciones, Celulares, etc.
- **Acción**: Filtra por Crear, Actualizar, Eliminar, Exportar
- **Usuario**: Filtra por quién lo hizo
- **Fecha Inicio**: Registros desde esta fecha
- **Fecha Fin**: Registros hasta esta fecha

### Ejemplo de Uso
**Caso**: "¿Quién modificó el equipo ATM-EQ-045?"
1. Ve a Bitácora
2. Filtra por módulo "Equipos"
3. Filtra por acción "Actualizar"
4. Ves detalles: quién, cuándo, qué cambió

### Exportación
1. Haz clic en "Exportar a Excel"
2. Descarga reporte completo
3. Useful para auditorías internas

---

## Administración de Permisos

### ¿Qué es?
Control granular sobre **quién puede acceder a qué módulos**.

### ⚠️ Solo Accesible para Administradores

### Información de Usuario
| Campo | Descripción |
|-------|-------------|
| **Email** | Cuenta Google del usuario |
| **Nombre** | Nombre completo |
| **Departamento** | Área donde trabaja |
| **Rol** | Admin o Usuario |

### Módulos Disponibles para Asignar
- Equipos
- Celulares
- Nomenclaturas
- Asignaciones
- Equipos Disponibles
- Hojas de Entrega
- Descargos
- (y todos los que se agreguen)

### Agregar Nuevo Usuario

1. Ve a "Admin de Permisos"
2. Haz clic en "Agregar Usuario"
3. Ingresa:
   - Email (debe ser cuenta Google válida)
   - Nombre completo
   - Departamento
4. Haz clic en "Crear Usuario"
5. Ahora configura permisos

### Configurar Permisos

1. Encuentra el usuario en la lista
2. Haz clic en "Editar"
3. Para cada módulo: marca/desmarca checkbox
4. O marca "Admin" para acceso total
5. Haz clic en "Guardar Permisos"

### Roles

**Usuario Normal**
- Acceso solo a módulos asignados
- No puede ver Admin de Permisos
- No puede ver bitácora completa

**Administrador**
- Acceso a TODO
- Puede crear/eliminar usuarios
- Puede ver bitácora completa
- Puede limpiar base de datos

### Eliminar Usuario
1. En el usuario, haz clic en "Editar"
2. Haz clic en "Eliminar Usuario"
3. Se requiere confirmación
4. Usuario pierde acceso inmediatamente

### Ver Registros de Cambios
La bitácora registra TODAS las operaciones de permisos:
1. Ve a "Bitácora"
2. Filtra por módulo "Admin de Permisos"
3. Ves quién hizo qué cambios

---

## Automatizaciones

Una de las **mayores ventajas** de este sistema es la cantidad de procesos automáticos:

### 1. **Auto-generación de Códigos de Activo Fijo** ⚡⚡⚡
**Antes (manual)**
- Abres Excel
- Miras el último código
- Sumas 1
- Escribes manualmente

**Ahora (automático)**
- Haces clic en "Nuevo Equipo"
- El código ATM-EQ-001, ATM-EQ-002, etc. **se genera automáticamente**
- Solo completa los otros datos

⏱️ **Ahorro: 1 minuto por equipo**

### 2. **Auto-completado en Asignaciones** ⚡⚡⚡
**Antes (manual)**
- Escribías serial → Ibas a buscar equipo
- Escribías marca → Ibas a buscar
- Escribías modelo → Ibas a buscar
- Escribías cada campo manualmente

**Ahora (automático)**
- Escribes el serial en la búsqueda
- **TODO se auto-completa de la BD**: código, marca, modelo, especificaciones, condición
- Solo escribes datos del empleado

⏱️ **Ahorro: 5 minutos por asignación**

### 3. **Marcado Automático de Equipos Asignados** ⚡
**Cuando asignas un equipo:**
- Status automáticamente cambia a "asignado"
- Ya no aparece en "Equipos Disponibles"
- Cuando haces descargo, vuelve a "disponible"

**Sin código manual, sin actualizaciones manuales**

⏱️ **Ahorro: 30 segundos por asignación**

### 4. **Generación Automática de PDFs** ⚡⚡
**Antes (manual)**
- Creabas documento Word/Excel
- Pegabas datos manualmente
- Formateabas
- Imprimías

**Ahora (automático)**
- Haces clic en "PDF"
- Sistema genera documento profesional
- Listo para descargar e imprimir

⏱️ **Ahorro: 10 minutos por hoja de entrega**

### 5. **Registros de Auditoría Automáticos** ⚡
**Cada operación:**
- Se guarda automáticamente QUIÉN la hizo
- Se registra CUÁNDO
- Se documentan los CAMBIOS específicos
- Todo sin que el usuario haga nada adicional

⏱️ **Ahorro: tiempo valioso, sin auditorías manuales**

### 6. **Búsqueda y Filtros en Tiempo Real** ⚡
**Escribes parcialmente:**
- Búsqueda instantánea mientras escribes
- No hay demoras
- Múltiples criterios simultáneamente

⏱️ **Ahorro: minutos buscando en listados**

### 7. **Validaciones Automáticas** ⚡
- Nomenclaturas: máximo 14 caracteres (automático)
- Nomenclaturas: detecta duplicados automáticamente
- Equipos: detección de seriales duplicados
- Campos requeridos: obligatorios

⏱️ **Ahorro: evita errores e inconsistencias**

### 8. **Actualización en Tiempo Real** ⚡⚡
- Cambios se reflejan instantáneamente
- Dashboard se actualiza sin refrescar
- Múltiples usuarios pueden trabajar sin conflictos
- Sincronización automática

⏱️ **Ahorro: no necesitas refrescar ni recargar**

### 9. **Importación/Exportación Masiva** ⚡⚡⚡
**Antes:**
- Escribías cada equipo uno por uno

**Ahora:**
- Copias datos de Excel
- Pegas en formulario de importación
- 100 equipos en 10 segundos

⏱️ **Ahorro: 1 minuto por equipo (100 equipos = 100 minutos ahorrados)**

---

## Ahorro de Tiempo

### Comparación: Antes vs. Después

| Tarea | Antes | Después | Ahorro |
|-------|-------|---------|--------|
| Registrar 1 equipo | 5 min | 2 min | 3 min |
| Crear 1 asignación | 15 min | 5 min | 10 min |
| Generar hoja entrega | 20 min | 2 min | 18 min |
| Importar 100 equipos | 8 horas (manual) | 5 min | 7h 55min |
| Buscar equipo por serial | 10 min | <5 seg | 9m 55s |
| Reportes disponibles | 30 min | <1 min | 29 min |
| Auditoría completa | 2 horas | <5 min | 1h 55min |

### Ahorro Anual

**Supongamos:**
- Registras 200 equipos al año
- Haces 300 asignaciones al año
- Generas 50 descargos al año
- Buscas 1000 veces al año
- Haces reportes 12 veces

**Ahorro estimado: 500+ horas por año** 💰

---

## Tips y Trucos

### 1. Búsqueda Avanzada
**En cualquier búsqueda:**
- Escribe partes del nombre/serial
- Funciona parcialmente
- "123" encuentra "ATM-EQ-123"
- "DELL" encuentra todos los Dell

### 2. Atajos de Teclado
- **Enter**: Cuando escribes en búsqueda, presiona Enter
- **Tab**: Navega entre campos del formulario
- **Escape**: Cierra diálogos (generalmente)

### 3. Bulk Operations
**Importar múltiples**:
1. Abre Excel
2. Copia múltiples filas
3. Pega en formulario de importación
4. Copia/pega es más rápido que escribir

### 4. Exportar para Reportes
**Cuando necesites hacer análisis:**
1. Haz clic en "Exportar a Excel"
2. En Excel puedes:
   - Hacer gráficos
   - Ordenar por marca
   - Contar por tipo
   - Calcular edad promedio

### 5. Filtros Combinados
**Necesitas encontrar laptops Dell disponibles:**
1. Ve a "Equipos Disponibles"
2. Marca "Tipo" = "Equipos"
3. Marca "Tipo Específico" = "Laptop"
4. Escribe "Dell" en búsqueda general
5. ¡Listo!

### 6. Duplicar Asignación
Si asignas equipos similares a múltiples empleados:
1. Crea primera asignación completa
2. En la segunda, cuando busques equipo, tus búsquedas anteriores aparecen en el dropdown
3. Acelera la búsqueda

### 7. Identificar Problemas en Bitácora
**Equipo desapareció de disponibles sin motivo:**
1. Ve a Bitácora
2. Filtra por el código del equipo en búsqueda
3. Ves exactamente qué pasó, quién lo cambió

### 8. Gestión de Permisos por Rol
**Si tienes:**
- Gerentes de IT → acceso a TODO
- Tu equipo soporte → acceso: Equipos, Celulares, Asignaciones, Descargos
- RH → acceso : Asignaciones, Hoja Entrega, Equipos Disponibles
- Finanzas → acceso: Equipos Disponibles (para auditorías)

### 9. Generar Reportes Mensuales
1. 1° de mes: Exporta Asignaciones
2. Exporta Descargos
3. Exporta Bitácora
4. En Excel: Haz tabla de movimientos
5. Envía a gerencia

### 10. Mantener Base de Datos Limpia
**No dejes equipos "fantasma":**
1. Mensualmente ve a "Equipos"
2. Busca equipos sin asignar
3. Verifica si están realmente disponibles
4. Si están dañados o descontinuados, elimina

### 11. Usar Nomenclaturas Consistentes
**Mejores prácticas:**
- USA MAYÚSCULAS
- Nomenclaturas iguales a lo que configuras en Windows
- Ej: ATMAUDIT, ATMRH01, ATMSOP02

### 12. Backup Mental
**Aunque el sistema es seguro:**
- Exporta Excel de Equipos regularmente
- Exporta Asignaciones al menos mensualmente
- Guarda PDFs de hojas entrega importantes
- La BD es en Firebase, pero tener copias es bueno

### 13. Cuando Falta Información
**Si importas equipos sin algunos datos:**
1. Importa sin problema
2. Después edita uno por uno
3. O importa de nuevo con datos completos
4. Sistema no duplica si código es igual

### 14. Descargos Parciales
**Si un empleado devuelve solo algunos equipos:**
1. Crea una nueva asignación con equipos restantes
2. Porque descargo marca TODO
3. Así tienes histórico correcto

---

## Resolución de Problemas

### "No veo un módulo"
**Solución**: Admin no te ha dado permisos
- Contacta al administrador
- Pide que te agregue ese módulo en "Admin de Permisos"

### "No me autocompleta la asignación"
**Solución**: El serial está mal o no existe
- Verificar serial exacto del equipo
- Copiar desde la tabla de Equipos
- Pegar en búsqueda de asignaciones

### "Veo un equipo en disponibles pero ya lo asigné"
**Solu**ción: Actualizar la página (F5)
- Datos están sincronizados pero a veces necesita refresco
- O cambia de módulo y vuelve

### "¿Cómo restauro un equipo eliminado?"
**Solución**: No se puede restaurar
- La eliminación es permanente
- Por eso pide confirmación
- Usa Bitácora para ver qué pasó

### "El PDF no sale bien formateado"
**Solución**: Ajusta márgenes de impresión
- Ve a archivo → imprimir
- Configura márgenes a 1" en todos lados
- Escala: 100%

---

## Conclusión

Este sistema te ahorra:
✅ **Horas de trabajo manual**  
✅ **Errores de transcripción**  
✅ **Pérdida de datos**  
✅ **Falta de trazabilidad**  
✅ **Búsquedas exhaustivas**  

**Máxima automatización, mínima intervención manual.**

---

## Soporte

Si encuentras problemas o tienes preguntas:
1. Revisa este manual
2. Contacta al administrador
3. Revisa la Bitácora si algo no cuadra

**¡Bienvenido al sistema! 🚀**

