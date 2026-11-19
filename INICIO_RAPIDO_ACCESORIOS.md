# ⚡ INICIO RÁPIDO - Importar Accesorios en Lote

## ✅ Funcionalidad Implementada

Se ha implementado una **importación en lote** para accesorios en el módulo de **"Gestión de Accesorios"** con formato **TAB-separado**.

---

## 🚀 5 Pasos Rápidos

### 1️⃣ Abre el Módulo
```
Menú → Gestión de Accesorios
```

### 2️⃣ Haz clic en "Importar Lote"
```
Botón gris: 📥 Importar Lote
```

### 3️⃣ Pega tus datos (formato TAB)
```
Tipo de Accesorio	Condición	Marca	Modelo	Serial
Cable HDMI	Nuevo	HDMI	2.1	HDMI-001
Mouse	Nuevo	Logitech	MX Master	LOG-001
Teclado	Nuevo	Corsair	K95	COR-001
```

### 4️⃣ Haz clic en "Importar"
```
Botón azul: ✓ Importar
```

### 5️⃣ ¡Listo!
```
Se importaron X accesorio(s) ✓
```

---

## 📋 Formato

```
Tipo de Accesorio [TAB] Condición [TAB] Marca [TAB] Modelo [TAB] Serial
```

**Campos:**
1. **Tipo de Accesorio**: Cable, Mouse, Teclado, Monitor, etc.
2. **Condición**: `Nuevo` o `Usado` (exactamente así)
3. **Marca**: Logitech, Corsair, Dell, Apple, etc.
4. **Modelo**: Identificador del modelo
5. **Serial**: Número de serie único

---

## 📁 Archivo de Ejemplo

Consulta el archivo `ACCESORIOS_A_IMPORTAR.txt` en la raíz del proyecto para ver un ejemplo completo con 10 accesorios de muestra.

---

## ⚠️ Importante

- Se generarán códigos automáticamente (ATM-ACC-0001, ATM-ACC-0002, etc.)
- Los seriales duplicados serán ignorados
- Se requieren todos los 5 campos
- La Condición debe ser "Nuevo" o "Usado"
- Los datos se guardan directamente en la base de datos

---

## 📝 Ejemplo Completo

```
Cable HDMI	Nuevo	HDMI	2.1	HDMI-001
Mouse Inalámbrico	Nuevo	Logitech	MX Master 3S	LOG-MUS-001
Teclado Mecánico	Nuevo	Corsair	K95 RGB Platinum	COR-KEY-001
Monitor USB-C	Usado	Dell	U2720Q	DELL-MON-001
Hub USB	Nuevo	Anker	PowerExpand Elite 13-in-1	ANK-HUB-001
```

---

**Tiempo estimado:** ⏱️ < 1 minuto para 10 accesorios

**Guía completa:** Ver [GUIA_IMPORTACION_ACCESORIOS.md](GUIA_IMPORTACION_ACCESORIOS.md)
