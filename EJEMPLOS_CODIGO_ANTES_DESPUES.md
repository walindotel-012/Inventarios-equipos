# 💻 EJEMPLOS DE CÓDIGO - ANTES Y DESPUÉS

## Comparación Visual de Cambios Requeridos

---

## 1️⃣ LABELS DE FORMULARIO

### ❌ Celulares.jsx (ACTUAL - INCORRECTO)
```jsx
<label className="block text-sm font-semibold text-slate-300 mb-2">
  Serial
</label>
```
**Problema:** `text-slate-300` = #cbd5e1 (MUY PÁLIDO, casi ilegible)

### ✅ Equipos.jsx (CORRECTO)
```jsx
<label className="block text-sm font-semibold text-gray-700 mb-2">
  Serial (S/N)
</label>
```
**Solución:** `text-gray-700` = #374151 (OSCURO, legible)

### 🔧 Cambio Requerido
```diff
- <label className="block text-sm font-semibold text-slate-300 mb-2">
+ <label className="block text-sm font-semibold text-gray-700 mb-2">
```

---

## 2️⃣ INPUTS - BORDER

### ❌ Celulares.jsx (ACTUAL - INCORRECTO)
```jsx
<input
  type="text"
  name="serial"
  value={formData.serial}
  className="w-full px-4 py-2.5 border border-slate-700 rounded-xl 
             text-sm focus:outline-none focus:ring-2 
             focus:ring-green-400 focus:border-transparent"
/>
```
**Problemas:**
- `border-slate-700` = #334155 (CASI NEGRO, muy oscuro)
- `focus:ring-green-400` (debería ser blue)

### ✅ Equipos.jsx (CORRECTO)
```jsx
<input
  type="text"
  name="sn"
  value={formData.sn}
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
             text-sm focus:outline-none focus:ring-2 
             focus:ring-blue-400 focus:border-transparent"
/>
```

### 🔧 Cambios Requeridos
```diff
- className="w-full px-4 py-2.5 border border-slate-700 rounded-xl 
-            text-sm focus:outline-none focus:ring-2 
-            focus:ring-green-400 focus:border-transparent"
+ className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
+            text-sm focus:outline-none focus:ring-2 
+            focus:ring-blue-400 focus:border-transparent"
```

---

## 3️⃣ TABLE HEADERS

### ❌ Celulares.jsx (ACTUAL - INCORRECTO)
```jsx
<thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="text-left p-4 font-semibold text-slate-300">
      Tipo Equipo
    </th>
    <th className="text-left p-4 font-semibold text-slate-300">
      Condición
    </th>
    <th className="text-left p-4 font-semibold text-slate-300">
      Serial
    </th>
    {/* ... más columnas ... */}
  </tr>
</thead>
```
**Problema:** Todos los headers en `text-slate-300` (pálido)

### ✅ Equipos.jsx (CORRECTO)
```jsx
<thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="text-left p-4 font-semibold text-gray-700">
      Código
    </th>
    <th className="text-left p-4 font-semibold text-gray-700">
      Tipo
    </th>
    <th className="text-left p-4 font-semibold text-gray-700">
      Serial
    </th>
    {/* ... más columnas ... */}
  </tr>
</thead>
```

### 🔧 Cambio Masivo Requerido
```bash
# En Celulares.jsx línea ~1113
# Buscar: text-slate-300 (en thead)
# Reemplazar: text-gray-700
```

---

## 4️⃣ TABLE ROWS - CONTENIDO

### ❌ Celulares.jsx (ACTUAL - PROBLEMA)
```jsx
<tbody>
  {celularesFiltrados.map(celular => (
    <tr key={celular.id} 
        className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
      
      <td className="p-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold
          bg-blue-100 text-blue-700">
          {celular.tipoEquipo}
        </span>
      </td>
      
      <td className="p-4 text-slate-400">{celular.restriccion || 'N/A'}</td>
      <td className="p-4 font-mono text-xs text-white">{celular.serial}</td>
      <td className="p-4 text-slate-400">{celular.marca}</td>
      <td className="p-4 text-slate-400">{celular.modelo}</td>
      <td className="p-4 font-mono text-xs text-slate-400">{celular.imei}</td>
      
    </tr>
  ))}
</tbody>
```

**Problemas identificados:**
1. `border-slate-700` = borde muy oscuro
2. `hover:bg-slate-700` = background casi negro al pasar mouse
3. `text-white` en serial = contraste extraño
4. `text-slate-400` = texto demasiado claro

