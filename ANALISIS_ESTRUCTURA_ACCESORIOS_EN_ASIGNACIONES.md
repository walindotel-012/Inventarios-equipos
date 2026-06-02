# 📦 ESTRUCTURA DE ACCESORIOS EN ASIGNACIONES - Análisis Completo

## 📌 Resumen Ejecutivo

Los accesorios en la colección de asignaciones se almacenan como un **ARRAY de objetos**, permitiendo que cada asignación tenga **múltiples accesorios asociados**. Este es un modelo flexible y escalable.

---

## 1️⃣ ESTRUCTURA GENERAL EN FIRESTORE

### Documento de Asignación (colección: `asignaciones`)

```json
{
  "id": "auto-generated-id",
  "nombre": "Juan Pérez",
  "usuario": "juan.perez",
  "empresa": "AUTOMÍA SAS",
  "sucursal": "Oficina Principal",
  "oficina": "Tecnología",
  "puesto": "Analista de Sistemas",
  
  // ... otros campos de equipo, celular, etc ...
  
  "accesorios": [
    {
      "id": "ATM-ACC-0001",
      "codigoActivoFijo": "ATM-ACC-0001",
      "tipoAccesorio": "Mochila",
      "marca": "Samsonite",
      "modelo": "Business",
      "condicion": "Nuevo",
      "serial": "SAM-MOC-001"
    },
    {
      "id": "ATM-ACC-0002",
      "codigoActivoFijo": "ATM-ACC-0002",
      "tipoAccesorio": "Mouse",
      "marca": "Logitech",
      "modelo": "MX Master 3S",
      "condicion": "Nuevo",
      "serial": "LOG-MUS-001"
    },
    {
      "id": "ATM-ACC-0003",
      "codigoActivoFijo": "ATM-ACC-0003",
      "tipoAccesorio": "Teclado",
      "marca": "Corsair",
      "modelo": "K95 RGB",
      "condicion": "Nuevo",
      "serial": "COR-KEY-001"
    }
  ],
  
  "observaciones": "Equipo con accesorios completos",
  "fechaRegistro": "2026-01-22T15:30:00.000Z"
}
```

---

## 2️⃣ RESPUESTA A TUS PREGUNTAS

### ✅ Pregunta 1: ¿Cómo se almacenan los accesorios?

**Respuesta:** Se almacenan como un **array llamado `accesorios`** dentro del documento de asignación. Este array contiene objetos individuales, donde cada objeto representa un accesorio.

**Ubicación en BD:**
```
Database (Firestore)
└── Collection: "asignaciones"
    └── Document: "doc-id-asignacion"
        ├── nombre: "Juan Pérez"
        ├── usuario: "juan.perez"
        ├── ... otros campos ...
        └── accesorios: [ {...}, {...}, {...} ]  ← ARRAY
```

---

### ✅ Pregunta 2: ¿Puede una asignación tener múltiples accesorios?

**Respuesta: SÍ, definitivamente**. La estructura de array permite **N accesorios** por asignación.

**Ejemplos:**
- Asignación con 0 accesorios: `accesorios: []`
- Asignación con 1 accesorio: `accesorios: [{ accesorio1 }]`
- Asignación con 3 accesorios: `accesorios: [{ accesorio1 }, { accesorio2 }, { accesorio3 }]`
- Asignación con N accesorios: `accesorios: [{...}, {...}, ..., {...}]`

**Evidencia en código:** (Asignacion.jsx línea 106)
```javascript
accesorios: [],  // Inicializado como array vacío
```

---

### ✅ Pregunta 3: ¿Cuáles son los campos para accesorios?

Cada accesorio dentro del array tiene estos campos:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | String | Identificador único del accesorio | `"ATM-ACC-0001"` |
| `codigoActivoFijo` | String | Código de activo fijo (igual a `id`) | `"ATM-ACC-0001"` |
| `tipoAccesorio` | String | Tipo/categoría del accesorio | `"Mochila"`, `"Mouse"`, `"Teclado"` |
| `marca` | String | Marca del fabricante | `"Samsonite"`, `"Logitech"` |
| `modelo` | String | Modelo específico | `"Business"`, `"MX Master 3S"` |
| `condicion` | String | Estado del accesorio | `"Nuevo"`, `"Usado"` |
| `serial` | String | Número de serie único | `"SAM-MOC-001"` |

**Estructura de objeto accesorio:**
```javascript
{
  id: "ATM-ACC-0001",
  codigoActivoFijo: "ATM-ACC-0001",
  tipoAccesorio: "Mochila",
  marca: "Samsonite",
  modelo: "Business",
  condicion: "Nuevo",
  serial: "SAM-MOC-001"
}
```

