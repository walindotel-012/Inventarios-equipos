# 📋 Módulo de Auditoría (Bitácora de Actividades)

## Descripción General

Se ha implementado un sistema completo de auditoría que registra todas las operaciones relevantes realizadas en el sistema. Esto permite:

- **Rastrear cambios**: Quién hizo qué, cuándo y dónde
- **Seguridad**: Historial completo de acciones de usuarios
- **Cumplimiento**: Registro para auditorías internas
- **Análisis**: Entender patrones de uso del sistema

## Componentes Implementados

### 1. **Función Utilitaria de Auditoría** (`src/utils/auditLog.js`)
Proporciona funciones para registrar y consultar logs de auditoría:

```javascript
// Registrar una acción
logAudit(userId, userName, action, module, recordId, details)

// Obtener todos los logs
getAuditLogs()

// Filtrar por módulo
getAuditLogsByModule(module)

// Filtrar por usuario
getAuditLogsByUser(userId)

// Filtrar por registro
getAuditLogsByRecord(recordId)
```

### 2. **Página de Bitácora** (`src/pages/Bitacora.jsx`)
Dashboard de visualización de logs con:
- **Tabla de registros** con información completa
- **Filtros avanzados** por módulo, acción y usuario
- **Detalles expandibles** para ver información específica
- **Acceso restringido** a administradores solo

### 3. **Integración en Módulos**
Los siguientes módulos ahora registran auditoría:

- ✅ **Equipos**: CREATE, UPDATE, DELETE
- ✅ **Asignaciones**: CREATE, UPDATE, DELETE
- ⏳ **Celulares**: (listo para integrar)
- ⏳ **Nomenclaturas**: (listo para integrar)
- ⏳ **Descargas**: (listo para integrar)

## Datos Registrados

Cada entrada de auditoría incluye:

```javascript
{
  userId: string,              // ID del usuario
  userName: string,            // Nombre del usuario
  action: string,              // CREATE, UPDATE, DELETE, EXPORT, IMPORT, etc
  module: string,              // Equipos, Asignaciones, Celulares, etc
  recordId: string,            // ID del registro afectado
  timestamp: Timestamp,        // Fecha y hora exacta
  details: object,             // Detalles específicos de la acción
  userAgent: string,           // Información del navegador
  ip: string                   // Dirección IP (cuando esté disponible)
}
```

## Cómo Integrar en Otros Módulos

### Paso 1: Importar la función
```javascript
import { logAudit } from '../utils/auditLog';
```

### Paso 2: Registrar CREATE (Crear)
```javascript
const docRef = await addDoc(collection(db, 'coleccion'), datosNuevos);

// Registrar en auditoría
await logAudit(
  currentUser.uid,
  currentUser.displayName || currentUser.email,
  'CREATE',
  'NombreModulo',
  docRef.id,
  {
    // Detalles relevantes
    campo1: valor1,
    campo2: valor2,
  }
);
```

### Paso 3: Registrar UPDATE (Actualizar)
```javascript
const datosAnteriores = datos.find(d => d.id === editingId);

await updateDoc(doc(db, 'coleccion', editingId), datosNuevos);

// Registrar en auditoría
await logAudit(
  currentUser.uid,
  currentUser.displayName || currentUser.email,
  'UPDATE',
  'NombreModulo',
  editingId,
  {
    anterior: datosAnteriores,
    nuevo: datosNuevos,
  }
);
```

### Paso 4: Registrar DELETE (Eliminar)
```javascript
const datosAEliminar = datos.find(d => d.id === deleteId);

await deleteDoc(doc(db, 'coleccion', deleteId));

// Registrar en auditoría
await logAudit(
  currentUser.uid,
  currentUser.displayName || currentUser.email,
  'DELETE',
  'NombreModulo',
  deleteId,
  {
    // Información del registro eliminado
    nombre: datosAEliminar.nombre,
    valor: datosAEliminar.valor,
  }
);
```

## Acceso a la Bitácora

### Por Navegación
- Solo administradores ven el botón "Bitácora" en el menú
- Acceso directo: `/#/bitacora`

### Filtros Disponibles
1. **Módulo**: Filtrar por componente del sistema
2. **Acción**: Filtrar por tipo de operación
3. **Usuario**: Filtrar por quién realizó la acción

## Consideraciones de Seguridad

✅ **Logs inmutables**: Los registros se guardan en Firestore y no se pueden modificar
✅ **Acceso restringido**: Solo administradores ven la bitácora
✅ **No interrumpe operaciones**: Si falla el log, la operación principal continúa
✅ **Información sensible**: No registra contraseñas o datos sensibles

## Base de Datos

Se utiliza una colección llamada `auditLogs` en Firestore:

**Reglas de seguridad recomendadas:**
```firestore
allow read: if request.auth.uid != null && 
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
allow write: if false;  // Solo la aplicación puede escribir
```

## Tipos de Acciones Soportadas

| Acción | Color | Icono | Descripción |
|--------|-------|-------|-------------|
| CREATE | Verde | Plus | Crear un nuevo registro |
| UPDATE | Azul | Pencil | Actualizar un registro |
| DELETE | Rojo | Trash | Eliminar un registro |
| EXPORT | Púrpura | DownloadTray | Exportar datos |
| IMPORT | Índigo | UploadTray | Importar datos |
| VIEW | Gris | Eye | Ver un registro |
| DOWNLOAD | Cyan | Download | Descargar un archivo |

## Integración Futura

Estos módulos están listos para integrar auditoría (solo requieren copiar el código de ejemplo):

1. **Celulares** (`src/pages/Celulares.jsx`)
2. **Nomenclaturas** (`src/pages/Nomenclaturas.jsx`)
3. **Descargas** (`src/pages/Descargo.jsx`)
4. **Entregas** (`src/pages/HojaEntrega.jsx`)

## Notas Técnicas

- Los logs se guardan **asincronicamente** sin bloquear la UI
- Las fechas se registran con precisión usando `Timestamp.now()`
- Se captura automáticamente información del navegador
- Los detalles se pueden customizar por módulo
- Los logs se ordenan por **fecha descendente** (más recientes primero)

## Testing

Para verificar que funciona correctamente:

1. Crear/Editar/Eliminar un equipo
2. Crear/Editar/Eliminar una asignación
3. Navegar a Bitácora (como admin)
4. Filtrar y ver los registros creados

---

**Última actualización**: Enero 2026
**Versión**: 1.0
**Estado**: ✅ Implementado y Funcional
