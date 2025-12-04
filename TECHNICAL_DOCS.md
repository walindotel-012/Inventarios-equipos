# 📋 Documentación Técnica - Sistema de Inventario de Equipos

## 1. Arquitectura General

```
┌─────────────────────────────────────────┐
│        Aplicación React (Vite)          │
│                                         │
├─────────────────────────────────────────┤
│  Páginas (Pages)                        │
│  • Login                                │
│  • Dashboard                            │
│  • Equipos                              │
│  • Nomenclaturas                        │
│  • Asignación                           │
│  • HojaEntrega                          │
├─────────────────────────────────────────┤
│  Contextos (Contexts)                   │
│  • AuthContext (Gestión de usuario)     │
├─────────────────────────────────────────┤
│  Componentes (Components)               │
│  • Navbar                               │
├─────────────────────────────────────────┤
│  Firebase                               │
│  • Authentication (Google Sign-In)      │
│  • Firestore (Base de Datos)            │
└─────────────────────────────────────────┘
```

## 2. Flujo de Datos

### Autenticación
```
Usuario → Google Sign-In → Firebase Auth → AuthContext → Protected Routes
```

### Gestión de Equipos
```
Formulario Equipo → Firestore Collection:equipos → getDocs() → Tabla
```

### Asignación
```
Seleccionar Equipo → Auto-llenar datos → Asignación → Firestore Collection:asignaciones
```

### Hoja de Entrega
```
Buscar Asignación → Renderizar Formulario → html2canvas → jsPDF → Descargar/Imprimir
```

## 3. Stack Tecnológico Detallado

### Frontend
- **React 19**: Framework principal
- **React Router DOM 7**: Navegación entre páginas
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Estilos y diseño responsive
- **PostCSS + Autoprefixer**: Procesamiento de CSS

### Backend / BaaS
- **Firebase SDK 11**: Integración con servicios de Google
- **Firestore**: Base de datos NoSQL en tiempo real
- **Firebase Auth**: Autenticación

### Librerías Utilitarias
- **jsPDF 2.5**: Generación de PDFs
- **html2canvas 1.4**: Captura de HTML a imagen
- **ESLint**: Linting y código limpio

## 4. Estructura de Carpetas

```
Inventario-equipos/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   └── Navbar.jsx       # Barra de navegación
│   ├── contexts/            # Contextos de React
│   │   └── AuthContext.jsx  # Contexto de autenticación
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Equipos.jsx
│   │   ├── Nomenclaturas.jsx
│   │   ├── Asignacion.jsx
│   │   └── HojaEntrega.jsx
│   ├── utils/               # Utilidades y helpers
│   │   └── helpers.js
│   ├── firebase.js          # Configuración de Firebase
│   ├── constants.js         # Constantes de la app
│   ├── App.jsx              # Componente raíz
│   ├── App.css              # Estilos globales
│   ├── index.css            # CSS base + Tailwind
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── .env.local               # Variables de entorno (local)
├── .env.example             # Template de variables
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
├── vite.config.js           # Configuración de Vite
├── package.json             # Dependencias y scripts
└── README.md                # Documentación
```

## 5. Componentes Principales

### AuthContext.jsx
**Responsabilidades:**
- Gestionar el estado de autenticación
- Proporcionar acceso a usuario actual
- Manejar login/logout
- Loading state

**Exports:**
- `AuthProvider`: Componente wrapper
- `useAuth()`: Hook custom

### App.jsx
**Responsabilidades:**
- Enrutamiento principal
- Rutas protegidas
- Layout general

**Rutas:**
- `/login` - Página de inicio de sesión
- `/` - Dashboard
- `/equipos` - Gestión de equipos
- `/nomenclaturas` - Gestión de NetBios
- `/asignacion` - Asignación de equipos
- `/hoja-entrega` - Generación de formularios

### Páginas

#### Equipos.jsx
**Estado Local:**
- `equipos`: Array de equipos
- `formData`: Datos del formulario
- `loading`: Estado de carga

**Operaciones:**
- CREATE: Agregar nuevo equipo
- READ: Listar equipos
- DELETE: Eliminar equipo

#### Nomenclaturas.jsx
**Validación:**
- Máximo 14 caracteres
- No duplicados
- Auto-uppercase

**Operaciones:**
- CREATE: Agregar NetBios Name
- READ: Listar nomenclaturas
- DELETE: Eliminar nomenclatura

