# 🎯 DIAGRAMA DE ARQUITECTURA - Sistema de Inventario

## 1. ARQUITECTURA GENERAL

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    CLIENTE (Frontend)                             │
│                      React 19 + Vite                              │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    APP.JSX (Ruteador)                       │  │
│  │  - Router (React Router v7)                                │  │
│  │  - ProtectedRoute (Rutas protegidas)                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│        ┌─────────────────────┼─────────────────────┐              │
│        │                     │                     │              │
│   ┌────▼───┐         ┌──────▼──────┐         ┌────▼───┐          │
│   │ LOGIN  │         │ PROTECTED   │         │NAVBAR  │          │
│   │ Page   │         │ ROUTES      │         │(Header)│          │
│   └────────┘         │             │         └────────┘          │
│                      │ DASHBOARD   │                              │
│                      │ EQUIPOS     │                              │
│                      │ NOMENCLAT.  │                              │
│                      │ ASIGNACIÓN  │                              │
│                      │ HOJA ENT.   │                              │
│                      └─────────────┘                              │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Context API (AuthContext)                      │  │
│  │  - currentUser                                              │  │
│  │  - loading                                                  │  │
│  │  - logout()                                                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────▼────────────────────────────────────────┐
│                                                                      │
│                   BACKEND (Firebase)                                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Firebase Authentication                          │ │
│  │  - Google OAuth 2.0                                           │ │
│  │  - onAuthStateChanged()                                       │ │
│  │  - signOut()                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │           Firestore (Base de Datos NoSQL)                    │ │
│  │                                                               │ │
│  │  Colección: equipos                                          │ │
│  │  ├── id (auto)                                               │ │
│  │  ├── codActivoFijo                                           │ │
│  │  ├── marca, modelo, sn                                       │ │
│  │  ├── disco, memoria, procesador                              │ │
│  │  └── so, licencia                                            │ │
│  │                                                               │ │
│  │  Colección: nomenclaturas                                    │ │
│  │  ├── id (auto)                                               │ │
│  │  ├── netbiosName (max 14 chars)                              │ │
│  │  └── registradoPor                                           │ │
│  │                                                               │ │
│  │  Colección: asignaciones                                     │ │
│  │  ├── id (auto)                                               │ │
│  │  ├── datos del colaborador                                   │ │
│  │  ├── referencia a equipo (FK)                                │ │
│  │  ├── referencia a nomenclatura (FK)                          │ │
│  │  └── datos de entrega                                        │ │
│  │                                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUJO DE MÓDULOS

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD (Home)                         │
│  - Estadísticas de uso                                          │
│  - Acceso rápido a módulos                                      │
│  - Información de usuario                                       │
└────────┬──────────────────────────────────────────────────────┬─┘
         │                                                       │
    ┌────▼─────┐                                          ┌──────▼───┐
    │           │                                        │           │
    │ EQUIPOS   │                                        │ NAVBAR    │
    │           │                                        │           │
    │ ┌───────┐ │                                        │ - Links   │
    │ │Crear  │ │                                        │ - User    │
    │ │Editar │ │                                        │ - Logout  │
    │ │Eliminar│ │                                        │           │
    │ │Listar │ │                                        └───────────┘
    │ └───────┘ │
    │           │
    │ Auto-ID   │
    │ ATM001+1  │
    └────┬──────┘
         │
    ┌────▼──────────┐       ┌─────────────┐       ┌──────────────┐
    │ NOMENCLATURAS │       │ ASIGNACIÓN  │       │ HOJA ENTREGA │
    │               │       │             │       │              │
    │ ┌───────────┐ │       │ ┌─────────┐ │       │ ┌──────────┐ │
    │ │Crear      │ │       │ │Crear    │ │       │ │Buscar    │ │
    │ │Editar     │ │       │ │Editar   │ │       │ │Ver prev. │ │
    │ │Eliminar   │ │       │ │Eliminar │ │       │ │Descargar │ │
    │ │Listar     │ │       │ │Listar   │ │       │ │Imprimir  │ │
    │ │           │ │       │ └─────────┘ │       │ └──────────┘ │
    │ │Validar:   │ │       │             │       │              │
    │ │- Max 14   │ │       │ Auto-fill:  │       │ PDF con:     │
    │ │- MAYUSC   │ │       │ - Marca     │       │ - Datos cole │
    │ │- No dup   │ │       │ - Modelo    │       │ - Equipo     │
    │ │- Error msg│ │       │ - S/N       │       │ - Signaturas │
    │ └───────────┘ │       │ - Disco     │       │ - Accesorios │
    │               │       │ - Memoria   │       │              │
    └───────────────┘       │ - Procesar  │       └──────────────┘
                            │ - S.O       │
                            │ - Licencia  │
                            │             │
                            │ Filtrado:   │
                            │ - Por nombre│
                            │ - Por user  │
                            └─────────────┘
