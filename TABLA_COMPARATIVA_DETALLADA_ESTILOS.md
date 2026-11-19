# 🎨 TABLA COMPARATIVA DETALLADA - ESTILOS DE COLOR

## Elemento por Elemento: Equipos vs Otros Módulos

---

## 1️⃣ HEADER PRINCIPAL

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Fondo** | `bg-gray-50` | `bg-gray-50` ✅ | `bg-gradient-to-br from-gray-50 to-gray-100` ⚠️ | `bg-gray-50` ✅ |
| **Texto H1** | `text-gray-900` | `text-gray-900` ✅ | `text-gray-900` ✅ | `text-gray-900` ✅ |
| **Subtítulo** | `text-gray-600` | `text-gray-600` ✅ | `text-gray-600` ✅ | `text-gray-600` ✅ |
| **Border** | `border-b border-gray-100` | `border-b border-gray-100` ✅ | `border-b border-gray-200` ⚠️ | `border-b border-gray-100` ✅ |
| **Padding** | `pt-8 pb-8` | `pt-8 pb-8` ✅ | `pt-8 pb-8` ✅ | `pt-8 pb-8` ✅ |

**Evaluación:**
- ✅ Equipos: 5/5 estándar
- ✅ Celulares: 5/5 estándar
- ⚠️ Nomenclaturas: 4/5 (degradado en lugar de plano)
- ✅ Asignacion: 5/5 estándar

---

## 2️⃣ LABELS DE FORMULARIOS

| Elemento | Equipos | Celulares | Nomenclaturas | Asignacion |
|----------|---------|-----------|---------------|-----------|
| **Text Color** | `text-gray-700` | `text-slate-300` ❌ | `text-gray-700` ✅ | `text-slate-300` ❌ |
| **Font Weight** | `font-semibold` | `font-semibold` ✅ | `font-semibold` ✅ | `font-semibold` ✅ |
| **Text Size** | `text-sm` | `text-sm` ✅ | `text-sm` ✅ | `text-sm` ✅ |
| **Margin Bottom** | `mb-2` | `mb-2` ✅ | `mb-2` ✅ | `mb-2` ✅ |
| **Display** | `block` | `block` ✅ | `block` ✅ | `block` ✅ |

**Evaluación:**
- ✅ Equipos: 5/5 (gris oscuro legible)
- ❌ Celulares: 4/5 (text-slate-300 demasiado pálido)
- ✅ Nomenclaturas: 5/5
- ❌ Asignacion: 4/5 (text-slate-300 demasiado pálido)

**Problema:** `text-slate-300` es #cbd5e1 (muy claro), `text-gray-700` es #374151 (oscuro y legible)

---

## 3️⃣ INPUTS - ESTADO NORMAL

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Border** | `border-gray-200` | `border-slate-700` ❌ | `border-gray-300` ⚠️ | `border-slate-700` ❌ |
| **Border Width** | (default) | (default) | `border` (explícito) | (default) |
| **Rounded** | `rounded-xl` | `rounded-xl` ✅ | `rounded-xl` ✅ | `rounded-xl` ✅ |
| **Padding** | `px-4 py-2.5` | `px-4 py-2.5` ✅ | `px-4 py-2.5` ✅ | `px-4 py-2.5` ✅ |
| **Background** | `bg-white` (default) | (default) | `bg-white` (default) | (default) |
| **Text Color** | `text-gray-700` | (default) | `text-gray-700` | (default) |

**Evaluación:**
- ✅ Equipos: 5/5
- ❌ Celulares: 3/5 (border muy oscuro)
- ⚠️ Nomenclaturas: 4/5 (border más claro que lo ideal)
- ❌ Asignacion: 3/5 (border muy oscuro)

**Problema crítico:** `border-slate-700` es #334155 (casi negro), mucho más oscuro que `border-gray-200` que es #e5e7eb

---

## 4️⃣ INPUTS - ESTADO FOCUS

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Ring** | `focus:ring-2 focus:ring-blue-400` | `focus:ring-2 focus:ring-green-400` ❌ | `focus:ring-2 focus:ring-purple-400` ❌ | `focus:ring-2 focus:ring-blue-400` o `green-400` ⚠️ |
| **Border** | `focus:border-transparent` | `focus:border-transparent` ✅ | `focus:border-transparent` ✅ | `focus:border-transparent` ✅ |
| **Transition** | `transition-all` | (algunos sí) | (algunos sí) | (algunos sí) |