**Fuente en código:** (Asignacion.jsx líneas 333-342)
```javascript
const nuevoAccesorio = {
  id: accesorio.id,
  codigoActivoFijo: accesorio.codigoActivoFijo || '',
  tipoAccesorio: accesorio.tipoAccesorio || '',
  marca: accesorio.marca || '',
  modelo: accesorio.modelo || '',
  condicion: accesorio.condicion || '',
  serial: identificador,
};
```

---

### ✅ Pregunta 4: ¿Hay una subcategoría o array de accesorios?

**Respuesta: Sí, el campo `accesorios` ES el array.**

No hay una subcategoría adicional. El array de accesorios es el contenedor directo.

**Estructura:**
```javascript
// En formData durante edición/creación:
{
  nombre: "Juan Pérez",
  usuario: "juan.perez",
  // ... otros campos ...
  accesorios: [  // ← Este es el array
    { accesorio1 },
    { accesorio2 },
    { accesorio3 }
  ]
}

// Se guarda en Firestore como:
await addDoc(collection(db, 'asignaciones'), {
  ...formData,  // Expande todos los campos, incluyendo accesorios[]
  fechaRegistro: new Date()
});
```

---

## 3️⃣ ESTRUCTURA COMPLETA DE UN DOCUMENTO DE ASIGNACIÓN

### Organización de Campos (48+ campos)

```
DOCUMENTO ASIGNACIÓN
├── SECCIÓN 1: EMPRESA Y UBICACIÓN (6 campos)
│   ├── sucursal
│   ├── oficina
│   ├── puesto
│   ├── nombre
│   ├── usuario
│   └── empresa
│
├── SECCIÓN 2: EQUIPO PRINCIPAL (13 campos)
│   ├── equipo
│   ├── codActivoFijo
│   ├── netbiosName
│   ├── marca
│   ├── modelo
│   ├── sn
│   ├── disco
│   ├── memoria
│   ├── procesador
│   ├── so
│   ├── licencia
│   ├── tipoEquipo
│   └── condicion
│
├── SECCIÓN 3: FECHAS Y RESPONSABLES (5 campos)
│   ├── fechaAsignacion
│   ├── asignadoPor
│   ├── hojaEntregaUrl
│   ├── nombreEntrega
│   └── fechaEntrega
│
├── SECCIÓN 4: EQUIPO SECUNDARIO (12 campos)
│   ├── equipoSecundario
│   ├── codActivoFijoSecundario
│   ├── marcaSecundario
│   ├── modeloSecundario
│   ├── snSecundario
│   ├── discoSecundario
│   ├── memoriaSecundario
│   ├── procesadorSecundario
│   ├── soSecundario
│   ├── licenciaSecundario
│   ├── tipoEquipoSecundario
│   └── condicionSecundario
│
├── SECCIÓN 5: CELULAR (10 campos)
│   ├── celularId
│   ├── serialCelular
│   ├── marcaCelular
│   ├── modeloCelular
│   ├── numeroCelular
│   ├── condicionCelular
│   ├── restriccionCelular
│   ├── imeiCelular
│   ├── planCelular
│   └── fechaAsignacionCelular
│
├── SECCIÓN 6: ACCESORIOS ⭐ (1 campo = ARRAY)
│   └── accesorios: [
│       { accesorio1 },
│       { accesorio2 },
│       { accesorioN }
│     ]
│
├── SECCIÓN 7: OBSERVACIONES (1 campo)
│   └── observaciones
│
└── SECCIÓN 8: AUDITORIA (3 campos automáticos)
    ├── fechaRegistro (Timestamp)
    ├── actualizadoPor (en actualización)
    └── fechaActualizacion (en actualización)
```

---

## 4️⃣ OPERACIONES CON ACCESORIOS

### Agregar un Accesorio

**Código:** (Asignacion.jsx línea 346)
```javascript
setFormData(prev => ({
  ...prev,
  accesorios: [...accesoriosArray, nuevoAccesorio],
}));
```

**Resultado:**
```javascript
// Antes
accesorios: [{ accesorio1 }, { accesorio2 }]

// Después de agregar
accesorios: [{ accesorio1 }, { accesorio2 }, { accesorioNuevo }]
```

---

### Quitar un Accesorio

**Código:** (Asignacion.jsx línea 354-358)
```javascript
const handleRemoveAccesorio = (accesorioId) => {
  setFormData(prev => {
    const accesoriosArray = Array.isArray(prev.accesorios) ? prev.accesorios : [];
    return {
      ...prev,
      accesorios: accesoriosArray.filter(a => a.id !== accesorioId),
    };
  });
};
```

