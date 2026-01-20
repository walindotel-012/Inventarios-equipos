# Guía de Importación en Lote - Módulo Celulares

## Descripción General

La importación en lote permite registrar múltiples celulares de una sola vez mediante un formulario de texto, utilizando el mismo formato de tabulaciones (TAB) que se usa en el módulo de Equipos.

## Acceso

1. En la página **Gestión de Celulares**, haz clic en el botón **"Importar Lote"** (botón gris con icono de nube)
2. Se abrirá el formulario de importación en lote

## Formato de Datos

Los datos deben estar separados por **TAB** (tabulaciones) y seguir este orden exacto:

```
Tipo de equipo | Condición | Restricción | Serial | Marca | Modelo | IMEI | Número | Plan | Fecha Entrega
```

### Campos Requeridos

| Campo | Descripción | Valores Válidos | Ejemplo |
|-------|-------------|-----------------|---------|
| **Tipo de equipo** | Clasificación del dispositivo | FLOTA, ESIM | FLOTA |
| **Condición** | Estado del dispositivo | Nuevo, Usado, Personal-ESIM | Nuevo |
| **Restricción** | Tipo de restricción de uso | Abierta, Cerrada, Abierta LDI | Abierta |
| **Serial** | Número de serie del celular | Alfanumérico | SN123456 |
| **Marca** | Fabricante del dispositivo | Apple, Samsung, etc. | Apple |
| **Modelo** | Modelo específico | Cualquier texto | iPhone 14 Pro |
| **IMEI** | Código internacional de identificación | 15 dígitos | 359620098765432 |
| **Número** | Número de celular asignado | Formato telefónico | +57 3001234567 |
| **Plan** | Plan de datos contratado | Cualquier texto | 10 GB Plus con bloqueo |
| **Fecha Entrega** | Fecha de entrega al usuario | Formato YYYY-MM-DD | 2024-01-15 |

## Ejemplo Completo

```
FLOTA	Nuevo	Abierta	SN001	Apple	iPhone 14 Pro	359620098765432	+57 3001234567	10 GB Plus con bloqueo	2024-01-15
FLOTA	Usado	Cerrada	SN002	Samsung	Galaxy S23	359620098765433	+57 3002345678	10 GB Plus con bloqueo	2024-01-16
ESIM	Nuevo	Abierta LDI	SN003	Google	Pixel 7	359620098765434	+57 3003456789	10 GB Plus con bloqueo	2024-01-17
```

## Pasos para Importar

1. **Preparar los datos**: Asegúrate de tener la información en formato TAB-separated
2. **Copiar datos**: Copia toda la información (puedes hacer esto desde Excel, Google Sheets, etc.)
3. **Pegar en formulario**: Pega los datos en el área de texto del formulario
4. **Revisar**: El sistema mostrará el número de registros a importar
5. **Confirmar**: Haz clic en el botón **"Importar"**

## Validaciones Automáticas

El sistema realiza las siguientes validaciones durante la importación:

✅ **Serial duplicado**: Si un serial ya existe, se ignora el registro (no genera error)
✅ **IMEI duplicado**: Si un IMEI ya existe, se ignora el registro (no genera error)
✅ **Mayúsculas**: Se convierten automáticamente los seriales e IMEI a mayúsculas
✅ **Campos requeridos**: Todos los 10 campos deben estar completos
✅ **Tipo de equipo**: Debe ser FLOTA o ESIM
✅ **Condición**: Debe ser Nuevo, Usado o Personal-ESIM
✅ **Formato de número**: Se acepta cualquier formato de número

## Resultado de Importación

Después de importar, recibirás un mensaje con:
- ✅ Cantidad de celulares importados exitosamente
- ⚠️ Cantidad de seriales duplicados (ignorados)
- ⚠️ Cantidad de IMEI duplicados (ignorados)
- ❌ Cantidad de líneas con errores

### Ejemplo de Mensaje
```
Se importaron 8 celulares (1 serial duplicado ignorado) (2 IMEI duplicados ignorados)
```

## Cómo Preparar Datos en Excel

### Opción 1: Desde una hoja de cálculo existente

1. **En Excel o Google Sheets**:
   - Asegúrate de tener las columnas en el orden correcto
   - Selecciona todos los datos (sin encabezados)
   - Copia (Ctrl+C)

2. **En el formulario de importación**:
   - Pega los datos (Ctrl+V)
   - Los datos se importarán con formato TAB automáticamente

### Opción 2: Crear desde cero

1. **En Excel**:
   ```
   A: Tipo de equipo
   B: Condición
   C: Restricción
   D: Serial
   E: Marca
   F: Modelo
   G: IMEI
   H: Número
   I: Plan
   J: Fecha Entrega
   ```

2. **Copia y pega en el formulario** tal como se describe en la Opción 1

## Funcionalidades Especiales

### Auditoría
Cada celular importado queda registrado en el sistema de auditoría con:
- Usuario que realizó la importación
- Fecha y hora de importación
- Datos registrados

### Disponibilidad Inmediata
Los celulares importados:
- Aparecen inmediatamente en la lista
- Pueden ser editados
- Pueden ser eliminados
- Pueden ser filtrados

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Por favor pega los celulares a importar" | Campo vacío | Verifica que hayas pegado los datos |
| "Se importaron 0 celulares" | Líneas vacías | Revisa que no haya líneas en blanco al inicio/final |
| Seriales/IMEI ignorados | Duplicados | Revisa si ya existen en la base de datos |
| Campos insuficientes | Faltan TABs | Asegúrate de usar TAB entre columnas, no espacios |

## Comparación: Importación vs Entrada Manual

| Aspecto | Importación Lote | Entrada Manual |
|--------|-----------------|-----------------|
| Celulares simultáneos | 100+ a la vez | 1 por vez |
| Tiempo | Muy rápido | Lento |
| Errores | Menos | Más probabilidad |
| Auditoría | Sí | Sí |
| Validaciones | Automáticas | Manuales |

## Exportar Celulares para Referencia

Para obtener un formato de referencia:
1. Ve a **Gestión de Celulares**
2. Haz clic en **"Exportar a Excel"**
3. Abre el archivo Excel
4. Usa esto como plantilla para nuevas importaciones

## Soporte

Si tienes problemas con la importación:
1. Verifica el formato TAB
2. Asegúrate de que todos los campos estén completos
3. Revisa que no haya caracteres especiales problemáticos
4. Intenta importar un registro de prueba primero