#### Asignacion.jsx
**Características:**
- Auto-completado de datos de equipo
- Búsqueda en tiempo real
- Relación entre tablas
- Link a OneDrive

**Operaciones:**
- CREATE: Nueva asignación
- READ: Listar asignaciones
- DELETE: Eliminar asignación

#### HojaEntrega.jsx
**Características:**
- Búsqueda de asignaciones
- Vista previa en tiempo real
- Generación PDF
- Impresión directa
- Formato personalizado

**Librerías:**
- html2canvas: Captura del formulario
- jsPDF: Creación del PDF

## 6. Integración Firebase

### Inicialización
```javascript
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

### Operaciones Comunes

#### Agregar documento
```javascript
await addDoc(collection(db, 'equipos'), {
  ...formData,
  fechaRegistro: new Date(),
});
```

#### Obtener documentos
```javascript
const querySnapshot = await getDocs(collection(db, 'equipos'));
const lista = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

#### Eliminar documento
```javascript
await deleteDoc(doc(db, 'equipos', id));
```

## 7. Validaciones Implementadas

### Equipos
- ✓ Todos los campos requeridos
- ✓ Código Activo Fijo de lista predefinida
- ✓ Marca de opciones limitadas
- ✓ S/N único recomendado

### Nomenclaturas
- ✓ Máximo 14 caracteres (validación en tiempo real)
- ✓ No duplicados
- ✓ Auto-uppercase
- ✓ Mensaje de error específico

### Asignación
- ✓ Sucursal, oficina, puesto requeridos
- ✓ Nombre y usuario requeridos
- ✓ Equipo requerido
- ✓ Auto-completado de especificaciones

## 8. Estilos con Tailwind

### Sistema de Colores
- **Primary**: Blue (bg-blue-600, text-blue-600)
- **Success**: Green (bg-green-600)
- **Danger**: Red (bg-red-600)
- **Warning**: Orange (bg-orange-600)
- **Info**: Purple (bg-purple-600)

### Componentes Tailwind Usados
- Grid: Layouts responsive
- Flexbox: Alineación de contenido
- Space: Espaciado consistente
- Border: Divisiones y bordes
- Shadow: Profundidad visual
- Hover: Estados interactivos
- Responsive: Mobile-first approach

## 9. Generación de PDFs

### Proceso
1. **html2canvas**: Captura el HTML del formulario como canvas
2. **jsPDF**: Crea documento PDF desde la imagen
3. **Descargar**: Genera descarga automática

```javascript
const canvas = await html2canvas(printRef.current, {
  scale: 2,
  backgroundColor: '#ffffff',
});

const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'letter',
});

const imgData = canvas.toDataURL('image/png');
pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
pdf.save(`HojaEntrega_${usuario}.pdf`);
```

## 10. Seguridad

### Autenticación
- Solo usuarios con Google Sign-In pueden acceder
- Token JWT automático de Firebase
- Session management integrado

### Autorización (Recomendado)
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 11. Performance

### Optimizaciones Implementadas
- ✓ Lazy loading de páginas con React Router
- ✓ Code splitting automático de Vite
- ✓ Tailwind CSS purging (solo estilos usados)
- ✓ Carga de datos bajo demanda
- ✓ Caché de Firebase

### Recomendaciones Futuras
- Implementar paginación en tablas grandes
- Agregar filtros y búsqueda mejorada
- Usar virtual scrolling para listas largas
- Implementar service workers para offline

## 12. Testing (Futuro)

Estructura recomendada para tests:
```
__tests__/
  components/
  contexts/
  pages/
  utils/
```

## 13. Despliegue

### Firebase Hosting
```bash
# Instalar CLI
npm install -g firebase-tools

# Login
firebase login

# Configurar proyecto
firebase init

# Deploy
firebase deploy
```

### Variables de Entorno en Producción
Las variables deben estar en:
- Project Settings en Firebase Console
- Variables de entorno del hosting
- O en archivos de configuración seguros

## 14. Roadmap Futuro

- [ ] Exportar datos a Excel
- [ ] Generación de reportes
- [ ] Múltiples usuarios por equipo
- [ ] Historial de asignaciones
- [ ] Sistema de notificaciones
- [ ] Búsqueda avanzada
- [ ] Integración con Active Directory
- [ ] Dashboard de estadísticas
- [ ] API REST personalizada
- [ ] Sincronización offline

## 15. Recursos y Referencias

- [React Documentation](https://react.dev)
- [Vite Guide](https://vite.dev/guide)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas](https://html2canvas.hertzen.com)
