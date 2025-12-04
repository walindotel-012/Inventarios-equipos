# 🆘 SOLUCIÓN RÁPIDA: Error "Missing or insufficient permissions"

## El Error

Ves esto en la consola del navegador:
```
FirebaseError: Missing or insufficient permissions.
```

Y aparece cuando intentas:
- Registrar un equipo
- Crear una nomenclatura
- Hacer una asignación
- Generar un PDF

---

## ✅ SOLUCIÓN (3 CLICS)

### Paso 1: Abre Firebase Console
**URL**: https://console.firebase.google.com/

### Paso 2: Busca tu proyecto
Haz clic en: **inventario-equipos-f67f9**

### Paso 3: Ve a Firestore Rules

En el menú izquierdo:
```
Firestore Database → Pestaña "Rules"
```

---

## 🔧 REEMPLAZA EL CONTENIDO

Borra TODO lo que ves en el editor.

Copia y pega EXACTAMENTE esto:

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

## 🚀 PUBLICA

Haz clic en el botón: **"Publicar"**

Espera a ver este mensaje:
```
Rules updated successfully
```

En color **VERDE** ✅

---

## 🧪 VERIFICA QUE FUNCIONA

1. Vuelve a tu app
2. Recarga la página (F5)
3. Intenta registrar un equipo
4. ¡Debería funcionar!

---

## ❓ SI SIGUE SIN FUNCIONAR

1. Abre la consola del navegador (F12)
2. Busca el error exacto
3. Verifica que publicaste correctamente (verde)
4. Recarga (F5)
5. Intenta de nuevo

---

## 📝 QUE SIGNIFICA

Lo que acabas de hacer:

- **Permitir**: Cualquier usuario autenticado (con Google)
- **Leer/Escribir**: En todas las colecciones
- **En Firestore**: Base de datos en la nube

Es **seguro para desarrollo**. En producción necesitarás reglas más específicas.

---

## 🎯 RESUMEN

| Paso | Acción |
|------|--------|
| 1 | Abre Firebase Console |
| 2 | Ve a Firestore Database → Rules |
| 3 | Borra todo |
| 4 | Copia el código arriba |
| 5 | Haz clic Publicar |
| 6 | Espera verde |
| 7 | ¡Listo! |

---

**Tiempo: 2 minutos** ⏱️

**Resultado: Error solucionado** ✅