**Visualización del problema:**
```
ANTES (Celulares):
┌──────────────────┐
│ FILA NORMAL      │  ← fondo gris claro
│ texto pálido     │  ← text-slate-400 (#94a3b8) CLARO
└──────────────────┘
    ↓ MOUSE HOVER ↓
┌──────────────────┐
│ FILA CON HOVER   │  ← ¡FONDO CASI NEGRO! hover:bg-slate-700
│ texto pálido     │  ← ahora casi invisible
└──────────────────┘

DESPUÉS (Equipos):
┌──────────────────┐
│ FILA NORMAL      │  ← fondo blanco
│ texto gris       │  ← text-gray-600 (#4b5563) OSCURO
└──────────────────┘
    ↓ MOUSE HOVER ↓
┌──────────────────┐
│ FILA CON HOVER   │  ← fondo gris claro (casi invisible)
│ texto gris       │  ← sigue siendo legible
└──────────────────┘
```

### ✅ Equipos.jsx (CORRECTO)
```jsx
<tbody>
  {(() => {
    // ... código de filtrado ...
    return equiposFiltrados.map(equipo => (
      <tr key={equipo.id} 
          className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        
        <td className="p-4 font-medium text-gray-900 font-mono text-sm">
          {equipo.codActivoFijo}
        </td>
        <td className="p-4 text-gray-600">{equipo.tipoEquipo}</td>
        <td className="p-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold
            bg-green-100 text-green-700">
            {equipo.condicion}
          </span>
        </td>
        <td className="p-4 text-gray-600">{equipo.marca}</td>
        <td className="p-4 text-gray-600">{equipo.modelo}</td>
        <td className="p-4 font-mono text-xs text-gray-600">{equipo.sn}</td>
        
      </tr>
    ));
  })()}
</tbody>
```

### 🔧 Cambios Masivos Requeridos (Celulares.jsx)
```diff
- className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
+ className="border-b border-gray-100 hover:bg-gray-50 transition-colors"

- <td className="p-4 text-slate-400">
+ <td className="p-4 text-gray-600">

- <td className="p-4 font-mono text-xs text-white">
+ <td className="p-4 font-mono text-xs text-gray-600">

- <td className="p-4 text-slate-400">
+ <td className="p-4 text-gray-600">
```

---

## 5️⃣ TEXTAREA IMPORTACIÓN

### ❌ Celulares.jsx (ACTUAL)
```jsx
<textarea
  value={importText}
  onChange={(e) => setImportText(e.target.value)}
  placeholder="Pega los celulares aquí..."
  rows="12"
  className="w-full px-4 py-2.5 border border-slate-700 rounded-xl 
             text-sm focus:outline-none focus:ring-2 focus:ring-green-400 
             focus:border-transparent transition-all font-mono"
  required
/>
```
**Problemas:**
- `border-slate-700` (muy oscuro)
- `focus:ring-green-400` (debería ser blue)

### ✅ Equipos.jsx (CORRECTO)
```jsx
<textarea
  value={importText}
  onChange={(e) => setImportText(e.target.value)}
  placeholder="Pega los equipos aquí..."
  rows="12"
  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
             text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 
             focus:border-transparent transition-all font-mono"
  required
/>
```

### 🔧 Cambio Requerido
```diff
- className="w-full px-4 py-2.5 border border-slate-700 rounded-xl 
-            text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
+ className="w-full px-4 py-2.5 border border-gray-200 rounded-xl 
+            text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
```

---

## 6️⃣ DROPDOWN ITEMS HOVER

### ❌ Celulares.jsx (ACTUAL)
```jsx
{showMarcasDropdown && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-white 
                  border border-gray-200 rounded-xl shadow-lg z-50 
                  max-h-48 overflow-y-auto">
    {marcas
      .filter(m => m.toLowerCase().includes(formData.marca.toLowerCase()))
      .map(m => (
        <div
          key={m}
          className="flex items-center justify-between px-4 py-2 
                     hover:bg-green-50 text-sm text-slate-300 
                     border-b border-slate-700 last:border-b-0 group"
        >
          {/* ... contenido ... */}
        </div>
      ))}
  </div>
)}
```

**Problemas:**
- `hover:bg-green-50` (debería ser blue)
- `text-slate-300` (demasiado claro)
- `border-slate-700` (demasiado oscuro)

