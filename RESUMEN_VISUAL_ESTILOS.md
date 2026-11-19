# 📊 RESUMEN VISUAL - Comparación de Estilos de Color

## Quick Reference Card

### 🟢 EQUIPOS.jsx (REFERENCIA ESTÁNDAR)

```
┌─────────────────────────────────────────────────────────┐
│ HEADERS          bg-gray-50 + text-gray-900             │
│ LABELS           text-gray-700 (font-semibold)          │
│ TABLE HEADERS    bg-gray-50 + text-gray-700             │
│ TABLE ROWS       text-gray-900 / text-gray-600          │
│ TABLE HOVER      hover:bg-gray-50                        │
│ INPUTS           border-gray-200 + ring:blue-400        │
│ TABLE BORDERS    border-gray-100 / border-gray-200      │
└─────────────────────────────────────────────────────────┘
```

---

### 🔴 CELULARES.jsx (PROBLEMA ALTO)

**Diferencias principales:**
```
╔═══════════════════════════════════════════════════════════════╗
║ PROBLEMA 1: Labels                                            ║
║ EQUIPOS:   text-gray-700    ✅                               ║
║ CELULARES: text-slate-300   ❌ (MÁS PÁLIDO/CLARO)           ║
║                                                               ║
║ PROBLEMA 2: Inputs                                            ║
║ EQUIPOS:   border-gray-200  ✅                               ║
║ CELULARES: border-slate-700 ❌ (MUY OSCURO)                 ║
║                                                               ║
║ PROBLEMA 3: Table Headers                                     ║
║ EQUIPOS:   text-gray-700    ✅                               ║
║ CELULARES: text-slate-300   ❌ (MÁS CLARO)                  ║
║                                                               ║
║ PROBLEMA 4: Table Rows                                        ║
║ EQUIPOS:   text-gray-600 (normal)      ✅                    ║
║ CELULARES: text-slate-400/white (caos) ❌                    ║
║                                                               ║
║ PROBLEMA 5: Table Hover                                       ║
║ EQUIPOS:   hover:bg-gray-50     ✅ (casi invisible)         ║
║ CELULARES: hover:bg-slate-700   ❌ (FLASHEO VISUAL)         ║
║                                                               ║
║ PROBLEMA 6: Focus Ring                                        ║
║ EQUIPOS:   focus:ring-blue-400  ✅                          ║
║ CELULARES: focus:ring-green-400 ❌ (diferente)              ║
╚═══════════════════════════════════════════════════════════════╝
```

**Líneas problemáticas en Celulares.jsx:**
- 685: Labels → `text-slate-300`
- 715: Input borders → `border-slate-700`
- 1113: Table headers → `text-slate-300`
- 1126-1175: Table rows → `text-slate-400`, `text-white`
- Múltiples: Focus rings → `focus:ring-green-400`

---

### 🟠 NOMENCLATURAS.jsx (PROBLEMA MEDIO)

**Diferencias:**
```
┌──────────────────────────────────────┐
│ 1. Header usa DEGRADADO             │
│    DE: bg-gradient-to-br            │
│    A:  bg-gray-50 (plano)           │
│                                      │
│ 2. Focus ring diferente             │
│    EQUIPOS:       blue-400           │
│    NOMENCLATURAS: purple-400         │
│                                      │
│ 3. Cards personalizadas             │
│    border-2 border-gray-300          │
│    hover:border-purple-200           │
│                                      │
│ ✅ Labels OK: text-gray-700         │
│ ✅ Inputs OK: border-gray-300       │
└──────────────────────────────────────┘
```

---

### 🔴 ASIGNACION.jsx (PROBLEMA ALTO)

**Duplica TODOS los problemas de Celulares PLUS:**
```
╔═══════════════════════════════════════════════════════════════╗
║ Hereda problemas de Celulares:                                ║
║ • Labels: text-slate-300                                      ║
║ • Inputs: border-slate-700                                    ║
║ • Table hover: hover:bg-slate-700                             ║
║                                                               ║
║ PROBLEMAS ADICIONALES:                                        ║
║                                                               ║
║ 1. Headers inconsistentes:                                    ║
║    - Algunos: text-gray-900                                   ║
║    - Otros: text-slate-300                                    ║
║    → MEZCLA dentro del mismo componente                       ║
║                                                               ║
║ 2. Contraste peligroso:                                       ║
║    text-white sobre bg-blue-50 (Sección Colaborador)        ║
║    text-white sobre bg-green-50 (Sección Equipo)            ║
║                                                               ║
║ 3. Texto de filas mixto:                                      ║
║    text-white (nombres)                                       ║
║    text-slate-400 (resto)                                     ║
║    → Inconsistencia dentro de una fila                        ║
╚═══════════════════════════════════════════════════════════════╝
```

