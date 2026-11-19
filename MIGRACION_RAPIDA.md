# Script de Ayuda para Migración Firebase

## Resumen Rápido de los Pasos Principales

```
PROYECTO ANTIGUO (walindotel@gmail.com)
├─ Paso 1: Exportar Firestore Database (colecciones JSON)
├─ Paso 2: Documentar reglas de seguridad
└─ Paso 3: Anotar configuración actual

            ⬇️ MIGRACIÓN ⬇️

PROYECTO NUEVO (equiposinventario8@gmail.com)
├─ Paso 4: Crear nuevo proyecto Firebase
├─ Paso 5: Habilitar Firestore y Authentication
├─ Paso 6: Importar datos (JSON)
├─ Paso 7: Configurar OAuth (Google + Microsoft)
├─ Paso 8: Aplicar reglas de seguridad
└─ Paso 9: Actualizar firebase.js

            ⬇️ VERIFICACIÓN ⬇️

VALIDACIÓN
├─ Paso 10: Probar login (todos los métodos)
├─ Paso 11: Verificar datos en Firestore
├─ Paso 12: Revisar bitácora de auditoría
└─ Paso 13: Pruebas funcionales completas
```

---

## Información Técnica Actual del Proyecto

### Configuración Actual (walindotel@gmail.com)
```javascript
// Proyecto Actual: inventario-equipos-f67f9
const firebaseConfig = {
  apiKey: "AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4",
  authDomain: "inventario-equipos-f67f9.firebaseapp.com",
  projectId: "inventario-equipos-f67f9",
  storageBucket: "inventario-equipos-f67f9.firebasestorage.app",
  messagingSenderId: "1056879976158",
  appId: "1:1056879976158:web:3f8c86fcd91cee3b5aec4f"
};
```

### Colecciones a Migrar
1. **equipos** - Catálogo de equipos
2. **asignaciones** - Asignaciones de equipos a usuarios
3. **celulares** - Registro de celulares
4. **descargos** - Registro de descargas de equipos
5. **nomenclaturas** - Catálogo de nomenclaturas
6. **auditLogs** - Registro de auditoría de todas las acciones

### Métodos de Autenticación Actuales
- ✅ Google OAuth
- ✅ Microsoft OAuth  
- ✅ Email/Password

---

## Comandos Útiles para Firebase CLI

```bash
# Instalar Firebase CLI (si no está instalado)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Listar proyectos
firebase projects:list

# Exportar Firestore (proyecto actual)
firebase firestore:export gs://tu-bucket/backup --project=inventario-equipos-f67f9

# Importar Firestore (proyecto nuevo)
firebase firestore:import gs://tu-bucket/backup --project=nuevo-proyecto-id
```

---

## Template para Documentar la Migración

```markdown
## Migración Ejecutada

**Fecha:** ________________
**Responsable:** ________________

### Proyecto Antiguo
- Email: walindotel@gmail.com
- Project ID: inventario-equipos-f67f9
- Fecha backup: ________________

### Proyecto Nuevo
- Email: equiposinventario8@gmail.com
- Project ID: ________________
- Fecha creación: ________________

### Colecciones Migradas
- [ ] equipos (_____ documentos)
- [ ] asignaciones (_____ documentos)
- [ ] celulares (_____ documentos)
- [ ] descargos (_____ documentos)
- [ ] nomenclaturas (_____ documentos)
- [ ] auditLogs (_____ documentos)

### Usuarios Migrados
- [ ] Usuarios: ________________
- [ ] OAuth configurado
- [ ] Email/Password configurado

### Testing Completado
- [ ] Login Google ✓
- [ ] Login Microsoft ✓
- [ ] Login Email ✓
- [ ] Ver Equipos ✓
- [ ] Ver Asignaciones ✓
- [ ] Ver Bitácora ✓
- [ ] Exportar datos ✓

### Notas
________________
________________
```

---

## Diferencias Esperadas Entre Proyectos

Antes de migrar, ten en cuenta que después del cambio:

