# 🔑 PLANTILLA: CREDENCIALES FIREBASE - ANTES Y DESPUÉS

## ⚠️ IMPORTANTE
- **NO** compartas este archivo públicamente
- **NO** lo subas a GitHub
- Guarda en lugar seguro (1Password, LastPass, etc.)
- Elimina después de migración completada

---

## 📋 PROYECTO ACTUAL (walindotel@gmail.com)

### Configuración Actual (del archivo src/firebase.js)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4",
  authDomain: "inventario-equipos-f67f9.firebaseapp.com",
  projectId: "inventario-equipos-f67f9",
  storageBucket: "inventario-equipos-f67f9.firebasestorage.app",
  messagingSenderId: "1056879976158",
  appId: "1:1056879976158:web:3f8c86fcd91cee3b5aec4f"
};
```

### Información Asociada
- **Project ID:** `inventario-equipos-f67f9`
- **Project Number:** `1056879976158`
- **Web API Key:** `AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4`
- **Auth Domain:** `inventario-equipos-f67f9.firebaseapp.com`
- **Storage Bucket:** `inventario-equipos-f67f9.firebasestorage.app`
- **App ID:** `1:1056879976158:web:3f8c86fcd91cee3b5aec4f`

---

## 📋 PROYECTO NUEVO (equiposinventario8@gmail.com)

### Configuración Nueva (OBTENER DURANTE MIGRACIÓN - Paso 4)

```javascript
const firebaseConfig = {
  apiKey: "_____________________________________",
  authDomain: "_____________________________________",
  projectId: "_____________________________________",
  storageBucket: "_____________________________________",
  messagingSenderId: "_____________________________________",
  appId: "_____________________________________"
};
```

### Información a Completar
- **Project ID:** `_____________________________________`
- **Project Number:** `_____________________________________`
- **Web API Key:** `_____________________________________`
- **Auth Domain:** `_____________________________________`
- **Storage Bucket:** `_____________________________________`
- **App ID:** `_____________________________________`

**¿Dónde obtener?**
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona el nuevo proyecto
3. Ve a **Configuración del Proyecto** (⚙️)
4. Ve a **General**
5. Baja a **Tus aplicaciones**
6. Busca la aplicación web "Web"
7. Haz clic en **Config**
8. Copia la configuración

---

## 🔄 MIGRACIÓN: ANTES → DESPUÉS

| Campo | Antes | Después | ¿Cambió? |
|-------|-------|---------|----------|
| apiKey | AIzaSyDL2P7... | ___________ | ✅ SÍ |
| authDomain | inventario-equipos-f67f9... | ___________ | ✅ SÍ |
| projectId | inventario-equipos-f67f9 | ___________ | ✅ SÍ |
| storageBucket | inventario-equipos-f67f9... | ___________ | ✅ SÍ |
| messagingSenderId | 1056879976158 | ___________ | ✅ SÍ |
| appId | 1:1056879976158:web:... | ___________ | ✅ SÍ |

---

## 🔐 OAUTH CONFIGURATION

### Google OAuth

#### Antes (Actual)
- **OAuth Client ID:** (Anota aquí) `_____________________________`
- **Cloud Project:** inventario-equipos-f67f9
- **URLs autorizadas:**
  - `http://localhost:5173`
  - (Tus dominios actuales aquí)

#### Después (Nuevo)
- **OAuth Client ID:** (Obtén durante migración) `_____________________________`
- **Cloud Project:** (Nuevo nombre)
- **URLs a autorizar:**
  - `http://localhost:5173`
  - `https://tu-dominio-produccion.com`

