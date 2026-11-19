# Sistema de Inventario de Equipos de Oficina

Aplicación web SPA para gestionar el inventario de equipos de oficina, nomenclaturas (NetBios Names) y formularios de entrega.

## 🚀 Características

- **Módulo Equipos**: Registra nuevos equipos con información completa (marca, modelo, S/N, especificaciones)
- **Módulo Nomenclaturas**: Gestiona NetBios Names con validación de máximo 14 caracteres
- **Módulo Asignación**: Registra asignaciones de equipos a empleados con auto-completado de datos
- **Módulo Hoja de Entrega**: Genera formularios de entrega en PDF listos para imprimir
- **Autenticación**: Sistema seguro con Google Sign-In via Firebase
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS

## 📋 Requisitos Previos

- Node.js (v20.19+ o v22.12+)
- npm o yarn
- Cuenta de Firebase con autenticación Google habilitada

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd Inventario-equipos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Activa Firestore Database
   - Habilita Google Sign-In en Authentication
   - Copia las credenciales

4. **Configurar variables de entorno**
   - Copia `.env.example` a `.env.local`
   - Reemplaza los valores con tus credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

## 🏃 Ejecución

### Modo Desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:5173`

### Compilar para Producción
```bash
npm run build
```

### Ejecutar pruebas
```bash
npm test
```

### Vista Previa de Producción
```bash
npm run preview
```

## 📊 Estructura de la Base de Datos (Firestore)

### Colección: `equipos`
- `codActivoFijo`: string
- `marca`: string (Lenovo, Dell, HP)
- `modelo`: string
- `sn`: string (ServiceTAG)
- `disco`: string (512 GB, 1 TB, 2 TB)
- `memoria`: string (16 GB, 32 GB, etc)
- `procesador`: string
- `so`: string (Sistema Operativo)
- `licencia`: string
- `registradoPor`: string
- `fechaRegistro`: timestamp

### Colección: `nomenclaturas`
- `netbiosName`: string (máximo 14 caracteres)
- `registradoPor`: string
- `fechaRegistro`: timestamp

### Colección: `asignaciones`
- `sucursal`: string
- `oficina`: string
- `puesto`: string
- `nombre`: string (nombre del empleado)
- `usuario`: string
- `equipo`: string (referencia al equipo)
- `codActivoFijo`: string
- `netbiosName`: string
- `marca`: string
- `modelo`: string
- `sn`: string
- `disco`: string
- `memoria`: string
- `procesador`: string
- `so`: string
- `licencia`: string
- `fechaAsignacion`: string
- `asignadoPor`: string
- `hojaEntregaUrl`: string (link de OneDrive)
- `fechaRegistro`: timestamp

## 🎯 Guía de Uso

### 1. Registrar Equipos
1. Ve al módulo **Equipos**
2. Completa el formulario con la información del nuevo equipo
3. Haz clic en "Registrar Equipo"

### 2. Crear Nomenclaturas
1. Ve al módulo **Nomenclaturas**
2. Ingresa el NetBios Name (máximo 14 caracteres)
3. El sistema validará automáticamente la longitud
4. Haz clic en "Registrar NetBios"

### 3. Asignar Equipos
1. Ve al módulo **Asignación**
2. Completa la información del colaborador
3. Selecciona un equipo (los datos se auto-completarán)
4. Selecciona o deja vacío el NetBios Name
5. Haz clic en "Registrar Asignación"

### 4. Generar Hoja de Entrega
1. Ve al módulo **Hoja de Entrega**
2. Busca la asignación por nombre o usuario
3. Selecciona la asignación
4. Haz clic en "Descargar PDF" o "Imprimir"

## 🛠️ Tecnologías Utilizadas

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Backend**: Firebase
- **Autenticación**: Firebase Auth + Google Provider
- **Base de Datos**: Firestore
- **PDF Generation**: jsPDF + html2canvas
- **Routing**: React Router DOM

## 📦 Dependencias Principales

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "firebase": "^11.0.0",
  "react-router-dom": "^7.0.0",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "tailwindcss": "^3.4.1"
}
```

## 🔒 Seguridad

- Autenticación requerida para acceder a la aplicación
- Solo usuarios autenticados pueden ver y editar datos
- Validación de datos en cliente y servidor (Firestore Rules recomendado)

## 📝 Notas Importantes

- **Nomenclaturas**: Máximo 14 caracteres. Se valida en tiempo real.
- **Equipos**: Una vez registrados, pueden ser asignados a múltiples usuarios
- **PDF**: El formato de la hoja de entrega coincide con el documento proporcionado
- **OneDrive**: El campo de URL de hoja de entrega es opcional

## 🐛 Troubleshooting

### Error de autenticación Firebase
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que Google Sign-In está habilitado en Firebase Console

### La aplicación no carga datos
- Verifica que Firestore Database esté activo en Firebase
- Comprueba las reglas de seguridad de Firestore

### Problemas al generar PDF
- Asegúrate de que html2canvas y jsPDF están correctamente instalados
- Prueba en un navegador moderno (Chrome, Firefox, Edge)

## 👨‍💻 Autor

Sistema desarrollado para gestión de inventario de equipos de oficina.

## 📄 Licencia

Este proyecto es de uso interno de la empresa.
