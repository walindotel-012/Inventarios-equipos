# 📋 ESTRUCTURA DE INSERCIÓN - Módulo ASIGNACIONES

## 📌 Orden Exacto de Inserción en Firestore

Cuando se guarda una asignación en la colección `asignaciones`, se insertan los siguientes campos **en este orden**:

---

## 🏢 SECCIÓN 1: DATOS DE LA EMPRESA Y UBICACIÓN

```
1. sucursal              (texto)     - Sucursal de la empresa
2. oficina              (texto)     - Oficina/departamento
3. puesto               (texto)     - Puesto del colaborador
4. nombre               (texto)     - Nombre del colaborador
5. usuario              (texto)     - Usuario del sistema
6. empresa              (texto)     - "AUTOMÍA SAS" (valor fijo)
```

---

## 💻 SECCIÓN 2: EQUIPO PRIMARY (Principal)

```
7. equipo               (texto)     - Descripción del equipo
8. codActivoFijo        (texto)     - Código ATM del equipo (ej: ATM001)
9. netbiosName          (texto)     - Nombre NetBios del equipo
10. marca               (texto)     - Marca (Dell, HP, etc.)
11. modelo              (texto)     - Modelo del equipo
12. sn                  (texto)     - Serial/SN del equipo
13. disco               (texto)     - Capacidad disco (512GB, 1TB, etc.)
14. memoria             (texto)     - RAM (16GB, 32GB, etc.)
15. procesador          (texto)     - Procesador
16. so                  (texto)     - Sistema operativo
17. licencia            (texto)     - Número de licencia (opcional)
18. tipoEquipo          (texto)     - Tipo (Laptop, Monitor, CPU, etc.)
19. condicion           (texto)     - Condición (Nuevo, Usado)
```

---

## 📅 SECCIÓN 3: FECHAS Y RESPONSABLES

```
20. fechaAsignacion     (fecha)     - Fecha asignación (YYYY-MM-DD)
21. asignadoPor         (texto)     - Quién asignó (usuario actual)
22. hojaEntregaUrl      (texto)     - URL de documento de entrega
23. nombreEntrega       (texto)     - Nombre quien entrega
24. fechaEntrega        (fecha)     - Fecha de entrega (YYYY-MM-DD)
```

---

## 💻 SECCIÓN 4: EQUIPO SECUNDARIO

```
25. equipoSecundario           (texto)     - Descripción equipo secundario
26. codActivoFijoSecundario    (texto)     - Código ATM secundario
27. marcaSecundario            (texto)     - Marca secundario
28. modeloSecundario           (texto)     - Modelo secundario
29. snSecundario               (texto)     - Serial secundario
30. discoSecundario            (texto)     - Disco secundario
31. memoriaSecundario          (texto)     - Memoria secundario
32. procesadorSecundario       (texto)     - Procesador secundario
33. soSecundario               (texto)     - SO secundario
34. licenciaSecundario         (texto)     - Licencia secundaria
35. tipoEquipoSecundario       (texto)     - Tipo equipo secundario
36. condicionSecundario        (texto)     - Condición secundario
```

---

## 📱 SECCIÓN 5: CELULAR/MÓVIL

```
37. celularId               (texto)     - ID del celular
38. serialCelular           (texto)     - Serial del celular
39. marcaCelular            (texto)     - Marca (Samsung, iPhone, etc.)
40. modeloCelular           (texto)     - Modelo del celular
41. numeroCelular           (texto)     - Número telefónico
42. condicionCelular        (texto)     - Condición (Nuevo, Usado)
43. restriccionCelular      (texto)     - Restricción de uso
44. imeiCelular             (texto)     - IMEI del celular
45. planCelular             (texto)     - Plan telefónico
46. fechaAsignacionCelular  (fecha)     - Fecha asignación celular
```

---

## 📝 SECCIÓN 6: OBSERVACIONES

```
47. observaciones          (texto)     - Observaciones generales
```

---

## ⏰ SECCIÓN 7: FECHA DE REGISTRO (Automática)

```
48. fechaRegistro          (timestamp) - Agregada automáticamente por código
                                        new Date() en el momento de guardar
```

---

## 📊 RESUMEN VISUAL

```
┌─────────────────────────────────────────────────┐
│ ESTRUCTURA ASIGNACIÓN (48 CAMPOS)               │
├─────────────────────────────────────────────────┤
│ 1. Empresa/Ubicación (6 campos)                 │
│   - sucursal, oficina, puesto, nombre, usuario, │
│     empresa                                      │
├─────────────────────────────────────────────────┤
│ 2. Equipo Principal (13 campos)                 │
│   - equipo, codActivoFijo, netbiosName,         │
│     marca, modelo, sn, disco, memoria,          │
│     procesador, so, licencia, tipoEquipo,       │
│     condicion                                    │
├─────────────────────────────────────────────────┤
│ 3. Fechas/Responsables (5 campos)               │
│   - fechaAsignacion, asignadoPor,               │
│     hojaEntregaUrl, nombreEntrega,              │
│     fechaEntrega                                │
├─────────────────────────────────────────────────┤
│ 4. Equipo Secundario (12 campos)                │
│   - equipoSecundario, codActivoFijoSecundario,  │
│     marcaSecundario, modeloSecundario,          │
│     snSecundario, discoSecundario,              │
│     memoriaSecundario, procesadorSecundario,    │
│     soSecundario, licenciaSecundario,           │
│     tipoEquipoSecundario, condicionSecundario   │
├─────────────────────────────────────────────────┤
│ 5. Celular (10 campos)                          │
│   - celularId, serialCelular, marcaCelular,     │
│     modeloCelular, numeroCelular,               │
│     condicionCelular, restriccionCelular,       │
│     imeiCelular, planCelular,                   │
│     fechaAsignacionCelular                      │
├─────────────────────────────────────────────────┤
│ 6. Observaciones (1 campo)                      │
│   - observaciones                               │
├─────────────────────────────────────────────────┤
│ 7. Timestamp (1 campo - automático)             │
│   - fechaRegistro                               │
└─────────────────────────────────────────────────┘
```