```

---

## 3. FLUJO DE ESTADO (State Management)

```
┌─────────────────────────────────────────────────────────────┐
│                   AuthContext                               │
│              (Estado Global)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐      ┌───▼────┐      ┌───▼────┐
    │current  │      │loading │      │logout()│
    │user     │      │flag    │      │function│
    └────┬────┘      └───┬────┘      └────────┘
         │                │
         └────────────────┴──────────────────┐
                                            │
                                    ┌───────▼──────┐
                                    │Protegidas:   │
                                    │- Equipos     │
                                    │- Nomenclat   │
                                    │- Asignacion  │
                                    │- HojaEntrega │
                                    │- Dashboard   │
                                    └──────────────┘

┌────────────────────────────────────────────────────────────────┐
│                 Component Local State                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Equipos.jsx:                                                │
│  - equipos []                                                 │
│  - formData {}                                                │
│  - editingId = null                                           │
│  - showForm = false                                           │
│                                                                │
│  Nomenclaturas.jsx:                                           │
│  - nomenclaturas []                                           │
│  - netbiosName = ""                                           │
│  - charCount = 0                                              │
│  - editingId = null                                           │
│                                                                │
│  Asignacion.jsx:                                              │
│  - asignaciones []                                            │
│  - equipos []                                                 │
│  - nomenclaturas []                                           │
│  - formData {} (grande)                                       │
│  - editingId = null                                           │
│                                                                │
│  HojaEntrega.jsx:                                             │
│  - asignaciones []                                            │
│  - searchTerm = ""                                            │
│  - selectedAsignacion = null                                  │
│  - tipoEquipo = "laptop"                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. FLUJO DE DATOS ENTRE COMPONENTES

```
App.jsx (Router)
    │
    ├─→ AuthContext (Proporciona: currentUser, loading, logout)
    │
    ├─→ ProtectedRoute (Valida autenticación)
    │   │
    │   ├─→ Navbar (User info + Navigation)
    │   │
    │   └─→ Routes
    │       ├─→ Dashboard (Home)
    │       │   ├─ Lee: currentUser
    │       │   └─ Navega a otros módulos
    │       │
    │       ├─→ Equipos
    │       │   ├─ Estado: equipos[], formData, editingId, showForm
    │       │   ├─ Lee: currentUser.email (registradoPor)
    │       │   ├─ Escribe: Firestore collection "equipos"
    │       │   └─ Operaciones: CREATE, READ, UPDATE, DELETE
    │       │
    │       ├─→ Nomenclaturas
    │       │   ├─ Estado: nomenclaturas[], netbiosName, charCount
    │       │   ├─ Validación: Max 14 caracteres
    │       │   ├─ Escribe: Firestore collection "nomenclaturas"
    │       │   └─ Operaciones: CREATE, READ, UPDATE, DELETE
    │       │
    │       ├─→ Asignacion
    │       │   ├─ Estado: asignaciones[], equipos[], nomenclaturas[]
    │       │   ├─ Auto-completado: equipo → llena datos
    │       │   ├─ Escribe: Firestore collection "asignaciones"
    │       │   └─ Operaciones: CREATE, READ, UPDATE, DELETE
    │       │
    │       └─→ HojaEntrega
    │           ├─ Lee: asignaciones[]
    │           ├─ Búsqueda: Por nombre o usuario
    │           ├─ Generación: html2canvas + jsPDF
    │           └─ Descarga: PDF a dispositivo local
```

---

## 5. CICLO DE VIDA DE UN REGISTRO (EQUIPOS)

```
START
  │
  ├─→ Usuario va a módulo EQUIPOS
  │   │
  │   └─→ useEffect() → loadEquipos()
  │       ├─ Firestore: getDocs(collection(db, 'equipos'))
  │       ├─ Recibe: Documento con ID
  │       └─ setEquipos([...datos])
  │
  ├─→ Usuario hace click "Nuevo Equipo"
  │   │
  │   └─→ handleNuevoEquipo()
  │       ├─ generarProximoCodigo()
  │       │  └─ ATM001 + 1 = ATM002
  │       ├─ Abre formulario
  │       └─ setShowForm(true)
  │
  ├─→ Usuario completa formulario
  │   │
  │   └─→ handleChange() para cada campo
  │       └─ setFormData({...})
  │
  ├─→ Usuario hace click "Guardar"
  │   │
  │   └─→ handleSubmit()
  │       ├─ Valida campos requeridos
  │       ├─ if válido:
  │       │  └─ addDoc(collection(db, 'equipos'), formData)
  │       └─ if error:
  │          └─ alert(error)
  │
  ├─→ Firestore confirma crear documento
  │   │
  │   └─→ loadEquipos() → Actualizar estado
  │
  ├─→ Formulario se cierra
  │   │
  │   └─→ handleCancelar()
  │       ├─ setShowForm(false)
  │       └─ Limpiar formData
  │
  └─→ Tabla actualiza
      ├─ Nuevo equipo visible
      └─ Opciones: Editar, Eliminar
```