**Resultado:**
```javascript
// Antes
accesorios: [{ id: "ACC-001" }, { id: "ACC-002" }, { id: "ACC-003" }]

// Después de remover ACC-002
accesorios: [{ id: "ACC-001" }, { id: "ACC-003" }]
```

---

### Guardar en Firestore

**Código:** (Asignacion.jsx línea 616)
```javascript
const docRef = await addDoc(collection(db, 'asignaciones'), {
  ...formData,  // Incluye todo, incluyendo accesorios: [...]
  fechaRegistro: new Date(),
});
```

**Lo que se guarda:**
```json
{
  "nombre": "Juan Pérez",
  "usuario": "juan.perez",
  "... otros campos ...",
  "accesorios": [
    { accesorio1 },
    { accesorio2 },
    { accesorio3 }
  ],
  "fechaRegistro": "2026-01-22T15:30:00.000Z"
}
```

---

### Actualizar en Firestore

**Código:** (Asignacion.jsx línea 594)
```javascript
if (editingId) {
  await updateDoc(doc(db, 'asignaciones', editingId), {
    ...formData,  // Reemplaza los accesorios completos
    actualizadoPor: currentUser?.displayName || currentUser?.email,
    fechaActualizacion: new Date(),
  });
}
```

---

## 5️⃣ GESTIÓN DEL ESTADO DE ACCESORIOS

Cuando se asigna un accesorio, el sistema también actualiza la colección `accesorios`:

### Al Guardar una Asignación

**Código:** (Asignacion.jsx líneas 741-752)
```javascript
// Si son accesorios, marcarlos como asignados
const accesoriosArray = Array.isArray(formData.accesorios) ? formData.accesorios : [];
for (const accesorio of accesoriosArray) {
  const accesorioToUpdate = accesorios.find(a => a.id === accesorio.id);
  if (accesorioToUpdate) {
    console.log('Actualizando accesorio como asignado:', accesorioToUpdate.id, accesorioToUpdate.codigoActivoFijo);
    await updateDoc(doc(db, 'accesorios', accesorioToUpdate.id), {
      asignado: true,  // Marcar como asignado en colección accesorios
    });
  }
}
```

### Al Editar una Asignación

Si el usuario cambia los accesorios durante la edición:

**Código:** (Asignacion.jsx líneas 753-768)
```javascript
if (editingId && asignacionAnterior?.accesorios && Array.isArray(asignacionAnterior.accesorios)) {
  const accesorioArrayActual = Array.isArray(formData.accesorios) ? formData.accesorios : [];
  const accesoriosAnterioresIds = asignacionAnterior.accesorios.map(a => a.id);
  const accesoriosNuevosIds = accesorioArrayActual.map(a => a.id);
  
  // Devolver a disponible los que fueron removidos
  for (const accesorioId of accesoriosAnterioresIds) {
    if (!accesoriosNuevosIds.includes(accesorioId)) {
      const accesorioAnterior = accesorios.find(a => a.id === accesorioId);
      if (accesorioAnterior) {
        await updateDoc(doc(db, 'accesorios', accesorioAnterior.id), {
          asignado: false,  // Devolver a disponible
        });
      }
    }
  }
}
```

---

## 6️⃣ RETROCOMPATIBILIDAD (Formato Anterior)

El sistema soporta un formato anterior donde había un solo accesorio por asignación:

### Formato Antiguo:
```javascript
{
  accesorioId: "ATM-ACC-0001",
  accesorioNombre: "ATM-ACC-0001 - Mochila",
  codigoActivoFijoAccesorio: "ATM-ACC-0001",
  tipoAccesorio: "Mochila",
  marcaAccesorio: "Marca X",
  modeloAccesorio: "Modelo Y",
  condicionAccesorio: "Nuevo"
}
```

### Formato Nuevo (Actual):
```javascript
{
  accesorios: [
    {
      id: "ATM-ACC-0001",
      codigoActivoFijo: "ATM-ACC-0001",
      tipoAccesorio: "Mochila",
      marca: "Marca X",
      modelo: "Modelo Y",
      condicion: "Nuevo",
      serial: "..."
    }
  ]
}
```