### ✅ Equipos.jsx (CORRECTO)
```jsx
{showMarcasDropdown && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-white 
                  border border-gray-200 rounded-xl shadow-lg z-50 
                  max-h-48 overflow-y-auto">
    {marcas
      .filter(marca => marca.toLowerCase().includes(formData.marca.toLowerCase()))
      .map(marca => (
        <div
          key={marca}
          className="flex items-center justify-between px-4 py-2 
                     hover:bg-blue-50 text-sm text-gray-700 
                     border-b border-gray-100 last:border-b-0 group"
        >
          {/* ... contenido ... */}
        </div>
      ))}
  </div>
)}
```

### 🔧 Cambios Requeridos
```diff
- className="flex items-center justify-between px-4 py-2 
-           hover:bg-green-50 text-sm text-slate-300 
-           border-b border-slate-700 last:border-b-0 group"
+ className="flex items-center justify-between px-4 py-2 
+           hover:bg-blue-50 text-sm text-gray-700 
+           border-b border-gray-100 last:border-b-0 group"
```

---

## 7️⃣ NOMENCLATURAS - HEADER CON DEGRADADO

### ❌ Nomenclaturas.jsx (ACTUAL)
```jsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  {/* Header */}
  <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
    {/* ... contenido ... */}
  </div>
</div>
```

**Problema:** Uso de degradado vs fondo plano

### ✅ Solución Estandarizada
```jsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
    {/* ... contenido ... */}
  </div>
</div>
```

### 🔧 Cambio Requerido
```diff
- <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
+ <div className="min-h-screen bg-gray-50">
```

---

## 8️⃣ ASIGNACION - CONTRASTE PROBLEMÁTICO

### ❌ Asignacion.jsx (ACTUAL - PROBLEMA DE CONTRASTE)
```jsx
<div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-6">
  <h3 className="text-lg font-bold text-white font-manrope mb-4 flex items-center gap-3">
    <span className="text-2xl">👤</span> Datos del Colaborador
  </h3>
  {/* ... inputs ... */}
</div>
```

**Problema:** `text-white` sobre `bg-blue-50` (#eff6ff) = MUY BAJO CONTRASTE
- Texto blanco es prácticamente invisible sobre fondo azul muy claro

### ✅ Solución
```jsx
<div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-6">
  <h3 className="text-lg font-bold text-blue-900 font-manrope mb-4 flex items-center gap-3">
    <span className="text-2xl">👤</span> Datos del Colaborador
  </h3>
  {/* ... inputs ... */}
</div>
```

O mejor aún, usar bloque oscuro:
```jsx
<div className="bg-blue-900 rounded-2xl border-2 border-blue-800 p-6">
  <h3 className="text-lg font-bold text-white font-manrope mb-4 flex items-center gap-3">
    <span className="text-2xl">👤</span> Datos del Colaborador
  </h3>
  {/* ... inputs ... */}
</div>
```

### 🔧 Cambio Requerido
```diff
- <h3 className="text-lg font-bold text-white font-manrope mb-4...
+ <h3 className="text-lg font-bold text-blue-900 font-manrope mb-4...
```

---

## 📋 RESUMEN DE TODOS LOS REEMPLAZOS

### Archivo: Celulares.jsx
```bash
1. text-slate-300 → text-gray-700          (Labels, headers)
2. border-slate-700 → border-gray-200      (Inputs, textarea, dropdowns)
3. text-slate-400 → text-gray-600          (Table rows)
4. text-white → text-gray-900              (Table rows - primario)
5. hover:bg-slate-700 → hover:bg-gray-50   (Table rows)
6. hover:bg-green-50 → hover:bg-blue-50    (Dropdowns)
7. focus:ring-green-400 → focus:ring-blue-400 (All focus states)
8. border-slate-700 → border-gray-100      (Table borders)
```

### Archivo: Asignacion.jsx
```bash
1. Todos los cambios de Celulares PLUS:
2. text-white → text-blue-900              (En secciones bg-blue-50)
3. text-white → text-green-900             (En secciones bg-green-50)
4. Revisar text-slate-300 en headers
```

### Archivo: Nomenclaturas.jsx
```bash
1. bg-gradient-to-br from-gray-50 to-gray-100 → bg-gray-50
2. focus:ring-purple-400 → focus:ring-blue-400
3. border-gray-300 → border-gray-200       (Opcional, minor)
```

---

**Documentación de código comparativo completada**  
**Complejidad estimada de cambios:** Media (búsqueda y reemplazo masivo)  
**Tiempo estimado:** 30-45 minutos  
**Riesgo:** Bajo (cambios solo CSS, no lógica)
