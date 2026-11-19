# 📞 REFERENCIA RÁPIDA - Inventario de Equipos

## ⏱️ 5 MINUTOS PARA EMPEZAR

### 1️⃣ Configurar Firebase (2 min)
```
1. Ve a: https://console.firebase.google.com/
2. Crea proyecto
3. Web app → Copia credenciales
4. Ve a: Authentication → Google Sign-In → Habilita
5. Ve a: Firestore Database → Crear
```

### 2️⃣ Configurar Proyecto (1 min)
```bash
# En la carpeta del proyecto
cp .env.example .env.local
# Abre .env.local y completa los valores
```

### 3️⃣ Instalar y Ejecutar (2 min)
```bash
npm install
npm run dev
```

### 4️⃣ Acceder
```
http://localhost:5173
Usa: Google Sign-In
```

✅ ¡LISTO!

---

## 🎯 UBICACIÓN DE ARCHIVOS IMPORTANTES

| Archivo | Ubicación | Propósito |
|---------|-----------|----------|
| Login | `src/pages/Login.jsx` | Autenticación Google |
| Dashboard | `src/pages/Dashboard.jsx` | Inicio |
| Equipos | `src/pages/Equipos.jsx` | Módulo 1 |
| Nomenclaturas | `src/pages/Nomenclaturas.jsx` | Módulo 2 |
| Asignación | `src/pages/Asignacion.jsx` | Módulo 3 |
| Hoja Entrega | `src/pages/HojaEntrega.jsx` | Módulo 4 |
| Firebase Config | `src/firebase.js` | Variables env |
| Rutas Protegidas | `src/App.jsx` | Auth check |
| Estilos | `src/index.css` | Tailwind |

---

## 🔧 VARIABILIZAR FIREBASE

Completa en `.env.local`:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 📋 MÓDULOS

### Módulo 1: EQUIPOS
```
INPUT: Código Fijo, Marca, Modelo, S/N, Disco, Memoria, CPU, SO
STORAGE: Firestore → equipos
OUTPUT: Tabla de equipos registrados
```

### Módulo 2: NOMENCLATURAS
```
INPUT: NetBios Name (max 14 caracteres)
VALIDATION: Auto-cuenta, error si > 14
STORAGE: Firestore → nomenclaturas
OUTPUT: Lista de nomenclaturas
```

### Módulo 3: ASIGNACIÓN
```
INPUT: Sucursal, Oficina, Puesto, Nombre, Usuario, Equipo
AUTO-FILL: Datos del equipo
STORAGE: Firestore → asignaciones
OUTPUT: Tabla de asignaciones
```

### Módulo 4: HOJA ENTREGA
```
SEARCH: Nombre o Usuario
SELECT: Asignación
RENDER: Formulario con datos
OUTPUT: PDF descargable o imprimible
```

---

## 🚀 COMANDOS

```bash
npm run dev      # Desarrollo
npm run build    # Compilar
npm run preview  # Preview
npm run lint     # Validar
```

---

## 📊 FIRESTORE COLLECTIONS

```
equipos/
  - codActivoFijo: string
  - marca: string
  - modelo: string
  - sn: string
  - disco: string
  - memoria: string
  - procesador: string
  - so: string
  - licencia: string

nomenclaturas/
  - netbiosName: string (max 14)

asignaciones/
  - (todos los datos de equipos + datos empleado)
  - fechaAsignacion: date
  - hojaEntregaUrl: string (opcional)
```

---

## 🔒 SEGURIDAD

```
Login → Google Auth → Token JWT → Protected Routes
       ↓
    Firebase Firestore
```

---

## 🐛 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| Firebase undefined | Completa `.env.local` y reinicia |
| Auth error | Agrega dominio en Firebase Settings |
| PDF no carga | Usa Chrome/Firefox |
| Firestore vacío | Activa Firestore DB en Firebase |

---

## 📚 DOCUMENTACIÓN

- **QUICKSTART.md** - Inicio rápido
- **FIREBASE_SETUP.md** - Firebase detallado
- **TECHNICAL_DOCS.md** - Arquitectura
- **README_ES.md** - Guía completa

---

## 💬 FUNCIONALIDADES CLAVE

✅ Google Sign-In
✅ Almacenamiento en Firestore
✅ Auto-completado de datos
✅ Validación de 14 caracteres
✅ Generación de PDFs
✅ Diseño Responsive
✅ Búsqueda inteligente

---

## 🎨 NAVEGACIÓN

```
Login
  ↓
Dashboard
  ├── Equipos
  ├── Nomenclaturas
  ├── Asignación
  └── Hoja Entrega
```

---

## ⚙️ STACK

- React 19
- Vite 7
- Tailwind CSS
- Firebase Auth
- Firestore
- jsPDF

---

## 📞 SOPORTE RÁPIDO

1. Revisa `FIREBASE_SETUP.md` si hay error de Firebase
2. Revisa `TECHNICAL_DOCS.md` para arquitectura
3. Consulta logs del navegador (F12)

---

**¡Anotaciones útiles para referencia rápida! 📌**