**Conversión automática:** (Asignacion.jsx líneas 942-956)
```javascript
// Si es un accesorio antiguo, convertirlo al nuevo formato
if (formDataCompleto.accesorioId && (!Array.isArray(formDataCompleto.accesorios) || formDataCompleto.accesorios.length === 0)) {
  const accesorioAntiguoDb = accesorios.find(a => a.id === formDataCompleto.accesorioId);
  if (accesorioAntiguoDb) {
    const identificador = accesorioAntiguoDb.serial || accesorioAntiguoDb.numero || accesorioAntiguoDb.numeroSerie || accesorioAntiguoDb.imei || '';
    
    const accesorioConvertido = {
      id: accesorioAntiguoDb.id,
      // ... resto de campos ...
    };
  }
}
```

---

## 7️⃣ INTEGRACIÓN CON OTROS MÓDULOS

### Exportación a Excel

**Ubicación:** Asignacion.jsx (línea 1517)

```javascript
if (Array.isArray(asignacion.accesorios) && asignacion.accesorios.length > 0) {
  accesoriosTexto = asignacion.accesorios
    .map(acc => {
      const serial = acc.serial || acc.numero || acc.numeroSerie || acc.imei || '';
      return `${acc.codigoActivoFijo} - ${acc.tipoAccesorio}${serial ? ' (' + serial + ')' : ''}`;
    })
    .join('; ');
} else {
  accesoriosTexto = 'N/A';
}
```

**Resultado en Excel:**
```
Accesorio
ATM-ACC-0001 - Mochila (SAM-MOC-001); ATM-ACC-0002 - Mouse (LOG-MUS-001)
```

---

### Descargo PDF

**Ubicación:** Descargo.jsx

Los accesorios aparecen en la tabla de equipos:

```javascript
if (asignacion.accesorios && Array.isArray(asignacion.accesorios) && asignacion.accesorios.length > 0) {
  for (const acc of asignacion.accesorios) {
    equipos.push({
      tipo: 'Accesorio',
      cantidad: '1',
      marca: acc.marca || 'N/A',
      serial: acc.codigoActivoFijo || acc.id || '',
      especificaciones: acc.tipoAccesorio || 'Accesorio',
    });
  }
}
```

**Resultado en PDF:**
```
| Tipo      | Cantidad | Marca     | Serial       | Especificaciones |
|-----------|----------|-----------|--------------|------------------|
| Accesorio | 1        | Samsonite | ATM-ACC-0001 | Mochila         |
| Accesorio | 1        | Logitech  | ATM-ACC-0002 | Mouse           |
```

---

## 8️⃣ RESUMEN DE RESPUESTAS

| Pregunta | Respuesta |
|----------|-----------|
| **1. ¿Cómo se almacenan?** | Como un **array dentro del documento de asignación**, en el campo `accesorios: [...]` |
| **2. ¿Múltiples accesorios?** | **SÍ**, el array puede contener 0, 1, 2, N accesorios |
| **3. ¿Cuáles son los campos?** | `id`, `codigoActivoFijo`, `tipoAccesorio`, `marca`, `modelo`, `condicion`, `serial` |
| **4. ¿Hay subcategoría?** | **No**, el array `accesorios` es el contenedor directo, sin subcategorías adicionales |

---

## 9️⃣ VALIDACIONES Y RESTRICCIONES

✅ **Accesorios son opcionales** - No es obligatorio asignar un accesorio  
✅ **Solo asignados puede quedar vacío** - `accesorios: []` es válido  
✅ **Búsqueda en tiempo real** - Filtra por código, tipo, marca, modelo  
✅ **Solo accesorios disponibles** - Excluye automáticamente los ya asignados  
✅ **Marcar como asignado** - Al guardar, cada accesorio se marca `asignado: true` en su colección  
✅ **Desmarcar al remover** - Si se quita de la asignación, se devuelve a `asignado: false`  

---

## 📚 REFERENCIAS

| Archivo | Líneas | Concepto |
|---------|--------|----------|
| `src/pages/Asignacion.jsx` | 106 | Inicialización de `accesorios: []` |
| `src/pages/Asignacion.jsx` | 333-342 | Estructura de objeto accesorio |
| `src/pages/Asignacion.jsx` | 328-358 | Funciones agregar/quitar accesorio |
| `src/pages/Asignacion.jsx` | 616 | Guardar en Firestore con `addDoc` |
| `src/pages/Asignacion.jsx` | 594 | Actualizar en Firestore con `updateDoc` |
| `src/pages/Asignacion.jsx` | 741-780 | Gestión de estado (asignado/disponible) |
| `src/pages/Descargo.jsx` | ~150-200 | Integración en PDF |
| `INTEGRACION_ACCESORIOS_ASIGNACIONES.md` | 112-121 | Datos almacenados (antiguo formato) |

---

**Fecha de análisis:** 22 de enero de 2026  
**Estado:** ✅ ANÁLISIS COMPLETO
