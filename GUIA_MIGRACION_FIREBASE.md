# 📦 Guía Completa de Migración Firebase

## Objetivo
Migrar toda la configuración y datos de Firebase de `walindotel@gmail.com` a `equiposinventario8@gmail.com`

---

## 🔴 PASO 1: Exportar Datos del Proyecto Actual

### 1.1 Acceder a Firebase Console (Cuenta Antigua)
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Inicia sesión con **walindotel@gmail.com**
3. Selecciona el proyecto **inventario-equipos-f67f9**

### 1.2 Exportar Firestore Database
1. Ve a **Firestore Database** en el panel izquierdo
2. Haz clic en los **tres puntos (⋮)** en la parte superior derecha
3. Selecciona **Exportar colecciones**
4. Elige la ubicación de almacenamiento en Google Cloud Storage
5. Espera a que se complete la exportación
6. Descarga el archivo `.json` o `.gzip` generado

**⚠️ Alternativa manual:**
- Ve a cada colección (equipos, asignaciones, celulares, descargos, nomenclaturas, auditLogs)
- Usa **Herramientas de desarrollador > Extensión Firestore**
- Exporta cada colección como JSON

### 1.3 Exportar Información de Autenticación
1. Ve a **Authentication** > **Users**
2. Toma nota de:
   - Emails de usuarios registrados
   - UIDs de usuarios
   - Métodos de autenticación (Google, Email/Password)
3. **Nota:** No puedes exportar contraseñas directamente (por seguridad)

### 1.4 Documentar Configuraciones Especiales
- **Firebase Rules:** Ve a **Firestore Database** > **Rules** y copia el contenido
- **Email Templates:** Ve a **Authentication** > **Templates** y documenta cualquier personalización
- **Storage:** Si tienes archivos en Storage, ve a **Storage** y documenta la estructura

---

## 🟢 PASO 2: Crear Nuevo Proyecto en Firebase

### 2.1 Crear Proyecto en Nueva Cuenta
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en **Agregar proyecto**
3. Nombre del proyecto: `equiposinventario-nueva` (elige un nombre descriptivo)
4. Habilita Google Analytics (opcional)
5. Selecciona la ubicación: **USA (us-central1)** o tu zona preferida
6. Espera a que se cree el proyecto (2-3 minutos)

### 2.2 Habilitar Firestore
1. En el nuevo proyecto, ve a **Firestore Database**
2. Haz clic en **Crear base de datos**
3. Modo: **Modo de producción** (más seguro)
4. Ubicación: Selecciona la misma región que el proyecto anterior
5. Crea la base de datos

### 2.3 Habilitar Authentication
1. Ve a **Authentication** en el panel izquierdo
2. Haz clic en **Comenzar**
3. Habilita los siguientes métodos:
   - ✅ **Email/Password**
   - ✅ **Google** (configura OAuth)
   - ✅ **Microsoft** (configura OAuth)

---

## 🟡 PASO 3: Migrar Datos a Nueva Base de Datos

### 3.1 Importar Datos en Firestore (Opción A - Recomendado)
1. En el nuevo proyecto Firebase, ve a **Firestore Database**
2. Haz clic en los **tres puntos (⋮)** en la parte superior derecha
3. Selecciona **Importar colecciones**
4. Selecciona el archivo `.json` o `.gzip` exportado en Paso 1.2
5. Espera a que se complete (puede tomar varios minutos)

### 3.2 Importar Datos Manualmente (Opción B - Si necesitas verificar)
1. Para cada colección en el archivo JSON exportado:
   ```
   - equipos
   - asignaciones
   - celulares
   - descargos
   - nomenclaturas
   - auditLogs
   ```
2. Crea cada colección manualmente en el nuevo Firestore
3. Añade los documentos copiando desde el JSON

### 3.3 Verificar Integridad de Datos
Después de importar, verifica que:
- ✅ Todas las colecciones aparecen en Firestore
- ✅ Los documentos tienen los datos correctos
- ✅ No hay documentos duplicados
- ✅ Los IDs de documentos se mantienen (importante para referencias)