---

## 6. AUTO-COMPLETADO EN ASIGNACIÓN

```
Usuario selecciona Equipo
         │
         ▼
┌─────────────────────────────────┐
│ handleEquipoChange()            │
│ equipoId = e.target.value       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ find() en array equipos[]       │
│ Busca: eq.id === equipoId       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Equipo encontrado?              │
│ {                               │
│   marca: "Lenovo",              │
│   modelo: "ThinkPad E15",       │
│   sn: "SN123456789",            │
│   disco: "1 TB",                │
│   memoria: "16 GB",             │
│   procesador: "Intel i7",       │
│   so: "Windows 11",             │
│   licencia: "Corp"              │
│ }                               │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ setFormData(prev => ({          │
│   ...prev,                      │
│   marca: "Lenovo",              │
│   modelo: "ThinkPad E15",       │
│   sn: "SN123456789",            │
│   ... (todos los campos)        │
│ }))                             │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Campos rellenados automáticamente│
│ ✓ Usuario ve valores auto-fill  │
│ ✓ Puede modificar si lo desea   │
└─────────────────────────────────┘
```

---

## 7. GENERACIÓN DE PDF

```
Usuario busca asignación
         │
         ▼
┌──────────────────────────────┐
│ filteredAsignaciones()       │
│ Filtra por nombre o usuario  │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ handleSelectAsignacion()     │
│ Muestra vista previa         │
│ <div ref={printRef}>         │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Usuario hace click           │
│ "Descargar PDF"              │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ generatePDF()                │
└──────────────────────────────┘
         │
    ┌────┴────┬────────┬──────────┐
    │          │        │          │
    ▼          ▼        ▼          ▼
html2canvas  jsPDF  addImage   save()
    │          │        │        │
    ├─ Captura │ Crea   ├─ Inserta  │
    │  DOM a   │ PDF    │  imagen   │
    │  imagen  │ Letter │  en PDF   │
    │  4x      │ 8.5x11 │          │
    │  escala  │        │          │
    │          │        │          │
    └──────────┴────────┴──────────┘
         │
         ▼
┌──────────────────────────────┐
│ PDF Descargado               │
│ "HojaEntrega_[usuario].pdf"  │
└──────────────────────────────┘
```

---

## 8. ESQUEMA DE BASE DE DATOS FIRESTORE

```
Database: inventario-equipos
│
├─ Collection: equipos
│  │
│  ├─ Document: doc_auto_1
│  │  ├─ codActivoFijo: "ATM001"
│  │  ├─ marca: "Lenovo"
│  │  ├─ modelo: "ThinkPad E15"
│  │  ├─ sn: "SN123456789"
│  │  ├─ disco: "1 TB"
│  │  ├─ memoria: "16 GB"
│  │  ├─ procesador: "Intel Core i7"
│  │  ├─ so: "Windows 11 Pro"
│  │  ├─ licencia: "Corporativa"
│  │  ├─ registradoPor: "user@example.com"
│  │  └─ fechaRegistro: Timestamp
│  │
│  └─ Document: doc_auto_2
│     └─ ...más equipos
│
├─ Collection: nomenclaturas
│  │
│  ├─ Document: nom_1
│  │  ├─ netbiosName: "DESKTOP-ADM" (14 chars max)
│  │  ├─ registradoPor: "user@example.com"
│  │  └─ fechaRegistro: Timestamp
│  │
│  └─ Document: nom_2
│     └─ ...más nomenclaturas
│
└─ Collection: asignaciones
   │
   ├─ Document: asign_1
   │  ├─ sucursal: "Bogotá"
   │  ├─ oficina: "Principal"
   │  ├─ departamento: "Sistemas"
   │  ├─ puesto: "Analista TI"
   │  ├─ nombre: "Juan Pérez"
   │  ├─ usuario: "jperez"
   │  ├─ empresa: "AUTOMÍA SAS"
   │  ├─ equipo: "doc_auto_1" (FK a equipos)
   │  ├─ netbiosName: "DESKTOP-ADM" (FK a nomenclaturas)
   │  ├─ marca: "Lenovo" (copia para auditoría)
   │  ├─ modelo: "ThinkPad E15"
   │  ├─ sn: "SN123456789"
   │  ├─ disco: "1 TB"
   │  ├─ memoria: "16 GB"
   │  ├─ procesador: "Intel Core i7"
   │  ├─ so: "Windows 11 Pro"
   │  ├─ licencia: "Corporativa"
   │  ├─ fechaAsignacion: "2025-01-01"
   │  ├─ asignadoPor: "admin@example.com"
   │  ├─ hojaEntregaUrl: "https://..."
   │  ├─ observaciones: "Equipo nuevo"
   │  └─ fechaRegistro: Timestamp
   │
   └─ Document: asign_2
      └─ ...más asignaciones
```

