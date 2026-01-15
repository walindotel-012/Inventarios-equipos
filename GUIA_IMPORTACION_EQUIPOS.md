# 📥 Importación de Equipos en Lote

## ✅ Funcionalidad Implementada

Se ha agregado la capacidad de importar múltiples equipos de forma masiva en el módulo de **Gestión de Equipos** utilizando un formato delimitado por TAB (separado por tabulaciones).

---

## 📋 Formato de Importación

### Estructura
```
Marca | Modelo | Serial | Disco | Memoria | Procesador | SO | [Licencia]
```

### Campos Requeridos
1. **Marca** - Fabricante (Dell, HP, Lenovo, etc.)
2. **Modelo** - Modelo del equipo
3. **Serial** - Número de serie (único)
4. **Disco** - Capacidad del disco (512 GB, 1 TB, 2 TB, etc.)
5. **Memoria** - RAM (8GB, 16GB, 32GB, etc.)
6. **Procesador** - Tipo de procesador
7. **SO** - Sistema operativo

### Campo Opcional
- **Licencia** - Número de licencia (campo opcional)

### Ejemplo Completo
```
Dell	Latitude 5550	D6TK374	512 GB	16GB	Intel® Core™ Ultra 5 125U 1.30 GHZ	Windows 11 Pro
```

---

## 🚀 Cómo Usar

### Paso 1: Acceder al Módulo
1. Inicia sesión en la aplicación
2. Ve a **"Gestión de Equipos"**

### Paso 2: Hacer Clic en Importar
1. En la esquina superior derecha, encontrarás un botón **"📥 Importar en Lote"**
2. Haz clic en él

### Paso 3: Preparar los Datos
1. Asegúrate de que tus datos estén en el formato correcto (TAB-separado)
2. Cada equipo debe estar en una línea diferente

### Paso 4: Copiar y Pegar
1. Copia tus datos desde Excel, CSV o cualquier otra fuente
2. Pégalos en el área de texto del formulario
3. Verifica que se muestren todos los equipos correctamente

### Paso 5: Importar
1. Haz clic en el botón **"Importar"**
2. El sistema procesará todos los equipos
3. Te mostrará un resumen con éxito/errores

---

## ℹ️ Características Automáticas

### Códigos de Activo Fijo
- ✅ Se generan automáticamente en formato `ATM###`
- ✅ Se asignan secuencialmente
- ✅ No pueden ser duplicados

### Validaciones
- ✅ Detección de seriales duplicados
- ✅ Conversión de seriales a mayúsculas
- ✅ Validación de campos requeridos
- ✅ Ignorar líneas incompletas
- ✅ Manejo de errores por línea

### Valores por Defecto
- ✅ Tipo de Equipo: **Laptop**
- ✅ Condición: **Nuevo**
- ✅ Se pueden editar después de importar

---

## 📊 Ejemplo de Datos

### En Excel (Copiar y Pegar)
```
Marca           | Modelo              | Serial      | Disco    | Memoria | Procesador                                    | SO
Dell            | Latitude 5550       | D6TK374     | 512 GB   | 16GB    | Intel® Core™ Ultra 5 125U 1.30 GHZ           | Windows 11 Pro
Dell            | Latitude 5550       | D6TK375     | 512 GB   | 16GB    | Intel® Core™ Ultra 5 125U 1.30 GHZ           | Windows 11 Pro
HP              | EliteBook 850 G10   | HW2024001   | 512 GB   | 16GB    | Intel® Core™ i7-1365U                        | Windows 11 Pro
Lenovo          | ThinkPad X1         | LN2024001   | 512 GB   | 16GB    | Intel® Core™ i7-1370P                        | Windows 11 Pro
```

### Archivo Preparado
Ver: `EQUIPOS_A_IMPORTAR.txt` para un ejemplo completo

---

## ⚠️ Notas Importantes

### Seriales
- Deben ser **únicos** en la base de datos
- Se convierten automáticamente a **mayúsculas**
- Los duplicados se **ignorarán** durante la importación

### Formato TAB
- **Muy importante:** Los campos deben estar separados por **TAB**, no por espacios
- Si copias desde Excel, mantendrá los TABs automáticamente
- Si editas manualmente, usa la tecla **Tab** para separar

### Licencia
- Campo **completamente opcional**
- Se puede dejar vacío
- Se puede agregar después manualmente

