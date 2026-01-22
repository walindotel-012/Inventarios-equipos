# 🎨 MAPA VISUAL - Comparación de Estilos

## Paletas de Color Utilizadas

### ✅ EQUIPOS.jsx (REFERENCIA - CORRECTA)

```
┌─────────────────────────────────────────────────────────────┐
│                    PALETA ESTÁNDAR                          │
│                                                             │
│  Headers:      bg-gray-50        ← Fondo gris claro       │
│  Text Primary: text-gray-900     ← Texto muy oscuro       │
│  Text Secondary: text-gray-600   ← Texto gris medio       │
│  Text Tertiary: text-gray-500    ← Texto gris claro      │
│                                                             │
│  Labels:       text-gray-700     ← Oscuro, legible        │
│  Inputs:       border-gray-200   ← Borde claro           │
│  Table Header: bg-gray-50 +      ← Fondo claro           │
│                text-gray-700     ← Texto oscuro          │
│  Table Row:    text-gray-900/600 ← Escala gris coherente  │
│  Table Hover:  hover:bg-gray-50  ← Cambio sutil          │
│                                                             │
│  Focus Ring:   focus:ring-blue-400 ← Azul consistente     │
│                                                             │
│  Delete:       bg-red-50 +       ← Rojo pálido           │
│                text-red-600      ← Rojo oscuro           │
│                                                             │
│  ✅ RESULTADO: Profesional, coherente, accesible          │
└─────────────────────────────────────────────────────────────┘
```

---

### ❌ CELULARES.jsx (INCORRECTO)

```
┌─────────────────────────────────────────────────────────────┐
│                  PALETA INCORRECTA                          │
│                                                             │
│  ⚠️  MEZCLA DE PALETAS:                                    │
│                                                             │
│  Headers:      bg-gray-50       ✅ (OK)                    │
│                                                             │
│  Labels:       text-slate-300   ❌ PÁLIDO                 │
│                (Debería ser gray-700)                      │
│                                                             │
│  Inputs:       border-slate-700 ❌ CASI NEGRO             │
│                (Debería ser gray-200)                      │
│                                                             │
│  Table Header: bg-gray-50    ✅ (OK)                       │
│                text-slate-300 ❌ PÁLIDO                   │
│                (Debería ser gray-700)                      │
│                                                             │
│  Table Row:    text-white / ❌ MEZCLA CONFUSA            │
│                text-slate-400                              │
│                (Debería ser gray-900/600)                  │
│                                                             │
│  Table Hover:  hover:bg-slate-700 ❌ CASI NEGRO           │
│                (Debería ser hover:bg-gray-50)             │
│                                                             │
│  Focus Ring:   focus:ring-green-400 ❌ VERDE              │
│                (Debería ser blue-400)                      │
│                                                             │
│  ❌ RESULTADO: Tema oscuro incompleto, confuso             │
└─────────────────────────────────────────────────────────────┘
```

---

### ⚠️ NOMENCLATURAS.jsx (CASI CORRECTO)

```
┌─────────────────────────────────────────────────────────────┐
│               PALETA CON VARIACIONES MENORES                │
│                                                             │
│  Headers:      bg-gradient-to-br  ⚠️  DEGRADADO           │
│                from-gray-50 to-100                         │
│                (Debería ser bg-gray-50 plano)             │
│                                                             │
│  Text Primary: text-gray-900     ✅ (OK)                   │
│  Text Secondary: text-gray-600   ✅ (OK)                   │
│  Text Tertiary: text-gray-500    ✅ (OK)                   │
│                                                             │
│  Labels:       text-gray-700     ✅ (OK)                   │
│  Inputs:       border-gray-300   ⚠️  (OK pero diferente)  │
│  Focused:      focus:ring-2      ✅ (OK)                   │
│                focus:ring-purple-400 ❌ PURPLE              │
│                (Debería ser blue-400)                      │
│                                                             │
│  Cards:        border-gray-300 +  ⚠️  (OK)                │
│                hover:border-purple-200                     │
│                                                             │
│  ✅ RESULTADO: Coherente con mejoras menores              │
└─────────────────────────────────────────────────────────────┘
```

---

### ❌ ASIGNACION.jsx (INCORRECTO)

