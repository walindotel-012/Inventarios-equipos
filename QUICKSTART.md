# 🚀 INICIO RÁPIDO - Sistema de Inventario de Equipos

## ✅ Lo que se ha implementado

Tu aplicación está **100% lista** con las siguientes características:

### 📦 Módulo de Equipos
- ✅ Registro de nuevos equipos
- ✅ Almacenamiento en Firestore
- ✅ Listado con tabla responsive
- ✅ Eliminación de equipos
- **Datos**: Código Activo Fijo (dropdown), Marca, Modelo, S/N, Disco, Memoria, Procesador, S.O, Licencia

### 📝 Módulo de Nomenclaturas
- ✅ Registro de NetBios Names
- ✅ **Validación automática**: Máximo 14 caracteres
- ✅ Mensaje de error: "No se pueden guardar más de 14 caracteres intenté nuevamente"
- ✅ Contador en tiempo real
- ✅ Prevención de duplicados

### 📋 Módulo de Asignación
- ✅ Registro de asignaciones de equipos a empleados
- ✅ Auto-completado de datos del equipo
- ✅ Selección de NetBios Name
- ✅ Link a OneDrive para hoja de entrega
- **Datos capturados**: Sucursal, Oficina, Departamento, Puesto, Nombre, Usuario, Equipo, Código Activo Fijo, NetBios Name, Marca, Modelo, S/N, Disco, Memoria, Procesador, S.O, Licencia, Fecha de asignación, Asignado por

### 📄 Módulo de Hoja de Entrega
- ✅ Búsqueda de asignaciones por nombre o usuario
- ✅ Vista previa del formulario
- ✅ **Generación de PDF** con descarga automática
- ✅ **Impresión directa** desde navegador
- ✅ Formato personalizado idéntico al documento proporcionado
- ✅ Auto-llenado con datos de la asignación

### 🔐 Autenticación
- ✅ Google Sign-In implementado
- ✅ Firebase Authentication configurada
- ✅ Rutas protegidas
- ✅ Cierre de sesión

### 🎨 Tecnología
- ✅ React 19 + Vite
- ✅ HTML semántico
- ✅ Tailwind CSS (diseño responsive)
- ✅ Firebase Firestore
- ✅ jsPDF para generación de PDFs

---

## 🔧 CONFIGURACIÓN REQUERIDA

### Paso 1: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Obtén las credenciales de tu aplicación web
4. Copia el archivo `.env.example` a `.env.local`
5. **Completa los valores** en `.env.local`:

```env
VITE_FIREBASE_API_KEY=Tu_API_Key_Aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

**Para instrucciones detalladas**: Lee el archivo `FIREBASE_SETUP.md`

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Iniciar la Aplicación

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
Inventario-equipos/
├── src/
│   ├── pages/                 # Páginas principales (5 módulos)
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Equipos.jsx
│   │   ├── Nomenclaturas.jsx
│   │   ├── Asignacion.jsx
│   │   └── HojaEntrega.jsx
│   ├── components/            # Componentes
│   │   └── Navbar.jsx
│   ├── contexts/              # Context para autenticación
│   │   └── AuthContext.jsx
│   ├── utils/                 # Funciones auxiliares
│   ├── firebase.js            # Configuración de Firebase
│   ├── constants.js           # Constantes de la app
│   └── App.jsx                # Aplicación principal
├── .env.local                 # Variables de entorno (¡COMPLETAR!)
├── package.json               # Dependencias
└── README.md                  # Documentación
```

---

## 📖 Documentación

- **README_ES.md**: Guía general (español)
- **README.md**: Guía general (inglés)
- **FIREBASE_SETUP.md**: Configuración detallada de Firebase
- **TECHNICAL_DOCS.md**: Documentación técnica completa

---

## 🎯 Flujo de Uso

### Para el Usuario Final:

1. **Acceder**: Inicia sesión con Google
2. **Registrar Equipos**: Ve a "Equipos" y agrega los nuevos equipos
3. **Configurar Nomenclaturas**: Ve a "Nomenclaturas" e ingresa los NetBios Names
4. **Asignar**: Ve a "Asignación" y asigna equipos a empleados
5. **Generar Hoja**: Ve a "Hoja de Entrega", busca la asignación e imprime/descarga PDF

### Para el Administrador:

1. Configurar Firebase con credenciales
2. Crear usuarios en Firebase (opcional)
3. Configurar reglas de seguridad en Firestore
4. Desplegar en Firebase Hosting o tu servidor

---

## ⚙️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Compila para producción
npm run preview          # Vista previa de producción

# Validación
npm run lint             # Verifica el código

# Verificación
node verify-setup.mjs    # Verifica la configuración del proyecto
```

---

## 🐛 Solución de Problemas

### Error: "Firebase is not initialized"
- Verifica que `.env.local` existe con valores completos
- Reinicia el servidor después de crear `.env.local`

### Error: "Auth.googleapis.com is not authorized"
- Agrega tu dominio en Firebase Console → Settings → Authorized Domains

### PDF no se descarga
- Prueba en Chrome o Firefox (navegadores modernos)
- Verifica que html2canvas y jsPDF estén instalados: `npm install html2canvas jspdf`

### Firestore sin datos
- Verifica que Firestore Database está activo en Firebase Console
- Comprueba las Firestore Rules permiten lectura/escritura

---

## 📊 Base de Datos (Firestore)

Se crearán automáticamente 3 colecciones:

1. **equipos**: Almacena equipos registrados
2. **nomenclaturas**: Almacena NetBios Names
3. **asignaciones**: Almacena asignaciones de equipos a empleados

---

## 🔒 Seguridad

### Desarrollo (Ya Configurado)
- ✅ Autenticación Google implementada
- ✅ Rutas protegidas

### Producción (Recomendado)
- Configura Firestore Rules para mayor seguridad
- Usa variables de entorno seguras
- Implementa validación en servidor
- Auditoría y logging

---

## 🚀 Próximos Pasos

1. **Configurar Firebase** (PASO 1 - ¡CRÍTICO!)
2. Completar `.env.local`
3. Ejecutar `npm install`
4. Ejecutar `npm run dev`
5. ¡Usar la aplicación!

---

## 💡 Características Destacadas

### ✨ Auto-completado Inteligente
Cuando seleccionas un equipo en "Asignación", los datos se llenan automáticamente:
- Marca, Modelo, S/N
- Disco, Memoria, Procesador
- S.O, Licencia, Código Activo

### 📝 Validación en Tiempo Real
- Nomenclaturas: Cuenta caracteres mientras escribes
- Equipos: Valida que no haya campos vacíos
- Asignación: Verifica integridad de datos

### 🖨️ Generación de PDFs
- Vista previa antes de descargar
- Descarga automática o impresión directa
- Formato idéntico al documento original

### 🔍 Búsqueda Inteligente
- Busca asignaciones por nombre o usuario
- Filtra en tiempo real

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa `FIREBASE_SETUP.md` para configuración
2. Consulta `TECHNICAL_DOCS.md` para detalles técnicos
3. Verifica los logs en la consola del navegador (F12)

---

## 📜 Licencia

Este proyecto es de uso interno de la empresa.

---

**¡Tu aplicación está lista para usar!** 🎉

**El único paso que falta es:**
1. Configurar Firebase (ver FIREBASE_SETUP.md)
2. Completar `.env.local`
3. Ejecutar `npm run dev`

¡Buena suerte! 🚀
