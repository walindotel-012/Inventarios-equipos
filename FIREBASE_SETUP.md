# Guía de Configuración de Firebase

## Pasos para Configurar Firebase

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Crear proyecto"**
3. Ingresa un nombre para el proyecto (ej: "Inventario-Equipos")
4. Acepta los términos y crea el proyecto
5. Espera a que se inicialice

### 2. Registrar la Aplicación Web

1. En el panel del proyecto, haz clic en el ícono de web **"</>"**
2. Ingresa un apodo para tu app (ej: "Inventario Web")
3. Marca la opción de "Hosting"
4. Copia las credenciales que se mostrarán

### 3. Copiar Credenciales

Las credenciales tendrán este formato:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "inventario-equipos.firebaseapp.com",
  projectId: "inventario-equipos",
  storageBucket: "inventario-equipos.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcd1234...",
};
```

### 4. Configurar Variables de Entorno

1. En la raíz del proyecto, copia el archivo `.env.example` a `.env.local`
2. Reemplaza cada valor con tus credenciales:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=inventario-equipos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inventario-equipos
VITE_FIREBASE_STORAGE_BUCKET=inventario-equipos.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234...
```

### 5. Habilitar Google Sign-In

1. En Firebase Console, ve a **Authentication**
2. Haz clic en la pestaña **"Sign-in method"**
3. Habilita **Google**
4. Selecciona tu correo de soporte
5. Guarda

### 6. Crear Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Iniciar en modo de prueba"** (para desarrollo)
4. Elige tu ubicación más cercana
5. Haz clic en **"Crear"**

### 7. Configurar Firestore Rules ⭐ CRÍTICO

**⚠️ IMPORTANTE**: Este paso es OBLIGATORIO. Sin él obtendrás error "Missing or insufficient permissions"

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en la pestaña **"Rules"**
3. **Borra TODO** el contenido actual
4. **Copia y pega** esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura para usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Haz clic en **"Publicar"**
6. **Espera confirmación** (se pondrá verde)
7. ✅ **Listo**

**Para Producción**, usa reglas más restrictivas por colección (ver sección 8)

### 8. Configurar Reglas de Seguridad (Producción)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer y escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 8. Crear Índices (Opcional)

Si usas consultas complejas, Firestore te pedirá crear índices automáticamente.

## Estructura de Colecciones en Firestore

Asegúrate de que se crearán automáticamente, pero puedes pre-crearlas:

### equipos
### nomenclaturas
### asignaciones

## Verificar Conexión

1. Inicia el servidor: `npm run dev`
2. Intenta iniciar sesión con Google
3. Si aparece un error, revisa la consola del navegador (F12)

## Troubleshooting

### "Auth.googleapis.com is not authorized"
- Verifica que el dominio está en lista blanca en Firebase
- Ve a Project Settings → Authorized domains
- Agrega tu dominio local (ej: localhost:5173)

### "Firestore is not initialized"
- Verifica que `VITE_FIREBASE_PROJECT_ID` es correcto
- Comprueba que Firestore Database está activo

### "No hay credenciales"
- Verifica que `.env.local` existe en la raíz
- Asegúrate de que npm run dev está ejecutándose después de crear `.env.local`
- Reinicia el servidor

## Recursos Útiles

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
