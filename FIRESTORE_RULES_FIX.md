# 🔐 SOLUCIÓN: Configurar Firestore Rules

## El Problema

Ves este error:
```
FirebaseError: Missing or insufficient permissions.
```

**Causa**: Firestore tiene reglas de seguridad que deniegan acceso.

---

## ✅ SOLUCIÓN (3 PASOS)

### Paso 1: Ir a Firebase Console

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **inventario-equipos-f67f9**
3. Menú izquierdo → **Firestore Database**
4. Pestaña → **Rules** (Reglas)

### Paso 2: Reemplazar las Reglas

Borra TODO lo que está en el editor de reglas y copia esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura para usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Colecciones específicas
    match /equipos/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /celulares/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /asignaciones/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /descargos/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /nomenclaturas/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Paso 3: Publicar

1. Haz clic en: **Publicar**
2. Espera confirmación (verde)
3. ¡Listo!

---

## 🧪 PRUEBA QUE FUNCIONA

1. Vuelve a tu app en `http://localhost:5173`
2. Recarga la página (F5)
3. Intenta registrar un equipo
4. ¡Debería funcionar! ✅

---

## ⚠️ IMPORTANTE (SEGURIDAD PARA PRODUCCIÓN)

**Lo que acabas de hacer es para DESARROLLO.**

Para **PRODUCCIÓN**, usa reglas más restrictivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /equipos/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /nomenclaturas/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /asignaciones/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🎉 DESPUÉS DE ESTO

Todo debería funcionar perfectamente:
- ✅ Registrar equipos
- ✅ Crear nomenclaturas
- ✅ Hacer asignaciones
- ✅ Generar PDFs

---

## ❓ SI AÚN NO FUNCIONA

1. Verifica en la consola del navegador (F12)
2. Busca el error específico
3. Revisa que guardaste las reglas
4. Recarga la página (F5)
5. Intenta de nuevo

---

**¡Esto debería resolver tu problema! 🚀**