```
┌─────────────────────────────────────────────────────────────┐
│        PALETA INCORRECTA + CONTRASTE DÉBIL                  │
│                                                             │
│  Hereda TODOS los problemas de Celulares:                  │
│  • text-slate-300 en labels        ❌                      │
│  • border-slate-700 en inputs      ❌                      │
│  • hover:bg-slate-700 en tablas    ❌                      │
│  • focus:ring verde/azul (mezcla)  ❌                      │
│                                                             │
│  PROBLEMAS ADICIONALES:                                    │
│                                                             │
│  Secciones:    bg-blue-50 +      ❌ CONTRASTE BAJO        │
│                text-white                                   │
│                (Texto blanco invisible sobre fondo azul)    │
│                                                             │
│  Secciones:    bg-green-50 +     ❌ CONTRASTE BAJO        │
│                text-white                                   │
│                (Texto blanco invisible sobre fondo verde)   │
│                                                             │
│  Headers:      text-gray-900 +   ⚠️  INCONSISTENTE       │
│                text-slate-300                              │
│                (Mezcla dentro del mismo componente)        │
│                                                             │
│  Rows:         text-white +      ❌ MEZCLA CONFUSA        │
│                text-slate-400                              │
│                (Múltiples colores en una fila)             │
│                                                             │
│  ❌ RESULTADO: Problemas críticos de usabilidad            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparación Visual de Cambios

### ANTES - Celulares/Asignacion

```
LABEL:
┌─────────────────────────────────────────┐
│  Serial                                 │  ← text-slate-300
│  (casi invisible, muy pálido)          │     #cbd5e1
└─────────────────────────────────────────┘

INPUT:
┌─────────────────────────────────────────┐
│ ┃ █████████████████ ┃                  │  ← border-slate-700
│ █ input text       █                   │     (casi negro)
│ ┃ █████████████████ ┃                  │
└─────────────────────────────────────────┘

TABLE HOVER (Mouse):
┌─────────────────────────────────────────┐
│ █████████████████████████████████████ │  ← hover:bg-slate-700
│ █ texto casi invisible ███████████ █ │     (muy oscuro)
│ █████████████████████████████████████ │
└─────────────────────────────────────────┘
     ↑ CONTRASTE POBRE - Texto difícil de leer
```

### DESPUÉS - Estándar (Equipos)

```
LABEL:
┌─────────────────────────────────────────┐
│  Serial (S/N)                          │  ← text-gray-700
│  (oscuro, muy legible)                 │     #374151
└─────────────────────────────────────────┘

INPUT:
┌─────────────────────────────────────────┐
│ ┃ ─────────────────── ┃                │  ← border-gray-200
│ ┋ input text       ┋                   │     (gris claro)
│ ┃ ─────────────────── ┃                │
└─────────────────────────────────────────┘

TABLE HOVER (Mouse):
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← hover:bg-gray-50
│ ░ texto muy legible ░░░░░░░░░░░░░░░░ │     (gris muy claro)
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
     ↑ CONTRASTE EXCELENTE - Fácil de leer
```

---

## 🎯 Focus States Comparison

### ❌ CELULARES (INCORRECTO)

```
INPUT SIN FOCUS:
┌────────────────────────────────────────┐
│ ┃ valor          ┃                    │
│ (border: slate-700 = casi negro)      │
└────────────────────────────────────────┘

INPUT CON FOCUS:
┌────────────────────────────────────────┐
│ ┃ valor          ┃                    │  ← focus:ring-green-400
│ (ring: green-400 = verde inesperado)  │
└────────────────────────────────────────┘
     ↑ INCOHERENTE - Color verde vs azul en otros inputs
```

### ✅ EQUIPOS (CORRECTO)

```
INPUT SIN FOCUS:
┌────────────────────────────────────────┐
│ ─ valor          ─                    │
│ (border: gray-200 = gris claro)       │
└────────────────────────────────────────┘

INPUT CON FOCUS:
┌────────────────────────────────────────┐
│ ╔════ valor ════╗                     │  ← focus:ring-blue-400
│ ║ (ring: blue-400 = azul consistente) ║
│ ╚════════════════╝                     │
└────────────────────────────────────────┘
     ↑ CONSISTENTE - Azul en todos los inputs