**Evaluación:**
- ✅ Equipos: 5/5 (blue consistente)
- ❌ Celulares: 4/5 (green en lugar de blue)
- ❌ Nomenclaturas: 4/5 (purple en lugar de blue)
- ⚠️ Asignacion: 3/5 (mezcla de blue y green)

---

## 5️⃣ TABLE HEADER

| Elemento | Equipos | Celulares | Nomenclaturas | Asignacion |
|----------|---------|-----------|---------------|-----------|
| **Container BG** | `bg-gray-50` | `bg-gray-50` ✅ | N/A | `bg-gray-50` ✅ |
| **Border** | `border-b border-gray-200` | `border-b border-gray-200` ✅ | N/A | `border-b border-gray-200` ✅ |
| **Column Text** | `text-gray-700` | `text-slate-300` ❌ | N/A | `text-gray-900` / `text-slate-300` ⚠️ |
| **Font Weight** | `font-semibold` | `font-semibold` ✅ | N/A | `font-semibold` ✅ |
| **Padding** | `p-4` | `p-4` ✅ | N/A | `p-4` ✅ |
| **Text Align** | `text-left` | `text-left` ✅ | N/A | `text-left` ✅ |

**Evaluación:**
- ✅ Equipos: 5/5
- ❌ Celulares: 4/5 (text color incorrecto)
- ✅ Asignacion (parcial): 3/5 (mezcla de colores)

---

## 6️⃣ TABLE ROW - TEXTO NORMAL

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Primario** | `text-gray-900` | `text-white` ❌ | N/A | `text-white` ❌ |
| **Secundario** | `text-gray-600` | `text-slate-400` ❌ | N/A | `text-slate-400` ❌ |
| **Monospace (SN)** | `font-mono text-xs text-gray-600` | `font-mono text-xs text-white` ❌ | N/A | `font-mono text-xs text-slate-400` ❌ |
| **Font Weight** | `font-medium` (primario) | (default) | N/A | `font-medium` (en nombres) |
| **Padding** | `p-4` | `p-4` ✅ | N/A | `p-4` ✅ |

**Evaluación:**
- ✅ Equipos: 5/5 (escala gris coherente)
- ❌ Celulares: 2/5 (mezcla white + slate)
- ❌ Asignacion: 2/5 (mezcla white + slate)

---

## 7️⃣ TABLE ROW - BORDER Y HOVER

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Row Border** | `border-b border-gray-100` | `border-b border-slate-700` ❌ | N/A | `border-b border-slate-700` ❌ |
| **Hover BG** | `hover:bg-gray-50` | `hover:bg-slate-700` ❌ | N/A | `hover:bg-slate-700` ❌ |
| **Transition** | `transition-colors` | `transition-colors` ✅ | N/A | `transition-colors` ✅ |

**Evaluación:**
- ✅ Equipos: 5/5 (efecto sutil)
- ❌ Celulares: 2/5 (cambio dramático de color)
- ❌ Asignacion: 2/5 (cambio dramático de color)

