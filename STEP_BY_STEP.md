# 🎯 GUÍA PASO A PASO - Primer Uso

## PARTE 1: Preparación Firebase (10 minutos)

### Paso 1: Crear Proyecto en Firebase

1. **Abre**: https://console.firebase.google.com/
2. **Haz clic**: "Crear un proyecto"
3. **Ingresa nombre**: "Inventario-Equipos" (o similar)
4. **Opciones**:
   - ❌ Deshabilitar Google Analytics (para empezar)
5. **Crea el proyecto** (espera ~1 minuto)

### Paso 2: Registrar Aplicación Web

1. En el panel, haz clic en: `</>`
2. **Apodo**: "Inventario Web" 
3. **Marca**: ✓ Setup Firebase Hosting
4. **Continúa** y copia las credenciales (verás algo así):

```javascript
{
  apiKey: "AIza...",
  authDomain: "inventario-equipos.firebaseapp.com",
  projectId: "inventario-equipos",
  storageBucket: "inventario-equipos.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abc..."
}
```

### Paso 3: Habilitar Google Sign-In

1. Vuelve al dashboard del proyecto
2. **Menú izquierdo**: "Authentication" (Autenticación)
3. **Pestaña**: "Sign-in method"
4. **Busca**: Google
5. **Haz clic**: Google
6. **Habilita**: El switch de "Habilitar"
7. **Email de soporte**: (Tu email de Google)
8. **Guarda**

### Paso 4: Crear Firestore Database

1. **Menú izquierdo**: "Firestore Database"
2. **Botón**: "Crear base de datos"
3. **Modo**: Selecciona "Modo de prueba" (para desarrollo)
4. **Ubicación**: Selecciona la más cercana
5. **Crear** (espera ~1 minuto)

### Paso 5: Configurar Firestore Rules ⭐ CRÍTICO

**⚠️ IMPORTANTE**: Este paso es obligatorio. Sin él obtendrás error "Missing or insufficient permissions"

1. Vuelve al dashboard del proyecto
2. **Menú izquierdo**: "Firestore Database"
3. **Pestaña**: "Rules" (Reglas)
4. **Borra TODO** el contenido actual
5. **Copia y pega** esto:

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

6. **Haz clic**: "Publicar"
7. **Espera** confirmación en verde
8. ✅ **Listo**

**Más info**: Ver archivo `FIRESTORE_RULES_FIX.md`

---

## PARTE 2: Configurar Variables de Entorno (5 minutos)

### Paso 1: Copiar el Template

1. Abre la carpeta: `C:\Users\WuarlinDotel\Inventario-equipos\`
2. Busca el archivo: `.env.example`
3. Cópialo: `CTRL+C`
4. Pega en la misma carpeta: `CTRL+V`
5. Renómbra la copia: `.env.local`
6. Abre `.env.local` con Notepad/VS Code

### Paso 2: Completa los Valores

**En .env.local**, reemplaza cada valor con los datos de Firebase:

```env
VITE_FIREBASE_API_KEY=AIza[tu_api_key]
VITE_FIREBASE_AUTH_DOMAIN=inventario-equipos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inventario-equipos
VITE_FIREBASE_STORAGE_BUCKET=inventario-equipos.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

**Guardar** (`CTRL+S`)

**¡Importante!** No compartas este archivo

**Variables guardadas ✅**

---

## PARTE 3: Instalar Dependencias (5 minutos)

### Paso 1: Abrir Terminal

1. En VS Code o cualquier terminal:
   ```bash
   cd C:\Users\WuarlinDotel\Inventario-equipos
   ```

### Paso 2: Instalar

```bash
npm install
```

*Espera a que termine (verá "added XXX packages" en verde)*

**Instalación completada ✅**

---

## PARTE 4: Iniciar la Aplicación (2 minutos)

### Paso 1: Ejecutar Servidor

```bash
npm run dev
```

Verás algo como:
```
  VITE v7.2.4  ready in 596 ms
  ➜  Local:   http://localhost:5173/
```

### Paso 2: Abrir en Navegador

1. **Abre**: http://localhost:5173/
2. Deberías ver una pantalla de **"Iniciar sesión con Google"**

**Servidor activo ✅**

---

## PARTE 5: Primer Acceso (2 minutos)

### Paso 1: Iniciar Sesión

1. **Botón**: "Iniciar sesión con Google"
2. **Selecciona**: Tu cuenta de Google
3. **Autoriza**: La aplicación

### Paso 2: Dashboard

Verás el Panel de Control con 4 tarjetas:
- Equipos Registrados
- Nomenclaturas
- Asignaciones
- Hojas de Entrega

**¡Autenticado ✅**

---

## PARTE 6: Usar los Módulos (10-15 minutos)

### 1️⃣ REGISTRAR UN EQUIPO

**Ruta**: Click en "Equipos" (Menú superior)

**Pasos**:
1. Completa el formulario:
   - Código Activo Fijo: `ATM01-ATM-150`
   - Marca: `Lenovo`
   - Modelo: `ThinkPad E15`
   - S/N: `SN123ABC`
   - Disco: `1 TB`
   - Memoria: `16 GB`
   - Procesador: `Intel Core i7`
   - S.O: `Windows 11 Pro`
   - Licencia: `Licencia Corporativa`