---

## 9. VALIDACIONES POR MÓDULO

```
┌─────────────────────────────────────────────────────────────┐
│                    VALIDACIONES                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ EQUIPOS:                                                   │
│ ├─ Código Activo: Auto-generado (ATM001+1)                │
│ ├─ Marca: Dropdown (Lenovo, Dell, HP)                     │
│ ├─ Modelo: Texto requerido                                │
│ ├─ S/N: Texto requerido                                   │
│ ├─ Disco: Dropdown requerido                              │
│ ├─ Memoria: Dropdown requerido                            │
│ ├─ Procesador: Texto requerido                            │
│ ├─ S.O: Dropdown requerido                                │
│ └─ Licencia: Dropdown requerido                           │
│                                                             │
│ NOMENCLATURAS:                                             │
│ ├─ Validar longitud: 0 < len <= 14                        │
│ ├─ Convertir: toUpperCase()                               │
│ ├─ Duplicados: No permitidos                              │
│ ├─ Mensaje error: "No se pueden guardar más de 14         │
│ │                  caracteres intenté nuevamente."         │
│ └─ UI: Contador 0/14 en tiempo real                       │
│                                                             │
│ ASIGNACIÓN:                                                │
│ ├─ Sucursal: Texto requerido                              │
│ ├─ Oficina: Texto requerido                               │
│ ├─ Departamento: Texto requerido                          │
│ ├─ Puesto: Texto requerido                                │
│ ├─ Nombre: Texto requerido                                │
│ ├─ Usuario: Texto requerido                               │
│ ├─ Equipo: Selector requerido + Auto-completa             │
│ ├─ NetBios: Selector requerido                            │
│ ├─ Fecha: Date requerida                                  │
│ └─ Asignado Por: Auto-rellena con usuario actual          │
│                                                             │
│ HOJA ENTREGA:                                              │
│ ├─ Búsqueda: Nombre O Usuario                             │
│ ├─ Match: Exacto (insensible a mayúsculas)                │
│ ├─ Filtrado: En tiempo real                               │
│ └─ Selección: Asignación debe existir                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. CICLO DE VIDA DEL COMPONENTE

```
┌─────────────────────────────────────────────────────────┐
│           CICLO DE VIDA (Hooks)                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Component Monta:                                        │
│ ├─ useState() - Inicializa estado                      │
│ ├─ useEffect(() => {}, [])                            │
│ │  └─ Carga datos de Firestore                        │
│ └─ Usuario ve la UI                                    │
│                                                         │
│ Usuario interactúa:                                     │
│ ├─ Hace click → handleClick()                          │
│ ├─ Escribe en input → onChange()                       │
│ ├─ Envía formulario → onSubmit()                       │
│ └─ setFormData() → Re-renderiza                        │
│                                                         │
│ Operación Firestore:                                   │
│ ├─ addDoc() → CREATE                                  │
│ ├─ updateDoc() → UPDATE                               │
│ ├─ deleteDoc() → DELETE                               │
│ ├─ getDocs() → READ                                   │
│ └─ setEquipos() → Actualiza estado                    │
│                                                         │
│ Component se actualiza:                                │
│ ├─ Re-renderiza con nuevo estado                      │
│ ├─ Tabla/Listado actualiza                            │
│ └─ Usuario ve cambios inmediatos                      │
│                                                         │
│ Component desmonta:                                     │
│ └─ return () => {...} (cleanup si es necesario)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## RESUMEN DE FLUJOS

### Flujo de Lectura (READ)
```
Component → useEffect() → getDocs() → Firestore
                                        ↓
                                    Documentos
                                        ↓
                          setState() → Renderizar
```

### Flujo de Creación (CREATE)
```
Formulario → handleSubmit() → addDoc() → Firestore
                                            ↓
                                        ID generado
                                            ↓
                          Recargar datos → Renderizar
```

### Flujo de Actualización (UPDATE)
```
Seleccionar → Editar → handleSubmit() → updateDoc() → Firestore
                                                          ↓
                                                    Recargar → Renderizar
```

### Flujo de Eliminación (DELETE)
```
Seleccionar → Confirmar → handleDelete() → deleteDoc() → Firestore
                                                              ↓
                                                    Recargar → Renderizar
```

---

Este diagrama acompaña al análisis completo en `ANALISIS_COMPLETO.md`
