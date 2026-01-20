# Quick Start - Importación en Lote de Celulares

## 5 Pasos Rápidos

### 1️⃣ Abre el Módulo
```
Menú → Gestión de Celulares
```

### 2️⃣ Haz clic en "Importar Lote"
```
Botón gris: 📥 Importar Lote
```

### 3️⃣ Pega tus datos (formato TAB)
```
Tipo	Condición	Restricción	Serial	Marca	Modelo	IMEI	Número	Plan	Fecha
FLOTA	Nuevo	Abierta	SN001	Apple	iPhone 14 Pro	359620098765432	+57 3001234567	Plan	2024-01-15
```

### 4️⃣ Haz clic en "Importar"
```
Botón azul: ✓ Importar
```

### 5️⃣ ¡Listo!
```
Se importaron X celular(es) ✓
```

---

## Formato TAB Rápido

```
Tipo Equipo	Condición	Restricción	Serial	Marca	Modelo	IMEI	Número	Plan	Fecha Entrega
FLOTA	Nuevo	Abierta	SERIAL001	Apple	iPhone 14	359620098765432	+57 3001234567	10 GB Plus	2024-01-15
FLOTA	Nuevo	Cerrada	SERIAL002	Samsung	Galaxy S23	359620098765433	+57 3002345678	10 GB Plus	2024-01-15
ESIM	Nuevo	Abierta LDI	SERIAL003	Google	Pixel 7	359620098765434	+57 3003456789	10 GB Plus	2024-01-15
```

---

## Valores Válidos

### Tipo de Equipo:
- `FLOTA`
- `ESIM`

### Condición:
- `Nuevo`
- `Usado`
- `Personal-ESIM`

### Restricción:
- `Abierta`
- `Cerrada`
- `Abierta LDI`

---

## Desde Excel

### En Excel:
1. Columna A: Tipo
2. Columna B: Condición
3. Columna C: Restricción
4. Columna D: Serial
5. Columna E: Marca
6. Columna F: Modelo
7. Columna G: IMEI
8. Columna H: Número
9. Columna I: Plan
10. Columna J: Fecha

### Copiar y Pegar:
1. Selecciona datos (sin encabezados)
2. Ctrl+C (copiar)
3. En formulario: Ctrl+V (pegar)
4. Click Importar

---

## Errores Comunes

| Error | Solución |
|-------|----------|
| Campo vacío | Revisa que todos los 10 campos estén llenos |
| Serial duplicado | Revisa si ya existe en la BD |
| IMEI duplicado | Revisa si ya existe en la BD |
| Campos insuficientes | Asegúrate de usar TAB, no espacios |
| Línea vacía | Elimina líneas en blanco |

---

## Validaciones Automáticas

✓ Seriales duplicados → Se ignoran  
✓ IMEI duplicados → Se ignoran  
✓ Mayúsculas/minúsculas → Se normalizan  
✓ Espacios extras → Se limpian  
✓ Auditoría → Se registra todo  

---

## Documentos de Referencia

- 📖 **GUIA_IMPORTACION_CELULARES.md** - Guía completa
- 📝 **CELULARES_A_IMPORTAR.txt** - Plantilla con ejemplos
- 🔄 **COMPARACION_VISUAL_IMPORTACION.md** - Comparación Equipos vs Celulares

---

## Atajo de Teclado

```
1. Alt+E → Equipos
2. Alt+C → Celulares (después click Importar Lote)
3. Ctrl+V → Pegar datos
4. Ctrl+Enter → Enviar formulario
```

---

## Resultado Esperado

```
✓ Se importaron 10 celulares (1 serial duplicado ignorado) (2 IMEI duplicados ignorados)
```

---

## Próximos Pasos

✅ Los celulares importados aparecen en la lista  
✅ Se pueden editar  
✅ Se pueden eliminar  
✅ Se pueden filtrar  
✅ Se pueden exportar a Excel  

---

## Soporte Rápido

**¿Qué significa...?**

- **FLOTA**: Celular de la empresa (corporativo)
- **ESIM**: Dispositivo con SIM virtual/eSIM
- **Personal-ESIM**: Dispositivo personal con eSIM
- **Abierta**: Sin restricciones de uso
- **Cerrada**: Con restricciones de uso
- **Abierta LDI**: Abierta con LDI (Larga Distancia Internacional)
- **IMEI**: Identificador único del dispositivo móvil
- **Serial**: Número de serie del dispositivo

---

**¡Listo para importar masivamente! 🚀**