2. Click: "Registrar Equipo"
3. ¡Aparecerá en la tabla!

**✅ Equipo registrado**

### 2️⃣ CREAR NOMENCLATURA (NetBios)

**Ruta**: Click en "Nomenclaturas"

**Pasos**:
1. Ingresa: `DESKTOP-ADMIN`
2. Verás el contador: `11/14`
3. Click: "Registrar NetBios"
4. ¡Aparecerá en la lista!

**💡 Prueba**: Intenta poner 15 caracteres → Error controlado

**✅ Nomenclatura registrada**

### 3️⃣ ASIGNAR EQUIPO A EMPLEADO

**Ruta**: Click en "Asignación"

**Pasos**:
1. Completa Datos del Empleado:
   - Sucursal: `Bogotá`
   - Oficina: `Principal`
   - Puesto: `Analista TI`
   - Nombre: `Juan Pérez`
   - Usuario: `jperez`

2. Selecciona Equipo: `Lenovo ThinkPad E15 (ATM01-ATM-150)`
   → Los datos se llenan automáticamente ✨

3. Selecciona NetBios: `DESKTOP-ADMIN`

4. Click: "Registrar Asignación"

**✅ Asignación creada**

### 4️⃣ GENERAR HOJA DE ENTREGA

**Ruta**: Click en "Hoja de Entrega"

**Pasos**:
1. **Busca**: Escribe "Juan" o "jperez" en el buscador
2. **Selecciona**: La asignación (se resaltará en azul)
3. Ves la **vista previa** del formulario
4. **Opciones**:
   - `📥 Descargar PDF`: Descarga el archivo
   - `🖨️ Imprimir`: Imprime directamente

**✅ PDF generado**

---

## PARTE 7: Punto de Control

### ✅ ¿Funciona todo?

Verifica:
- [ ] Google Sign-In funciona
- [ ] Puedes registrar equipos
- [ ] La validación de 14 caracteres funciona
- [ ] Se auto-completan los datos
- [ ] Puedes generar PDF

Si todo está ✅ → **¡ÉXITO!**

Si hay ❌ → Revisa los logs (F12 en navegador)

---

## PARTE 8: Solución de Problemas

### Error: "Firebase is not initialized"
```
✓ Verifica que .env.local existe
✓ Verifica que los valores están completos
✓ Reinicia: Presiona CTRL+C en terminal y ejecuta npm run dev de nuevo
```

### Error: "Auth.googleapis.com is not authorized"
```
✓ Ve a Firebase Console
✓ Project Settings → Authorized Domains
✓ Agrega: localhost:5173
✓ Espera 2-5 minutos
```

### Error: Firestore sin datos
```
✓ Ve a Firebase Console
✓ Firestore Database → Verifica que está "ACTIVO"
✓ Si está en "Error", intenta crear de nuevo
```

### El PDF no se descarga
```
✓ Prueba con Chrome o Firefox
✓ Verifica que hay una asignación registrada
✓ Selecciona la asignación (debe estar resaltada)
```

---

## PARTE 9: Próximos Pasos

### Para Desarrollo
- Personaliza las opciones de dropdowns en `src/constants.js`
- Agrega más campos si es necesario
- Crea usuarios de prueba en Firebase

### Para Producción
1. `npm run build`
2. Copia la carpeta `dist/` a tu servidor
3. O usa Firebase Hosting: `firebase deploy`

### Agregar Usuarios Reales
1. Comparte la URL con tus compañeros
2. Ellos se registran con Google
3. ¡Empezarán a ver datos!

---

## PARTE 10: Recursos de Ayuda

📖 **Documentos disponibles**:
1. `QUICKSTART.md` - Inicio rápido general
2. `FIREBASE_SETUP.md` - Detalles de Firebase
3. `TECHNICAL_DOCS.md` - Arquitectura y código
4. `QUICK_REFERENCE.md` - Referencia rápida

🔗 **Links útiles**:
- Firebase Console: https://console.firebase.google.com/
- Tailwind CSS: https://tailwindcss.com
- React Docs: https://react.dev

---

## ✅ CHECKLIST FINAL

- [ ] Firebase creado
- [ ] Credenciales en `.env.local`
- [ ] `npm install` completado
- [ ] `npm run dev` ejecutándose
- [ ] Puedo iniciar sesión con Google
- [ ] Registré un equipo
- [ ] Registré una nomenclatura
- [ ] Hice una asignación
- [ ] Descargué/Imprimí un PDF

**¡Si todos están ✅ = ÉXITO! 🎉**

---

## 🎯 RESUMEN

| Paso | Tiempo | Acción |
|------|--------|--------|
| 1 | 10 min | Configurar Firebase |
| 2 | 5 min | Completar `.env.local` |
| 3 | 5 min | `npm install` |
| 4 | 2 min | `npm run dev` |
| 5 | 2 min | Acceder a http://localhost:5173 |
| 6 | 15 min | Probar los 4 módulos |
| **TOTAL** | **~40 min** | ✅ **LISTO** |

---

**¡Ahora estás listo para usar el sistema! 🚀**

Si tienes dudas, revisa los documentos de ayuda o los logs del navegador (F12).

¡Buena suerte! 💪
