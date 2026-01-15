# ⚡ INICIO RÁPIDO - Importar Equipos

## ✅ Lo que se ha hecho

Se ha implementado una funcionalidad de **importación en lote** para equipos en el módulo de "Gestión de Equipos" con formato **TAB-separado**.

---

## 🎯 Pasos para Importar (3 minutos)

1. **Abre la aplicación** → http://localhost:5173
2. **Inicia sesión** con tu cuenta
3. **Ve a "Gestión de Equipos"** (desde el menú principal)
4. **Clic en "📥 Importar en Lote"** (botón en la esquina superior derecha)
5. **Copia los datos** en formato TAB-separado (desde Excel, CSV, etc.)
6. **Pégalos en el formulario** (textarea del formulario de importación)
7. **Haz clic en "Importar"** ✅

**¡Listo! Los equipos se habrán insertado automáticamente.**

---

## 📋 Formato de Datos

### Estructura (separado por TAB)
```
Marca | Modelo | Serial | Disco | Memoria | Procesador | SO | [Licencia]
```

### Ejemplo
```
Dell	Latitude 5550	D6TK374	512 GB	16GB	Intel® Core™ Ultra 5 125U 1.30 GHZ	Windows 11 Pro
HP	EliteBook 850 G10	HW2024001	512 GB	16GB	Intel® Core™ i7-1365U	Windows 11 Pro
Lenovo	ThinkPad X1	LN2024001	512 GB	16GB	Intel® Core™ i7-1370P	Windows 11 Pro
```

---

## 📁 Archivos de Referencia

- **EQUIPOS_A_IMPORTAR.txt** → Ejemplo de equipos (copia y pega)
- **GUIA_IMPORTACION_EQUIPOS.md** → Guía completa
- **CAMBIOS_REALIZADOS_EQUIPOS.md** → Detalles técnicos

---

## ✨ Características Automáticas

✅ Generar códigos ATM automáticamente  
✅ Detectar seriales duplicados  
✅ Convertir seriales a mayúsculas  
✅ Validar campos requeridos  
✅ Asignar valores por defecto (Laptop, Nuevo)  
✅ Resumen de importación  

---

## 💡 Tips

**Desde Excel:**
1. Selecciona las columnas: Marca, Modelo, Serial, Disco, Memoria, Procesador, SO
2. Copia (Ctrl+C)
3. Pega en el formulario (Ctrl+V)
4. ¡Listo!

**Campos:**
- Marca: Dell, HP, Lenovo, etc.
- Modelo: Latitude 5550, EliteBook, etc.
- Serial: Número único del equipo
- Disco: 512 GB, 1 TB, 2 TB, etc.
- Memoria: 8GB, 16GB, 32GB, etc.
- Procesador: Intel/AMD + modelo
- SO: Windows 11 Pro, Windows 10, etc.
- Licencia: (opcional)

---

**Tiempo de importación:** ⏱️ < 1 minuto  
**Equipos de ejemplo:** 10 disponibles  
**Validaciones:** Automáticas ✅

Ver: [EQUIPOS_A_IMPORTAR.txt](EQUIPOS_A_IMPORTAR.txt)