**¿Dónde configurar?**
1. [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services > Credentials
3. OAuth 2.0 Client ID > Edit
4. Authorized JavaScript origins > Add URI

---

### Microsoft OAuth

#### Antes (Actual)
- **Application ID:** (Anota aquí) `_____________________________`
- **Tenant ID:** (Si aplica) `_____________________________`

#### Después (Nuevo)
- **Application ID:** (Obtén durante migración) `_____________________________`
- **Tenant ID:** (Si es necesario) `_____________________________`

**¿Dónde configurar?**
1. [Microsoft Azure Portal](https://portal.azure.com)
2. Azure Active Directory > App registrations
3. Tu aplicación > Authentication
4. Add URI bajo "Redirect URIs"

---

## 🔐 FIRESTORE RULES

### Reglas Actuales (Backup)
```
Fecha de backup: ___________

[Copia las reglas actuales aquí desde:
Firebase Console > Firestore > Rules]

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Reglas Nuevas
- ✅ Copiar exactamente iguales al nuevo proyecto
- ✅ Publicar después de importar datos
- ✅ Verificar que no hay advertencias de seguridad

---

## 📊 RESUMEN DE CAMBIOS REQUERIDOS

### En el Código (src/firebase.js)

```javascript
// ANTES:
const firebaseConfig = {
  apiKey: "AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4",
  authDomain: "inventario-equipos-f67f9.firebaseapp.com",
  projectId: "inventario-equipos-f67f9",
  storageBucket: "inventario-equipos-f67f9.firebasestorage.app",
  messagingSenderId: "1056879976158",
  appId: "1:1056879976158:web:3f8c86fcd91cee3b5aec4f"
};

// DESPUÉS (reemplazar todos estos valores):
const firebaseConfig = {
  apiKey: "[NUEVO VALUE]",
  authDomain: "[NUEVO VALUE]",
  projectId: "[NUEVO VALUE]",
  storageBucket: "[NUEVO VALUE]",
  messagingSenderId: "[NUEVO VALUE]",
  appId: "[NUEVO VALUE]"
};
```

### En Variables de Entorno (si aplica - .env)

```env
# ANTES:
VITE_FIREBASE_API_KEY=AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4
VITE_FIREBASE_AUTH_DOMAIN=inventario-equipos-f67f9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inventario-equipos-f67f9
VITE_FIREBASE_STORAGE_BUCKET=inventario-equipos-f67f9.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1056879976158
VITE_FIREBASE_APP_ID=1:1056879976158:web:3f8c86fcd91cee3b5aec4f

# DESPUÉS (actualizar estos valores):
VITE_FIREBASE_API_KEY=[NUEVO VALUE]
VITE_FIREBASE_AUTH_DOMAIN=[NUEVO VALUE]
VITE_FIREBASE_PROJECT_ID=[NUEVO VALUE]
VITE_FIREBASE_STORAGE_BUCKET=[NUEVO VALUE]
VITE_FIREBASE_MESSAGING_SENDER_ID=[NUEVO VALUE]
VITE_FIREBASE_APP_ID=[NUEVO VALUE]
```

---

## ✅ CHECKLIST DE ACTUALIZACIONES

Después de obtener las nuevas credenciales:

- [ ] Abre `src/firebase.js`
- [ ] Reemplaza `apiKey` ← Nuevo valor
- [ ] Reemplaza `authDomain` ← Nuevo valor
- [ ] Reemplaza `projectId` ← Nuevo valor
- [ ] Reemplaza `storageBucket` ← Nuevo valor
- [ ] Reemplaza `messagingSenderId` ← Nuevo valor
- [ ] Reemplaza `appId` ← Nuevo valor
- [ ] Guarda el archivo
- [ ] Ejecuta `npm run dev` y verifica sin errores
- [ ] Prueba login con Google/Microsoft/Email
- [ ] Verifica que ve datos de Firestore

---

## 🔒 SEGURIDAD: COSAS A RECORDAR

### ✅ SAFE - Lo que SÍ debes hacer:
- ✅ Guardar credenciales en 1Password/LastPass
- ✅ Compartir credenciales con equipo de confianza únicamente
- ✅ Usar HTTPS en producción
- ✅ Regenerar API Keys si se comprometen
- ✅ Usar diferentes keys para dev/prod (opcional pero recomendado)

### ❌ NO SEGURO - Lo que NO debes hacer:
- ❌ Subir credenciales a GitHub
- ❌ Compartir en Slack/Email sin encriptar
- ❌ Dejar en pantallas públicas
- ❌ Guardar en archivos .txt sin protección
- ❌ Usar mismas credenciales en múltiples proyectos

---

## 📝 NOTAS DE MIGRACIÓN

### Cambios esperados después de migración:
```
Antes de migración:
- Project ID: inventario-equipos-f67f9
- Auth Domain: inventario-equipos-f67f9.firebaseapp.com
- Usuarios: [lista actual]

Después de migración:
- Project ID: [NUEVO]
- Auth Domain: [NUEVO].firebaseapp.com
- Usuarios: [Mismos usuarios, pero con re-autenticación]
- Data: [IDÉNTICA - migrada completamente]
```

### Impacto en usuarios:
- ⚠️ Usuarios tendrán que hacer login nuevamente
- ✅ Sus datos seguirán siendo los mismos
- ✅ Historial de auditoría se mantiene
- ✅ Permisos se mantienen iguales

---

## 🔄 REVERSIÓN (En caso de problema)

Si algo falla durante la migración:

### Opción 1: Revertir en < 48 hrs
```javascript
// Restaura las credenciales antiguas
const firebaseConfig = {
  apiKey: "AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4",  // Original
  authDomain: "inventario-equipos-f67f9.firebaseapp.com",
  projectId: "inventario-equipos-f67f9",
  storageBucket: "inventario-equipos-f67f9.firebasestorage.app",
  messagingSenderId: "1056879976158",
  appId: "1:1056879976158:web:3f8c86fcd91cee3b5aec4f"
};

// Guarda y deploy
// Usuarios pueden volver a logearse
```

### Opción 2: Mantener ambos proyectos (48+ hrs)
- Proyecto antiguo: Activo como fallback
- Proyecto nuevo: En transición
- Después de 48 hrs validado: Eliminar proyecto antiguo

---

## 📞 VALIDACIÓN POST-ACTUALIZACIÓN

Después de actualizar `firebase.js`:

```bash
# 1. Verifica que compila sin errores
npm run build
# ✅ Should complete without errors

# 2. Inicia desarrollo
npm run dev
# ✅ Should start on localhost:5173

# 3. Abre en navegador
# ✅ Should load without errors

# 4. Prueba login
# ✅ Try: Google, Microsoft, Email

# 5. Verifica datos
# ✅ You should see: Equipos, Asignaciones, etc.
```

---

## 📋 PLANTILLA FINAL: COPIA Y PEGA

Cuando tengas las nuevas credenciales, copia/pega esto en `src/firebase.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase - Nueva Cuenta (equiposinventario8@gmail.com)
const firebaseConfig = {
  apiKey: "[REEMPLAZA CON TU NUEVO API KEY]",
  authDomain: "[REEMPLAZA CON TU NUEVO AUTH DOMAIN]",
  projectId: "[REEMPLAZA CON TU NUEVO PROJECT ID]",
  storageBucket: "[REEMPLAZA CON TU NUEVO STORAGE BUCKET]",
  messagingSenderId: "[REEMPLAZA CON TU NUEVO MESSAGING SENDER ID]",
  appId: "[REEMPLAZA CON TU NUEVO APP ID]"
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

---

## ✅ MARCA CUANDO COMPLETES

- [ ] Obtuve nuevas credenciales de Firebase
- [ ] Guardé credenciales en lugar seguro
- [ ] Actualicé `src/firebase.js`
- [ ] Compilé sin errores: `npm run build`
- [ ] Probé en desarrollo: `npm run dev`
- [ ] Probé login (todos los métodos)
- [ ] Verifiqué que veo datos corretos
- [ ] Hice commit del cambio: `git commit -m "chore: update firebase config"`
- [ ] Estoy listo para deploy: ✅ SÍ / ❌ NO

---

**Documento Creado:** 16 de Enero de 2026  
**Versión:** 1.0  
**Clasificación:** 🔒 Credenciales Sensibles  
**Usar para:** Migración Firebase  
**Eliminar después de:** Migración completada + 30 días
