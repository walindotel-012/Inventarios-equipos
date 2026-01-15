# 📥 Importación de Nomenclaturas en Lote

## ✅ Funcionalidad Implementada

Se ha agregado la capacidad de importar múltiples nomenclaturas (NetBios Names) de forma masiva en el módulo de **Gestión de Colaboradores**.

## 📋 Nomenclaturas a Importar (30 total)

```
AUVECRFOLABE01
AUVEASFALABE01
AUFIGELABE01
AUGEVEFOLABE01
AUGEVEFOLABE02
AUPOCORELABE01
AUVEDIOJLABE01
AUVEGOFOLABE01
AUJTPOLABE01
AUTICOOLABE01
AUFIOPMLABE01
AUGEPOLABE01
AUVEDEFOLABE01
AUFICOOLABE01
AUPRELABE01
AUGEMEFOLABE01
AUGEMEOJLABE01
AUFIFALABE01
AUGEVEOJLABE01
AUVESAFOLAPR01
AUVESAFOLAPR02
AUDACOLABE01
AULOENLABE01
AUGECAOJLABE01
AUGEAGHLABE01
AUPOASESB01
AUVCRMFOLABE01
AUGECAFOLABE01
AUGEMEOJLABE02
AUGECAFOLABE02
```

## 🚀 Cómo Usar

### Paso 1: Acceder al Módulo
1. Inicia sesión en la aplicación
2. Ve a la sección **"Gestión de Colaboradores"**

### Paso 2: Hacer Clic en Importar
1. En la esquina superior derecha, encontrarás un botón **"📥 Importar en Lote"**
2. Haz clic en él

### Paso 3: Copiar y Pegar las Nomenclaturas
1. En el formulario de importación, verás un área de texto
2. Copia todas las nomenclaturas (puedes usar el archivo `NOMENCLATURAS_A_IMPORTAR.txt`)
3. Pégalas en el área de texto del formulario

### Paso 4: Importar
1. Verifica que se muestren todas las nomenclaturas a importar (se cuenta automáticamente)
2. Haz clic en el botón **"Importar"**
3. El sistema procesará todas las nomenclaturas y te mostrará un resumen

## ℹ️ Características

✅ **Una por línea**: Cada nomenclatura debe estar en una línea diferente  
✅ **Mayúsculas automáticas**: Se convierten automáticamente a mayúsculas  
✅ **Validación de duplicados**: Ignora las nomenclaturas que ya existen  
✅ **Límite de caracteres**: Máximo 14 caracteres por nomenclatura  
✅ **Resumen de importación**: Te indica cuántas se importaron y cuántas estaban duplicadas

## 📝 Cambios en el Código

### Archivo Modificado: `src/pages/Nomenclaturas.jsx`

**Nuevas Variables de Estado:**
- `showImportForm`: Controla la visibilidad del formulario de importación
- `importText`: Almacena el texto a importar

**Nueva Función:**
- `handleImportNomenclaturas()`: Procesa la importación masiva

**Mejoras en UI:**
- Botón "📥 Importar en Lote" en el header
- Formulario de importación con textarea
- Información sobre el proceso de importación

## 🔄 Flujo de Importación

1. El usuario pega las nomenclaturas en el formulario (una por línea)
2. El sistema cuenta automáticamente cuántas hay
3. Valida que no excedan 14 caracteres
4. Verifica duplicados con las nomenclaturas existentes
5. Importa solo las nuevas
6. Muestra un resumen con éxito/duplicados
7. Recarga la lista de colaboradores

## ⚠️ Notas Importantes

- **Duplicados**: Si una nomenclatura ya existe, se ignora pero se cuenta como procesada
- **Conversión**: Todas se convertirán a mayúsculas automáticamente
- **Validación**: Si hay caracteres inválidos o exceden 14 caracteres, se rechazarán
- **Usuario**: Todas se registrarán con "Sistema - Inserción Masiva" como registrador (puede editarse manualmente después)

## 📊 Información del Usuario

Las nomenclaturas se guardarán con:
- **netbiosName**: El nombre ingresado
- **registradoPor**: "Sistema - Inserción Masiva" (o el usuario actual si lo editas)
- **fechaRegistro**: Fecha/hora actual del servidor

---

**Fecha de Implementación**: 19 de Diciembre, 2025  
**Total de Nomenclaturas a Importar**: 30
