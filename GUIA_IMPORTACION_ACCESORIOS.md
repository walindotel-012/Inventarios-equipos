# 📥 Guía de Importación de Accesorios en Lote

## Descripción

La funcionalidad de importación en lote de accesorios permite registrar múltiples accesorios de una sola vez mediante un archivo TSV (Tab-Separated Values).

---

## 🚀 Cómo Usar

### Paso 1: Acceder al Módulo
1. Inicia sesión en la aplicación
2. Ve a **"Gestión de Accesorios"**

### Paso 2: Hacer Clic en Importar
1. En la esquina superior derecha, encontrarás un botón **"📥 Importar en Lote"**
2. Haz clic en él

### Paso 3: Preparar los Datos
1. Asegúrate de que tus datos estén en el formato correcto (TAB-separado)
2. Cada accesorio debe estar en una línea diferente

### Paso 4: Copiar y Pegar
1. Copia tus datos desde Excel, CSV o cualquier otra fuente
2. Pégalos en el área de texto del formulario
3. Verifica que se muestren todos los accesorios correctamente

### Paso 5: Importar
1. Haz clic en el botón azul **"✓ Importar"**
2. El sistema validará los datos y creará los registros
3. Verás un resumen con los resultados de la importación

---

## 📋 Formato Esperado

### Estructura General

```
Tipo de Accesorio	Condición	Marca	Modelo	Serial
Cable HDMI	Nuevo	HDMI	2.1	HDMI-001
Mouse	Nuevo	Logitech	MX Master 3S	LOG-001
```

### Detalles de Campos

**Posición 1: Tipo de Accesorio** *(requerido)*
- Descripción del tipo de accesorio
- Ejemplos: Cable HDMI, Mouse, Teclado, Monitor, Hub USB, etc.

**Posición 2: Condición** *(requerido)*
- Solo acepta: `Nuevo` o `Usado`
- Debe escribirse exactamente como se muestra
- ⚠️ Si pones otro valor, la línea será ignorada

**Posición 3: Marca** *(requerido)*
- Nombre del fabricante
- Ejemplos: Logitech, Corsair, Dell, Apple, etc.

**Posición 4: Modelo** *(requerido)*
- Identificador del modelo
- Ejemplos: MX Master 3S, K95 RGB, U2720Q, etc.

**Posición 5: Serial (S/N)** *(requerido)*
- Número de serie único del accesorio
- Se convertirá automáticamente a mayúsculas
- Los seriales duplicados serán ignorados

---

## 📊 Ejemplo de Datos

Ver archivo `ACCESORIOS_A_IMPORTAR.txt` para un ejemplo completo con 10 accesorios de muestra.

### Archivo de Muestra (formato correcto)
```
Cable HDMI	Nuevo	HDMI	2.1	HDMI-001
Mouse Inalámbrico	Nuevo	Logitech	MX Master 3S	LOG-MUS-001
Teclado Mecánico	Nuevo	Corsair	K95 RGB Platinum	COR-KEY-001
Monitor USB-C	Usado	Dell	U2720Q	DELL-MON-001
Hub USB	Nuevo	Anker	PowerExpand Elite 13-in-1	ANK-HUB-001
Cargador Rápido	Nuevo	Apple	140W USB-C	APP-CHA-001
Adaptador HDMI	Nuevo	Belkin	AB2000200	BEL-ADP-001
Cable Ethernet	Nuevo	Categoría	CAT6 2m	CAT-ETH-001
Soporte Laptop	Usado	Rain Design	mStand	RAI-SOP-001
Docking Station	Nuevo	Lenovo	ThinkPad	LEN-DOC-001
```

---

## ✅ Validaciones Automáticas

El sistema realiza las siguientes validaciones:

1. **Campos Requeridos**: Todos los 5 campos deben estar presentes
2. **Campos Vacíos**: No puede haber campos vacíos
3. **Condición**: Solo acepta "Nuevo" o "Usado"
4. **Seriales Duplicados**: Detecta y rechaza seriales ya existentes en la base de datos
5. **Seriales Duplicados en el Lote**: Detecta duplicados dentro de la importación actual

---

## 📈 Flujo de Importación

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
Genera códigos ATM automáticos (ATM-ACC-XXXX)
        ↓
Inserta en Firestore
        ↓
Muestra resumen (importados + errores)
        ↓
Recarga lista de accesorios
```

---

## 🛠️ Código Generado Automáticamente

### Código de Activo Fijo

Se genera automáticamente en el formato: **ATM-ACC-XXXX**

Ejemplo:
- Primer accesorio importado: `ATM-ACC-0001`
- Segundo accesorio importado: `ATM-ACC-0002`
- Y así sucesivamente...

---

## ⚠️ Notas Importantes

- Los datos se importan directamente a la base de datos (Firestore)
- No hay opción de "vista previa" antes de confirmar
- Se recomienda hacer una copia de seguridad antes de importar datos en lote
- Cada importación crea registros nuevos (no actualiza existentes)
- Los accesorios importados aparecerán como "no asignados" en el módulo de Asignaciones
- Se pueden agregar a las asignaciones desde el módulo de Asignaciones

---

## 🔄 Integración con Otros Módulos

### Módulo de Asignaciones

Después de importar accesorios, puedes:
1. Ir al módulo de **Asignaciones**
2. Crear una nueva asignación
3. Encontrar los accesorios importados en el dropdown de accesorios
4. Asignarlos a colaboradores

---

## 📞 Troubleshooting

### "Se importaron 0 accesorios"
- Verifica que el formato sea correcto (separado por TAB)
- Asegúrate que haya al menos 5 campos en cada línea
- Revisa que los campos requeridos no estén vacíos

### "Seriales duplicados ignorados"
- El serial ya existe en la base de datos
- O se repite en el lote actual
- Cambia el serial o elimina el duplicado de la lista de importación

### "Condición inválida"
- La condición debe ser exactamente "Nuevo" o "Usado"
- Verifica mayúsculas/minúsculas

### "Líneas con error"
- Revisa que todos los campos necesarios estén presentes
- Asegúrate que no haya campos vacíos
- El formato debe ser exactamente: Tipo[TAB]Condición[TAB]Marca[TAB]Modelo[TAB]Serial

---

## 📝 Checklist Rápido

- [ ] Datos en formato Excel o similar
- [ ] Separador: **TAB** (no espacios)
- [ ] Condición es "Nuevo" o "Usado"
- [ ] Seriales únicos (no repetidos)
- [ ] Al menos 5 campos por línea
- [ ] Sin campos vacíos
- [ ] Archivo ACCESORIOS_A_IMPORTAR.txt copiado (opcional)

---

**Versión:** 1.0  
**Última actualización:** 2026-02-17  
**Módulo:** Gestión de Accesorios  
**Formato:** TSV (Tab-Separated Values)