---

## 💾 CÓDIGO EXACTO DE INSERCIÓN

```javascript
await addDoc(collection(db, 'asignaciones'), {
  ...formData,              // Todos los 47 campos anteriores
  fechaRegistro: new Date() // Campo agregado automáticamente
});
```

### Lo que significa `...formData`:

Expande todos los campos del objeto `formData` que se detallan arriba:
- sucursal, oficina, puesto, nombre, usuario, empresa
- equipo, codActivoFijo, netbiosName, marca, modelo, sn, disco, memoria, procesador, so, licencia, tipoEquipo, condicion
- fechaAsignacion, asignadoPor, hojaEntregaUrl, nombreEntrega, fechaEntrega
- equipoSecundario, codActivoFijoSecundario, marcaSecundario, modeloSecundario, snSecundario, discoSecundario, memoriaSecundario, procesadorSecundario, soSecundario, licenciaSecundario, tipoEquipoSecundario, condicionSecundario
- celularId, serialCelular, marcaCelular, modeloCelular, numeroCelular, condicionCelular, restriccionCelular, imeiCelular, planCelular, fechaAsignacionCelular
- observaciones

---

## 🔄 ACTUALIZACIÓN EN EQUIPOS RELACIONADOS

Además de insertar en `asignaciones`, el sistema también **actualiza** los equipos relacionados:

### Si hay `codActivoFijo` (Equipo Principal):
```javascript
await updateDoc(doc(db, 'equipos', equipoId), {
  estado: 'asignado',
  asignado: true,
});
```

### Si hay `codActivoFijoSecundario` (Equipo Secundario):
```javascript
await updateDoc(doc(db, 'equipos', equipoSecId), {
  estado: 'asignado',
  asignado: true,
});
```

### Si hay `serialCelular` (Celular):
```javascript
await updateDoc(doc(db, 'celulares', celularId), {
  estado: 'asignado',
  asignado: true,
});
```

---

## 📌 NOTAS IMPORTANTES

### Campos Requeridos
Algunos campos son requeridos para guardar:
- nombre
- usuario
- codActivoFijo (si hay equipo)
- serialCelular (si hay celular)

### Campos Opcionales
- licencia
- equipoSecundario y sus sub-campos
- celularId y sus sub-campos
- observaciones

### Valores Por Defecto
- empresa: "AUTOMÍA SAS" (fijo)
- asignadoPor: Usuario actual (displayName o email)
- nombreEntrega: Usuario actual
- fechaRegistro: Fecha/hora actual del servidor

### Tipos de Datos
- Texto/String: La mayoría de campos
- Fecha/Date: fechaAsignacion, fechaEntrega, fechaAsignacionCelular
- Timestamp: fechaRegistro (servidor)

---

## 🔍 EJEMPLO DE INSERCIÓN COMPLETA

```json
{
  "sucursal": "Bogotá",
  "oficina": "Dirección General",
  "puesto": "Gerente",
  "nombre": "Juan Pérez",
  "usuario": "juan.perez",
  "empresa": "AUTOMÍA SAS",
  "equipo": "Laptop principal",
  "codActivoFijo": "ATM001",
  "netbiosName": "AUVECRFOLABE01",
  "marca": "Dell",
  "modelo": "Latitude 5550",
  "sn": "D6TK374",
  "disco": "512 GB",
  "memoria": "16GB",
  "procesador": "Intel® Core™ Ultra 5 125U",
  "so": "Windows 11 Pro",
  "licencia": "XYZ-123-ABC",
  "tipoEquipo": "Laptop",
  "condicion": "Nuevo",
  "fechaAsignacion": "2025-12-19",
  "asignadoPor": "Admin User",
  "hojaEntregaUrl": "https://example.com/documento",
  "nombreEntrega": "Admin User",
  "fechaEntrega": "2025-12-19",
  "equipoSecundario": "",
  "codActivoFijoSecundario": "",
  "marcaSecundario": "",
  "modeloSecundario": "",
  "snSecundario": "",
  "discoSecundario": "",
  "memoriaSecundario": "",
  "procesadorSecundario": "",
  "soSecundario": "",
  "licenciaSecundario": "",
  "tipoEquipoSecundario": "",
  "condicionSecundario": "",
  "celularId": "",
  "serialCelular": "",
  "marcaCelular": "",
  "modeloCelular": "",
  "numeroCelular": "",
  "condicionCelular": "",
  "restriccionCelular": "",
  "imeiCelular": "",
  "planCelular": "",
  "fechaAsignacionCelular": "",
  "observaciones": "Entrega sin incidentes",
  "fechaRegistro": "2025-12-19T14:30:00.000Z"
}
```

---

## 📊 CONTEO DE CAMPOS

| Sección | Cantidad | Total |
|---------|----------|-------|
| Empresa/Ubicación | 6 | 6 |
| Equipo Principal | 13 | 19 |
| Fechas/Responsables | 5 | 24 |
| Equipo Secundario | 12 | 36 |
| Celular | 10 | 46 |
| Observaciones | 1 | 47 |
| Timestamp Automático | 1 | **48** |

---

**Documento Creado:** 19 de Diciembre, 2025  
**Total de Campos:** 48  
**Campos Automáticos:** 1  
**Campos Editables:** 47
