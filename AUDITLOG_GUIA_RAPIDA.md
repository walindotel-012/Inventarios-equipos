# 🚀 GUÍA RÁPIDA: Sistema de Auditoría

## 📍 Acceso a la Bitácora

### Opción 1: Menú de Navegación (Recomendado)
1. Login en la aplicación como **administrador**
2. En el menú lateral izquierdo, busca **"Bitácora"**
3. Haz clic para ver el registro de auditoría

### Opción 2: URL Directa
- Acceso directo: `http://localhost:5173/#/bitacora`
- Requiere estar logueado como admin

---

## 🔍 Cómo Usar los Filtros

### Filtrar por Módulo
1. Abre la sección "Filtros"
2. Selecciona un módulo del dropdown (Equipos, Asignaciones, etc)
3. La tabla se actualiza automáticamente

### Filtrar por Acción
1. Selecciona el tipo de acción:
   - **Crear**: Nuevos registros
   - **Actualizar**: Cambios en registros
   - **Eliminar**: Registros eliminados
   - **Exportar/Importar**: Operaciones en lote

### Filtrar por Usuario
1. Selecciona un usuario del dropdown
2. Ver solo sus actividades

### Combinar Filtros
- Puedes usar múltiples filtros a la vez
- Ejemplo: Módulo=Equipos + Acción=DELETE
- Haz clic en "Limpiar filtros" para resetear

---

## 📋 Cómo Leer la Tabla

### Columnas Principales

| Columna | Descripción |
|---------|-------------|
| **Fecha y Hora** | Cuándo ocurrió exactamente |
| **Usuario** | Quién realizó la acción |
| **Módulo** | En dónde ocurrió (Equipos, Asignaciones, etc) |
| **Acción** | Qué pasó (Crear, Actualizar, Eliminar) |
| **Registro ID** | Código único del registro |
| **Detalles** | Info adicional (expandible) |

### Entender los Colores

- 🟢 **Verde**: Crear (CREATE)
- 🔵 **Azul**: Actualizar (UPDATE)
- 🔴 **Rojo**: Eliminar (DELETE)
- 🟣 **Púrpura**: Exportar (EXPORT)
- 🟠 **Índigo**: Importar (IMPORT)

---

## 📊 Casos de Uso Comunes

### Caso 1: "¿Quién modificó mi equipo?"
1. Abre Bitácora
2. Filtrar por Módulo = "Equipos"
3. Buscar el serial del equipo en "Registro ID"
4. Ver Acción = "UPDATE"
5. Ver quién lo hizo en columna "Usuario"

### Caso 2: "¿Qué hizo el usuario Juan ayer?"
1. Abre Bitácora
2. Filtrar por Usuario = "Juan Pérez"
3. Busca en rango de fechas
4. Haz click en "Ver detalles" de cada entrada

### Caso 3: "¿Cuándo se eliminó el equipo XYZ?"
1. Abre Bitácora
2. Filtrar por Módulo = "Equipos"
3. Filtrar por Acción = "Eliminar"
4. Buscar el serial en los detalles
5. Ver fecha exacta en "Fecha y Hora"

### Caso 4: "¿Cuántas asignaciones se hicieron hoy?"
1. Abre Bitácora
2. Filtrar por Módulo = "Asignaciones"
3. Filtrar por Acción = "Crear"
4. Contar registros (resumen muestra cantidad)

---

## 💡 Consejos Útiles

### ✅ Lo que sí está registrado
- ✓ Crear equipos
- ✓ Modificar equipos
- ✓ Eliminar equipos
- ✓ Asignar equipos a usuarios
- ✓ Registrar celulares
- ✓ Cambios en celulares
- ✓ Eliminación de celulares

### ❌ Lo que NO está registrado (aún)
- ✗ Login/Logout de usuarios
- ✗ Acceso a módulos
- ✗ Descargas de archivos
- ✗ Búsquedas realizadas

(Pueden agregarse en el futuro)

---

## 🔐 Privacidad y Seguridad

⚠️ **IMPORTANTE**: Solo administradores ven la bitácora
- Los registros de auditoría NO se pueden modificar
- Los registros de auditoría NO se pueden eliminar
- Se registra automáticamente quién hizo qué

---

## 🐛 Troubleshooting

### Problema: No veo el botón "Bitácora"
**Solución**: Verifica que seas administrador. Contacta con un admin para que te asigne permisos.

### Problema: La tabla está vacía
**Solución**: Es normal si acaba de instalar. Los logs aparecerán conforme hagas cambios en el sistema.

### Problema: No veo algunos registros antiguos
**Solución**: La tabla muestra registros ordenados por fecha (más recientes primero). Desplázate hacia abajo.

---

## 📞 Soporte

¿Preguntas sobre la Bitácora?
- Revisa `AUDITLOG_DOCUMENTATION.md` para documentación técnica
- Contacta con el administrador del sistema

---

**Versión**: 1.0
**Última actualización**: 15 de Enero de 2026
