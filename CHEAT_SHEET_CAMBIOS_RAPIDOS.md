# ⚡ CHEAT SHEET - Cambios Rápidos

**Guía ultra-rápida de qué cambiar - Sin explicaciones largas**

---

## 🔥 CELULARES.jsx

### 8 Cambios Necesarios

```bash
# 1. Labels pálidos → oscuros
BUSCAR:  text-slate-300
CAMBIAR: text-gray-700
LÍNEAS:  ~685, ~1113

# 2. Inputs borders muy oscuros
BUSCAR:  border-slate-700
CAMBIAR: border-gray-200
LÍNEAS:  ~715, ~544, ~590, etc.

# 3. Tabla texto muy claro
BUSCAR:  text-slate-400
CAMBIAR: text-gray-600
LÍNEAS:  ~1130, ~1131

# 4. Tabla texto blanco primario
BUSCAR:  text-white (en <td>)
CAMBIAR: text-gray-900
LÍNEAS:  ~1129

# 5. Tabla hover dramático
BUSCAR:  hover:bg-slate-700
CAMBIAR: hover:bg-gray-50
LÍNEAS:  ~1129

# 6. Dropdown hover verde
BUSCAR:  hover:bg-green-50 (en dropdown)
CAMBIAR: hover:bg-blue-50
LÍNEAS:  ~760, ~825, ~893

# 7. Focus rings verdes
BUSCAR:  focus:ring-green-400
CAMBIAR: focus:ring-blue-400
LÍNEAS:  MUCHAS (~10+)

# 8. Table borders oscuros
BUSCAR:  border-slate-700 (en thead/tbody)
CAMBIAR: border-gray-100
LÍNEAS:  ~1126
```

---

## 🔥 ASIGNACION.jsx

### Todos los cambios de Celulares PLUS:

```bash
# 1-8. Hacer primero los 8 de Celulares (arriba)

# 9. Texto blanco en secciones azules
BUSCAR:  text-white (dentro de <div className="...bg-blue-50...">)
CAMBIAR: text-blue-900
LÍNEAS:  ~1740

# 10. Texto blanco en secciones verdes
BUSCAR:  text-white (dentro de <div className="...bg-green-50...">)
CAMBIAR: text-green-900
LÍNEAS:  ~1774

# 11. Revisar headers mezcla
BUSCAR:  text-slate-300 (en <th>)
CAMBIAR: text-gray-700
LÍNEAS:  ~2033+

# 12. Focus rings mezcla
BUSCAR:  focus:ring-green-400
CAMBIAR: focus:ring-blue-400
LÍNEAS:  MUCHAS
```

---

## 🔥 NOMENCLATURAS.jsx

### 2 Cambios Pequeños

```bash
# 1. Header con degradado
BUSCAR:  bg-gradient-to-br from-gray-50 to-gray-100
CAMBIAR: bg-gray-50
LÍNEAS:  ~155

# 2. Focus ring púrpura
BUSCAR:  focus:ring-purple-400
CAMBIAR: focus:ring-blue-400
LÍNEAS:  ~235
```

---

## ✅ Verificación Post-Cambios

```javascript
// Verificar en el navegador que:

□ Inputs tienen bordes GRISES CLAROS (no negros)
□ Labels son OSCUROS (legibles)
□ Focus rings son AZULES (consistentes)
□ Tabla hover es SUTIL (no dramático)
□ Texto blanco no está sobre fondo claro
□ No hay mezcla de colores en componentes
□ Contraste visible en todo

// En consola (F12):
□ No hay errores de CSS
□ No hay warnings
□ Cargar bien
```

---

## 🎨 Antes vs Después (Visual)

```
ANTES (Problema):              DESPUÉS (Correcto):
┌─────────────────┐           ┌─────────────────┐
│ Label pálido    │           │ Label oscuro    │
│ ┃ █ input █ ┃   │  ────→   │ ─ input ─       │
│ Hover muy negro │           │ Hover sutil     │
└─────────────────┘           └─────────────────┘
```

---

## 📋 Orden de Ejecución

### Opción 1: Rápida (Recomendado)
```
1. Hacer todos los cambios en Celulares.jsx
2. Hacer todos los cambios en Asignacion.jsx
3. Hacer los 2 cambios en Nomenclaturas.jsx
4. Testing rápido
5. Commit
```

**Tiempo total:** ~45 minutos

### Opción 2: Precavida
```
1. Backup de los 3 archivos
2. Cambios Celulares + Test
3. Cambios Asignacion + Test
4. Cambios Nomenclaturas + Test
5. Testing completo
6. Commit
```