**Líneas problemáticas en Asignacion.jsx:**
- ~690: Labels → `text-slate-300`
- ~715+: Input borders → `border-slate-700`
- ~2033: Headers → `text-gray-900` / `text-slate-300` (MIXTO)
- ~2044+: Rows → `text-white` / `text-slate-400`
- 1740+: Secciones → text-white sobre fondo claro

---

## 🎯 Mapa de Correcciones

### Cambios Necesarios (BUSCAR Y REEMPLAZAR)

**CELULARES.jsx:**
1. `text-slate-300` → `text-gray-700` (Labels)
2. `border-slate-700` → `border-gray-200` (Inputs)
3. `text-slate-300` → `text-gray-700` (Table headers)
4. `text-slate-400` → `text-gray-600` (Table rows)
5. `text-white` → `text-gray-900` (Table rows primarias)
6. `hover:bg-slate-700` → `hover:bg-gray-50` (Table hover)
7. `focus:ring-green-400` → `focus:ring-blue-400` (Focus ring)
8. `border-slate-700` → `border-gray-200` (Textarea)

**ASIGNACION.jsx:**
1. Mismo patrón que Celulares
2. PLUS: Revisar contraste de text-white en secciones
3. PLUS: Unificar headers de tabla

**NOMENCLATURAS.jsx:**
1. `bg-gradient-to-br from-gray-50 to-gray-100` → `bg-gray-50`
2. `focus:ring-purple-400` → `focus:ring-blue-400`
3. (Lo demás está bien)

---

## 📈 Impacto Visual

### Antes (Celulares/Asignacion):
```
┌─────────────────────────────────────────────────────┐
│ 🖤 OSCURO EXCESIVO                                  │
│                                                     │
│ Inputs con bordes NEGROS (border-slate-700)        │
│ Texto GRIS MUY PÁLIDO (text-slate-300)             │
│ Filas que cambian a CASI-NEGRO al hover            │
│ Mezcla confusa de colores en texto                 │
│                                                     │
│ Resultado: Aspecto "roto" o "tema oscuro incomp."  │
└─────────────────────────────────────────────────────┘
```

### Después (Estándar Equipos):
```
┌─────────────────────────────────────────────────────┐
│ 🤍 LIMPIO Y CONSISTENTE                             │
│                                                     │
│ Inputs con bordes GRISES claros (border-gray-200)  │
│ Texto GRIS oscuro legible (text-gray-700)          │
│ Filas con hover sutil y consistente                │
│ Paleta gris uniforme                               │
│                                                     │
│ Resultado: Aspecto profesional y coherente         │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Validación Rápida

Para verificar inconsistencias, busca:

```javascript
// ❌ NO DEBERÍA ESTAR EN CELULARES/ASIGNACION
text-slate-300
text-slate-400
border-slate-700
hover:bg-slate-700
focus:ring-green-400
focus:ring-purple-400
bg-gradient-to-br

// ✅ DEBERÍA ESTAR EN LUGAR DE ARRIBA
text-gray-700
text-gray-600
border-gray-200
hover:bg-gray-50
focus:ring-blue-400
bg-gray-50
```

---

## 📝 Notas Finales

- **Equipos.jsx**: Usa paleta gris-blue coherente ✅
- **Celulares.jsx**: Usa paleta slate-green inconsistente ❌
- **Nomenclaturas.jsx**: Mayormente bien, solo detalles ⚠️
- **Asignacion.jsx**: Hereda problemas + adicionales ❌

**Causa probable:** Copypaste de estilos sin validar contra estándar.

**Solución:** Aplicar búsqueda y reemplazo sistemática.

**Estimado:** 30-45 minutos para corregir ambos archivos.