---

## 🔵 PASO 4: Obtener Nueva Configuración Firebase

### 4.1 Obtener Credenciales Nuevas
1. En el nuevo proyecto Firebase, ve a **Configuración del proyecto** (⚙️)
2. Ve a la pestaña **General**
3. Baja hasta **Tus aplicaciones**
4. Si no hay aplicación web, haz clic en **Registrar app** y selecciona **Web (</> )**
5. Copia la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "nuevo-proyecto.firebaseapp.com",
  projectId: "nuevo-proyecto-xxxxx",
  storageBucket: "nuevo-proyecto-xxxxx.firebasestorage.app",
  messagingSenderId: "1234567890123",
  appId: "1:1234567890123:web:abcdef1234567890abcdef"
};
```

---

## 🟣 PASO 5: Actualizar Configuración en el Código

### 5.1 Actualizar firebase.js
Reemplaza el contenido de `src/firebase.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase - Nueva Cuenta
const firebaseConfig = {
  apiKey: "TU_NEW_API_KEY",
  authDomain: "tu-nuevo-proyecto.firebaseapp.com",
  projectId: "tu-nuevo-proyecto-id",
  storageBucket: "tu-nuevo-proyecto.firebasestorage.app",
  messagingSenderId: "TU_NEW_MESSAGING_ID",
  appId: "TU_NEW_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Microsoft OAuth Provider
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Initialize Firestore
export const db = getFirestore(app);
```

### 5.2 Actualizar Variables de Entorno (Opcional)
Si tienes un archivo `.env`:

```env
VITE_FIREBASE_API_KEY=TU_NEW_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=tu-nuevo-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-nuevo-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-nuevo-proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=TU_NEW_MESSAGING_ID
VITE_FIREBASE_APP_ID=TU_NEW_APP_ID
```

---

## 🟠 PASO 6: Configurar Reglas de Seguridad

### 6.1 Migrar Reglas de Firestore
1. En el nuevo proyecto, ve a **Firestore Database** > **Rules**
2. Copia las reglas del proyecto antiguo (ver Paso 1.4)
3. Pega las mismas reglas en el nuevo proyecto
4. Publica las reglas

**Ejemplo de reglas básicas:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🟤 PASO 7: Configurar OAuth (Google y Microsoft)

### 7.1 Configurar Google OAuth
1. En el nuevo proyecto Firebase, ve a **Authentication** > **Google**
2. Haz clic en **Editar** y copia el **ID de cliente de OAuth**
3. Ve a [Google Cloud Console](https://console.cloud.google.com)
4. Asegúrate de que la aplicación tiene:
   - ✅ Pantalla de consentimiento OAuth configurada
   - ✅ Dominio autorizado (tu dominio de producción)
   - ✅ URLs de redirección correctas

### 7.2 Configurar Microsoft OAuth
1. En el nuevo proyecto Firebase, ve a **Authentication** > **Microsoft**
2. Haz clic en **Editar**
3. Ve a [Microsoft Azure Portal](https://portal.azure.com)
4. En tu aplicación registrada:
   - ✅ Actualiza la URL de redirección a la nueva
   - ✅ Copia el **Application ID** a Firebase

---

## 🟦 PASO 8: Pruebas y Validación

### 8.1 Pruebas Locales
```bash
# Limpia caché
npm run build

# Ejecuta en desarrollo
npm run dev

# Prueba:
# ✅ Login con Google
# ✅ Login con Microsoft
# ✅ Login con Email
# ✅ Ver equipos
# ✅ Ver asignaciones
# ✅ Ver bitácora
# ✅ Exportar datos
```

### 8.2 Verificar Datos
1. Accede al nuevo Firebase Console
2. Verifica que todas las colecciones y documentos están presentes
3. Revisa la bitácora de auditoría para verificar sincronización

### 8.3 Prueba de Usuarios
- Crea un usuario de prueba en el nuevo Firebase
- Verifica que puede autenticarse correctamente
- Comprueba permisos y acceso a datos

---

## ⚠️ PASO 9: Consideraciones Especiales

### 9.1 IDs de Documentos
Si los IDs de documentos son críticos (referencias entre colecciones):
- ✅ Asegúrate de exportar/importar con los IDs preservados
- Si cambian los IDs, tendrás que actualizar referencias manualmente

### 9.2 Datos Sensibles
- 🔒 No exportes contraseñas (Firebase las protege)
- 🔒 Revisa cualquier dato sensible en auditLogs antes de importar

### 9.3 Usuarios Existentes
Los usuarios antiguos necesitarán:
- Crear nueva cuenta en el nuevo Firebase, O
- Migrar manualmente los datos de usuario

### 9.4 Almacenamiento (Storage)
Si usas Cloud Storage para archivos:
1. Ve a **Cloud Storage** en el proyecto antiguo
2. Descarga todos los archivos
3. Ve a **Cloud Storage** en el proyecto nuevo
4. Carga los mismos archivos

---

## 🔐 PASO 10: Cambiar la Cuenta de Propietario

### 10.1 Transferir Propiedad del Proyecto
1. En el nuevo proyecto Firebase, ve a **Configuración** > **Permisos**
2. Haz clic en **Agregar miembro**
3. Ingresa `equiposinventario8@gmail.com`
4. Asigna el rol **Editor** o **Propietario**
5. Acepta la invitación desde la nueva cuenta

---

## 🚀 PASO 11: Desplegar a Producción

### 11.1 Actualizar Dominio
1. Ve a **Authentication** > **Dominios autorizados**
2. Agrega tu dominio de producción
3. Verifica el dominio (si es necesario)

### 11.2 Configurar Hosting (Opcional)
Si usas Firebase Hosting:
```bash
firebase login
firebase init hosting
firebase deploy --only hosting
```

### 11.3 Monitorear
1. Ve a **Analytics** para ver la actividad de usuarios
2. Revisa **Performance** para monitorear velocidad
3. Revisa **Errors** para detectar problemas

---

## ✅ Checklist Final de Migración

- [ ] Datos exportados del proyecto antiguo
- [ ] Nuevo proyecto creado
- [ ] Firestore importado
- [ ] Authentication configurado
- [ ] firebase.js actualizado
- [ ] OAuth (Google y Microsoft) configurado
- [ ] Reglas de Firestore aplicadas
- [ ] Pruebas locales pasadas
- [ ] Usuarios de prueba creados
- [ ] Storage migrado (si aplica)
- [ ] Dominio autorizado
- [ ] Permisos asignados a nueva cuenta
- [ ] Producción testeada
- [ ] Plan de rollback disponible

---

## 🆘 Solución de Problemas

### Problema: "Permiso denegado" después de migración
**Solución:** Revisa las reglas de Firestore y asegúrate que permiten lectura/escritura

### Problema: Usuarios no pueden autenticarse
**Solución:** Verifica que OAuth está configurado correctamente en Google Cloud Console

### Problema: Datos no se importan
**Solución:** Verifica que el archivo JSON tiene el formato correcto y que la ubicación de Storage tiene permisos

### Problema: Referencias entre documentos rotas
**Solución:** Asegúrate que los IDs de documentos se preservaron en la importación

---

## 📞 Próximos Pasos

1. **Antes de migrar:** Haz backup completo del proyecto actual
2. **Durante migración:** Ten ambos proyectos abiertos para referencia
3. **Después de migración:** Espera 24-48 horas antes de eliminar el proyecto antiguo
4. **Mantenimiento:** Configura automático backups en el nuevo proyecto

---

## 📝 Notas Importantes

- **Tiempo estimado:** 1-2 horas
- **Riesgo:** BAJO (siempre tienes backup del proyecto antiguo)
- **Rollback:** Puedes volver al proyecto antiguo en cualquier momento durante las primeras 48 horas
- **Costo:** El plan gratuito de Firebase es suficiente para este proyecto

---

**Última actualización:** 16 de Enero de 2026
**Versión:** 1.0