**Tiempo total:** ~60 minutos

---

## 🔍 Búsqueda Masiva (VS Code)

Para ver TODOS los casos a cambiar en Celulares.jsx:

```
Abre el archivo → Ctrl+H (Find and Replace)

1. Buscar: text-slate-300
   Contar: ~15 coincidencias
   Cambiar: text-gray-700

2. Buscar: border-slate-700
   Contar: ~8 coincidencias
   Cambiar: border-gray-200

... etc.
```

---

## ⚠️ Cambios MÁS COMUNES

```
De:                   A:                    Frecuencia:
────────────────────────────────────────  ──────────
text-slate-300     → text-gray-700        15+ veces
border-slate-700   → border-gray-200      8+ veces
hover:bg-slate-700 → hover:bg-gray-50     5+ veces
focus:ring-green-400 → focus:ring-blue-400 10+ veces
```

---

## 🚨 NO CAMBIAR (Fácil error)

```
✅ CORRECTO - Mantener así:
• .btn-primary (color del botón, está bien)
• .btn-secondary (está bien)
• bg-red-50 + text-red-600 (borrar, está bien)
• bg-blue-50 + text-blue-900 (info boxes, está bien)
• border-gray-200 en inputs (correcto)

❌ INCORRECTO - No cambiar:
• No cambies text-gray-900 (primario)
• No cambies text-gray-600 (válido)
• No cambies bg-white (inputs)
• No hagas cambios que no estén aquí
```

---

## 💡 Tips Útiles

1. **Usa Find All** para ver TODAS las coincidencias antes de reemplazar
2. **Previsualizá los cambios** con "Replace" antes de "Replace All"
3. **Haz commits pequeños** - Un cambio por tipo si es posible
4. **Test después de cada archivo** - No hagas los 3 juntos sin testear
5. **Si algo se ve raro** - Ctrl+Z y revisa el análisis

---

## 🐛 Si Algo Sale Mal

```
Problema: Inputs muy oscuros todavía
Solución: Verificar que border-gray-200 fue aplicado
          Buscar border-slate-700 restantes

Problema: Labels sigue pálido
Solución: Verificar que text-gray-700 fue aplicado
          Buscar text-slate-300 restantes

Problema: Tabla se ve extraña
Solución: Revertir ese archivo y revisar línea por línea
          Usar: git checkout -- Celulares.jsx
```

---

## ⏱️ Timeline Estimado

```
Búsqueda inicial:       1 min
Celulares.jsx:        10-15 min
Asignacion.jsx:       15-20 min
Nomenclaturas.jsx:     5 min
Testing visual:        5-10 min
Documentación/Commit:  5 min
───────────────────────────────
TOTAL:               45-60 min
```

---

## 📱 Formato de Búsqueda

Si necesitas buscar múltiples al mismo tiempo:

```
En VS Code Find:
text-slate-300|border-slate-700|hover:bg-slate-700

(Usa | para alternancia - reemplaza uno por uno)
```

---

## ✅ Checklist Final

Antes de hacer commit:

- [ ] Celulares.jsx sin text-slate-300
- [ ] Celulares.jsx sin border-slate-700
- [ ] Asignacion.jsx sin text-slate-300
- [ ] Asignacion.jsx sin border-slate-700
- [ ] Asignacion.jsx sin text-white sobre fondo claro
- [ ] Nomenclaturas.jsx sin gradiente
- [ ] Nomenclaturas.jsx con focus:ring-blue-400
- [ ] Todos los inputs visibles y claros
- [ ] Todos los labels legibles
- [ ] Hover subtle en tablas
- [ ] SIN errores en consola
- [ ] SIN warnings de CSS

---

## 🎯 Success Criteria

**La aplicación se ve bien cuando:**
1. ✅ Inputs tienen borde GRIS (no negro)
2. ✅ Labels son OSCUROS (no pálidos)
3. ✅ Tablas tienen hover sutil (no dramático)
4. ✅ Todo es consistente (misma paleta)
5. ✅ Se ve profesional

---

**¿Listo?** → Abre Celulares.jsx en VS Code  
**¿Duda?** → Revisa EJEMPLOS_CODIGO_ANTES_DESPUES.md  
**¿Detalle?** → Revisa TABLA_COMPARATIVA_DETALLADA_ESTILOS.md

---

⏱️ **Hora de empezar:** 22 de enero de 2026