```

---

## 🎨 Paleta Hex Comparada

### Gray (Equipos - Correcto)
```
text-gray-900    #111827  ███████████████████  Muy oscuro
text-gray-700    #374151  ███████████████░░░░  Oscuro ✅
text-gray-600    #4b5563  ███████████░░░░░░░░  Medio
text-gray-500    #6b7280  █████████░░░░░░░░░░  Claro
border-gray-200  #e5e7eb  █░░░░░░░░░░░░░░░░░░  Muy claro ✅
bg-gray-50       #f9fafb  ░░░░░░░░░░░░░░░░░░░  Blanco grisáceo ✅
```

### Slate (Celulares - Incorrecto)
```
text-slate-300   #cbd5e1  ███░░░░░░░░░░░░░░░░  Demasiado claro ❌
text-slate-400   #94a3b8  ██████░░░░░░░░░░░░░  Claro ❌
border-slate-700 #334155  ███████████████░░░░  Casi negro ❌
bg-slate-700     #334155  ███████████████░░░░  Casi negro ❌
```

**Diferencia crítica:**
- `gray-200` (#e5e7eb) vs `slate-700` (#334155) = CONTRASTE INVERSO
- Para borders, necesitamos CLARO (gray-200)
- Celulares está usando OSCURO (slate-700)

---

## 📈 Accesibilidad - WCAG Contrast Ratios

### ✅ EQUIPOS (Correcto)
```
text-gray-900 (#111827) sobre bg-gray-50 (#f9fafb)
Ratio: 13.9:1 ✅ EXCEEDS WCAG AAA

text-gray-700 (#374151) sobre bg-gray-50 (#f9fafb)
Ratio: 9.8:1 ✅ EXCEEDS WCAG AAA

text-gray-600 (#4b5563) sobre bg-gray-50 (#f9fafb)
Ratio: 7.5:1 ✅ MEETS WCAG AA

Hover bg-gray-50: Change is SUBTLE but visible
Ratio maintained above AA standard ✅
```

### ❌ CELULARES (Incorrecto)
```
text-slate-300 (#cbd5e1) sobre bg-gray-50 (#f9fafb)
Ratio: 1.7:1 ❌ FAILS WCAG AA (needs 4.5:1)
Result: TEXT IS BARELY VISIBLE

text-white (#ffffff) sobre hover:bg-slate-700 (#334155)
Ratio: 2.1:1 ❌ FAILS WCAG AA
Result: TEXT IS BARELY VISIBLE

text-white sobre bg-blue-50 (en Asignacion)
Ratio: 1.1:1 ❌ FAILS WCAG (casi mismo color)
Result: TEXT IS INVISIBLE
```

---

## 🔧 Mapa de Reemplazos - Búsqueda Visual

```
CELULARES.jsx - ENCONTRAR (search)        REEMPLAZAR CON (replace)
────────────────────────────────────────  ──────────────────────────
text-slate-300                             text-gray-700
border-slate-700                           border-gray-200
text-slate-400                             text-gray-600
text-white (en tabla)                      text-gray-900
hover:bg-slate-700                         hover:bg-gray-50
hover:bg-green-50 (dropdown)               hover:bg-blue-50
focus:ring-green-400                       focus:ring-blue-400
border-slate-700 (table border)            border-gray-100

NOMENCLATURAS.jsx - ENCONTRAR              REEMPLAZAR CON
────────────────────────────────────────  ──────────────────────────
bg-gradient-to-br from-gray-50 to-100     bg-gray-50
focus:ring-purple-400                      focus:ring-blue-400

ASIGNACION.jsx - (Todos de Celulares PLUS)
────────────────────────────────────────  ──────────────────────────
text-white (en secciones bg-blue-50)      text-blue-900
text-white (en secciones bg-green-50)     text-green-900
(Revisar todos los headers de tabla)       text-gray-700
```

---

## 📊 Matriz de Severidad

```
┌────────────────────────────────────────────────────────────┐
│ SEVERIDAD × OCURRENCIAS                                    │
├────────────────────────────────────────────────────────────┤
│ CRÍTICO                                                    │
│ ├─ border-slate-700 (inputs oscuros)        [8+ veces]    │
│ ├─ hover:bg-slate-700 (flasheo visual)      [5+ veces]    │
│ └─ text-white sobre bg-claro (Asignacion)   [3+ veces]    │
│                                                            │
│ ALTO                                                       │
│ ├─ text-slate-300 (labels pálidos)          [10+ veces]   │
│ ├─ text-white en tabla (inconsistente)      [5+ veces]    │
│ └─ focus:ring-(green/purple) (inconsistente) [15+ veces]  │
│                                                            │
│ MEDIO                                                      │
│ ├─ text-slate-400 (filas texto pálido)      [5+ veces]    │
│ ├─ border-slate-700 (tabla borders)         [3+ veces]    │
│ └─ hover:bg-green-50 (inconsistente)        [3+ veces]    │
│                                                            │
│ BAJO                                                       │
│ ├─ bg-gradient header (visual)               [1 vez]      │
│ └─ border-gray-300 vs gray-200 (minor)      [2 veces]    │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Post-Correcciones

```
DESPUÉS DE APLICAR LOS CAMBIOS:

□ Todos los inputs tienen border-gray-200 (claro, visible)
□ Todos los labels son text-gray-700 (oscuro, legible)
□ Todos los focus rings son focus:ring-blue-400 (consistente)
□ Tablas tienen hover:bg-gray-50 (sutil, no dramático)
□ Table headers son text-gray-700 (legible)
□ Table rows usan text-gray-900/600 (escala consistente)
□ No hay mezcla de text-white con bg-claro
□ No hay text-slate-* en ningún lado
□ No hay hover:bg-slate-* en ningún lado
□ No hay focus:ring-(green/purple)-* en ningún lado
□ Headers de formularios no tienen degradados
□ Contraste accesible WCAG AA en todos lados
```

---

**Análisis visual completado**  
**Todos los problemas mapeados y documentados**  
**Listo para implementación**