### Tipo de Equipo y Condición
- Se asignarán valores por defecto
- Puedes cambiarlos después editando cada equipo
- Tipos disponibles: Monitor, CPU, Laptop, UPS, Switch, Impresora, etc.
- Condiciones: Nuevo, Usado

---

## 🔍 Validación de Errores

### Durante la Importación
El sistema mostrará un resumen como:
```
✅ Se importaron 8 equipos (2 líneas con error)
```

### Errores Comunes
- **Campos insuficientes:** Falta alguno de los 7 campos requeridos
- **Campo vacío:** Alguno de los campos está vacío
- **Serial duplicado:** El serial ya existe en la base de datos
- **Formato incorrecto:** Los datos no están correctamente separados

---

## 📋 Flujo de Importación

```
Usuario prepara datos en Excel
        ↓
Copia datos (TAB-separados)
        ↓
Abre "Importar en Lote"
        ↓
Pega en el formulario
        ↓
Sistema parsea por líneas
        ↓
Valida cada campo
        ↓
Chequea seriales duplicados
        ↓
Genera códigos ATM automáticos
        ↓
Inserta en Firestore
        ↓
Muestra resumen (importados + errores)
        ↓
Recarga lista de equipos
```

---

## 💡 Tips y Mejores Prácticas

### Preparar Datos en Excel
1. Crea las columnas en orden: Marca, Modelo, Serial, Disco, Memoria, Procesador, SO
2. Asegúrate de que NO haya espacios adicionales al inicio/final
3. Copia incluyendo los encabezados (se ignorarán automáticamente)
4. Verifica que no haya columnas vacías

### Validar Antes de Importar
1. Verifica que todos los seriales sean únicos
2. Copia un pequeño lote primero (ej: 3 equipos) para probar
3. Revisa los datos después en la lista de equipos
4. Si hay errores, corrígelos y reintentas

### Editar Después
1. Puedes cambiar Tipo de Equipo y Condición después
2. Puedes agregar Licencia si la dejaste vacía
3. Usa el botón ✏️ para editar cada equipo

---

## 🆚 Comparación: Manual vs Importación

| Aspecto | Manual | Importación |
|---------|--------|------------|
| Tiempo (10 equipos) | ~10 minutos | ~1 minuto |
| Errores | Frecuentes | Validados |
| Códigos de Activo | Manual | Automático |
| Seriales duplicados | No detecta | Detecta |
| Experiencia | Tediosa | Rápida |

---

## 📊 Información de Registro

Los equipos se guardarán con:
- **codActivoFijo**: Generado automáticamente (ATM###)
- **marca, modelo, sn, disco, memoria, procesador, so**: Del CSV
- **licencia**: Del CSV (opcional)
- **tipoEquipo**: Laptop (por defecto, editable)
- **condicion**: Nuevo (por defecto, editable)
- **registradoPor**: Tu usuario actual
- **fechaRegistro**: Fecha/hora del servidor

---

## ✅ Checklist Antes de Importar

- [ ] Datos en formato TAB-separado
- [ ] Todos los seriales son únicos
- [ ] No hay columnas vacías
- [ ] Cada equipo está en una línea
- [ ] Se puede copiar correctamente desde la fuente
- [ ] Se revisó al menos un registro de ejemplo

---

## 🆘 Resolución de Problemas

### P: Algunos equipos no se importaron
**R:** Verifica el resumen del error. Probablemente:
- Falta alguno de los 7 campos requeridos
- El serial ya existe en la base de datos
- Hay espacios adicionales en los campos

### P: Los datos se ven desalineados
**R:** Asegúrate de usar TAB para separar, no espacios. Si copias desde Excel, debería funcionar automáticamente.

### P: Quiero editar el Tipo de Equipo después
**R:** Sí, puedes. Usa el botón ✏️ en cada equipo para cambiar el tipo y condición.

### P: ¿Cuál es el máximo de equipos a importar?
**R:** Teóricamente ilimitado, pero se recomienda hacer lotes de 100-200 para mejor control.

---

**Fecha de Implementación**: 19 de Diciembre, 2025  
**Versión**: 1.0  
**Formato**: Tab-Separated Values (TSV)  
**Campos Requeridos**: 7  
**Campos Opcionales**: 1