| Aspecto | Cambio |
|---------|--------|
| **apiKey** | ✓ Cambia (nueva cuenta) |
| **authDomain** | ✓ Cambia (nuevo nombre de proyecto) |
| **projectId** | ✓ Cambia (nuevo proyecto) |
| **storageBucket** | ✓ Cambia (nuevo bucket) |
| **Data en Firestore** | - Sin cambios (migrado) |
| **Usuarios** | ⚠️ Necesitan re-autenticar |
| **URLs en documentos** | - Sin cambios (si está bien hecho) |

---

## Opciones de Migración

### Opción A: Migración Directa (Recomendada)
- Tiempo: 1-2 horas
- Riesgo: Bajo
- Rollback: Fácil (si lo haces en < 48 hrs)

**Pasos:**
1. Exportar datos del proyecto antiguo
2. Crear proyecto nuevo
3. Importar datos
4. Cambiar configuración
5. Probar

### Opción B: Migración Paralela (Más segura pero lenta)
- Tiempo: 2-4 horas
- Riesgo: Muy bajo
- Rollback: Muy fácil

**Pasos:**
1. Exportar datos del proyecto antiguo
2. Crear proyecto nuevo
3. Importar datos
4. Ejecutar ambos proyectos simultáneamente
5. Validar nuevo proyecto completamente
6. Cambiar configuración en producción
7. Monitorear errores
8. Después de 48 hrs, desactivar proyecto antiguo

### Opción C: Migración Gradual (Más compleja)
- Tiempo: 1-2 semanas
- Riesgo: Medio (pueden haber inconsistencias)
- Rollback: Complejo

**Pasos:**
1. Crear proyecto nuevo con datos
2. Migrar usuarios gradualmente
3. Sincronizar datos en tiempo real (más complejo)
4. Validar durante 1-2 semanas
5. Cambiar completamente

**Recomendación:** Usa **Opción A** (Migración Directa)

---

## Checklist Pre-Migración

Antes de iniciar, asegúrate de:

- [ ] ¿Tienes acceso a walindotel@gmail.com? ✓
- [ ] ¿Tienes acceso a equiposinventario8@gmail.com? ✓
- [ ] ¿Hiciste backup de todos los datos? ✓
- [ ] ¿Documentaste las reglas de seguridad? ✓
- [ ] ¿Tienes 1-2 horas disponibles? ✓
- [ ] ¿Tienes conexión a internet estable? ✓
- [ ] ¿Tienes acceso a Google Cloud Console? ✓
- [ ] ¿Documentaste la configuración actual? ✓

---

## Checklist Post-Migración

Después de completar la migración:

- [ ] Actualizar `firebase.js` con nuevas credenciales
- [ ] Probar autenticación con Google
- [ ] Probar autenticación con Microsoft
- [ ] Probar autenticación con Email/Password
- [ ] Verificar que los datos aparecen correctamente
- [ ] Verificar la bitácora de auditoría
- [ ] Revisar la consola de errores
- [ ] Hacer commit de los cambios
- [ ] Hacer deploy a producción
- [ ] Monitorear durante 24 horas
- [ ] Documentar la migración completada

---

## URLs Útiles

| Recurso | URL |
|---------|-----|
| Firebase Console | https://console.firebase.google.com |
| Google Cloud Console | https://console.cloud.google.com |
| Microsoft Azure Portal | https://portal.azure.com |
| Firebase Docs | https://firebase.google.com/docs |
| Firestore Rules | https://firebase.google.com/docs/firestore/security/start |

---

## Contactos y Soporte

Si tienes problemas durante la migración:

1. **Firebase Support:** https://firebase.google.com/support
2. **Stack Overflow Tag:** `firebase` `firestore` `migration`
3. **GitHub Issues:** Busca en repositorios similares
4. **Discord Communities:** Firebase community servers

---

**Nota:** Esta es una migración de baja complejidad. Si necesitas ayuda adicional, contacta al equipo de Google Cloud.

---

**Creado:** 16 de Enero de 2026
**Estado:** Listo para Usar