**Problema:** `hover:bg-slate-700` (#334155) es extremadamente oscuro vs `hover:bg-gray-50` (#f9fafb) que es casi invisible

---

## 8️⃣ TEXTAREA (IMPORTACIÓN)

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Border** | `border-gray-200` | `border-slate-700` ❌ | `border-gray-300` | `border-gray-200` ✅ |
| **Focus Ring** | `focus:ring-blue-400` | `focus:ring-green-400` ❌ | `focus:ring-blue-400` | `focus:ring-blue-400` ✅ |
| **Text Color** | (default gris) | (default gris) | `text-blue-800` (en info box) | `text-slate-300` ❌ |
| **Rounded** | `rounded-xl` | `rounded-xl` ✅ | `rounded-xl` ✅ | `rounded-xl` ✅ |
| **Font** | `font-mono` | `font-mono` ✅ | `font-mono` ✅ | `font-mono` ✅ |

---

## 9️⃣ DROPDOWN/SELECT FIELDS

| Aspecto | Equipos | Celulares | Nomenclaturas | Asignacion |
|---------|---------|-----------|---------------|-----------|
| **Normal Border** | `border-gray-200` | `border-gray-300` ⚠️ | `border-gray-200` | `border-slate-700` ❌ |
| **Focus Ring** | `focus:ring-blue-400` | `focus:ring-green-400` ❌ | `focus:ring-purple-400` ❌ | `focus:ring-blue-400` o `green-400` ⚠️ |
| **Dropdown BG** | `bg-white` | `bg-white` ✅ | `bg-white` ✅ | `bg-white` ✅ |
| **Dropdown Item Hover** | `hover:bg-blue-50` | `hover:bg-green-50` ⚠️ | `hover:bg-blue-50` | `hover:bg-green-50` ⚠️ |

---

## 🔟 BOTONES - PRIMARY

| Propiedad | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----------|---------|-----------|---------------|-----------|
| **Class** | `.btn-primary` | `.btn-primary` ✅ | `.btn-primary` ✅ | `.btn-primary` ✅ |
| **Color de focus ring** | (ver arriba) | verde | púrpura | azul/verde |
| **Hover Color** | bg-blue-600 | (heredado) | (heredado) | (heredado) |

---

## 1️⃣1️⃣ BOTONES - SECONDARY Y DELETE

| Elemento | Equipos | Celulares | Nomenclaturas | Asignacion |
|----------|---------|-----------|---------------|-----------|
| **Secondary** | `btn-secondary` | `btn-secondary` ✅ | `btn-secondary` ✅ | `btn-secondary` ✅ |
| **Delete Button** | `bg-red-50 text-red-600` | `bg-red-50 text-red-600` ✅ | `bg-red-50 text-red-600` ✅ | `bg-red-50 text-red-600` ✅ |
| **Delete Hover** | `hover:bg-red-100` | `hover:bg-red-100` ✅ | `hover:bg-red-100` ✅ | `hover:bg-red-100` ✅ |

**Evaluación:** ✅ Estos elementos están consistentes en todos

---

## 1️⃣2️⃣ INFORMACIÓN Y ALERTA BOXES

| Box | Equipos | Celulares | Nomenclaturas | Asignacion |
|-----|---------|-----------|---------------|-----------|
| **Info** | `bg-blue-50 border border-blue-200` | `bg-blue-50 border border-blue-200` ✅ | `bg-blue-50 border border-blue-200` ✅ | `bg-blue-50 border border-blue-100` ⚠️ |
| **Info Text** | `text-blue-900` / `text-blue-800` | `text-blue-900` / `text-blue-800` ✅ | `text-blue-900` / `text-blue-800` ✅ | `text-white` ❌ |
| **Alerta** | `bg-amber-50 border border-amber-200` | `bg-amber-50 border border-amber-200` ✅ | N/A | `bg-amber-50` ✅ |
| **Alerta Text** | `text-amber-900` / `text-amber-800` | `text-amber-900` / `text-amber-800` ✅ | N/A | `text-amber-900` ✅ |
| **Error** | N/A | N/A | `bg-red-50 border border-red-200` | N/A |
| **Error Text** | N/A | N/A | `text-red-700` | N/A |

**Nota en Asignacion:** Problemas de contraste - `text-white` sobre `bg-blue-50` / `bg-green-50` es difícil de leer

---

## RESUMEN DE PUNTUACIÓN

| Módulo | Score | Problemas Principales |
|--------|-------|------------------------|
| **Equipos** | 25/25 ✅ | Ninguno (estándar) |
| **Celulares** | 18/25 ❌ | 7 diferencias críticas |
| **Nomenclaturas** | 23/25 ⚠️ | 2 diferencias menores |
| **Asignacion** | 15/25 ❌ | 10+ diferencias |

---

## MAPEO DE CAMBIOS REQUERIDOS

### Celulares.jsx
```
1. text-slate-300 → text-gray-700 (LÍNEAS: 685+, 1113)
2. border-slate-700 → border-gray-200 (LÍNEAS: 715+, 544+)
3. focus:ring-green-400 → focus:ring-blue-400 (MÚLTIPLES)
4. text-white → text-gray-900 (LÍNEA: 1129+)
5. text-slate-400 → text-gray-600 (LÍNEA: 1130+)
6. hover:bg-slate-700 → hover:bg-gray-50 (LÍNEA: 1129)
7. border-slate-700 → border-gray-200 (TEXTAREA, LÍNEA: 544+)
```

### Asignacion.jsx
```
1. Todos los cambios de Celulares PLUS:
2. text-white → text-gray-900 (Secciones, LÍNEA: 1740+)
3. Unificar headers (LÍNEA: 2033+)
4. Revisar contraste de secciones de color
```

### Nomenclaturas.jsx
```
1. bg-gradient-to-br from-gray-50 to-gray-100 → bg-gray-50 (LÍNEA: ~155)
2. focus:ring-purple-400 → focus:ring-blue-400 (LÍNEA: ~235)
```

---

**Análisis completado:** 22 de enero de 2026
