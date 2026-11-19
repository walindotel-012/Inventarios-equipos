# ✓ Configuración de Iconos de Monitor

## 📋 Cambios Realizados

La aplicación ahora tiene iconos de monitor correctamente configurados para **Desktop** y **Celulares** cuando se descarga como app instalable.

### 🎯 Iconos Generados

| Archivo | Tamaño | Propósito |
|---------|--------|----------|
| `icon-192x192.png` | 192x192px | Android y PWA estándar |
| `icon-512x512.png` | 512x512px | Android, PWA y maskable |
| `apple-touch-icon-180x180.png` | 180x180px | iPhone/iPad (iOS) |

Ubicación: `/public/`

### 🔧 Archivos Modificados

#### 1. **manifest.json** ✓
- Actualizado con referencias a archivos PNG reales (antes eran SVG inline)
- Los iconos ahora se cargan desde `/Inventarios-equipos/`
- Incluye soporte para "maskable" (diseño adaptable en bordes redondeados)

#### 2. **index.html** ✓
- `<link rel="icon">` apunta a `icon-192x192.png`
- `<link rel="apple-touch-icon">` apunta a `apple-touch-icon-180x180.png`
- Los iconos se cargarán correctamente en todos los navegadores

#### 3. **generate-icons.js** (Nuevo)
- Script para regenerar iconos si es necesario
- Usa la librería `sharp` para convertir SVG a PNG
- Se puede ejecutar con: `node generate-icons.js`

---

## 📱 ¿Cómo Funcionará?

### En **Desktop/Navegador:**
- Cuando instales la app como PWA (Chrome, Edge, Firefox)
- Mostrará el icono de monitor de 192x192 o 512x512px

### En **Celular (Android):**
- Al instalar como app desde Chrome
- Mostrará el icono de monitor en la pantalla de inicio
- Tamaño adaptado automáticamente (192x192 o 512x512)

### En **iPhone/iPad:**
- Al guardar en la pantalla de inicio desde Safari
- Mostrará el icono de monitor de 180x180px
- Nombre: "Inventario"

---

## 🚀 Próximos Pasos (Opcional)

Si quieres personalizar más los iconos:

1. **Cambiar colores:** Edita `generate-icons.js` (línea con `#003399`)
2. **Agregar texto:** Modifica el SVG en el script
3. **Regenerar:** Ejecuta `node generate-icons.js`

---

## ✅ Status

- [x] Iconos PNG generados
- [x] manifest.json actualizado
- [x] index.html actualizado
- [x] Apple touch icon configurado
- [x] PWA lista para instalar

**La app está lista para ser descargada en desktop y celular con los iconos de monitor configurados correctamente.**
