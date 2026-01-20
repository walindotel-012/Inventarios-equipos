# Comparación Visual - Importación en Lote

## Módulo Equipos vs Módulo Celulares

### 1. HEADER / BOTONES

#### Equipos (Original):
```
┌─────────────────────────────────────────────────────────────┐
│  Gestión de Equipos                    [Importar Lote] [+]  │
│  Registra y administra todos los...                          │
└─────────────────────────────────────────────────────────────┘
```

#### Celulares (Nuevo):
```
┌─────────────────────────────────────────────────────────────┐
│  Gestión de Celulares                  [Importar Lote] [+]  │
│  Registra y administra todos los...                          │
└─────────────────────────────────────────────────────────────┘
```

### 2. FORMULARIO DE IMPORTACIÓN

#### Equipos (Original):
```
╔════════════════════════════════════════════════════════════╗
║  📥 Importar Equipos en Lote                               ║
╠════════════════════════════════════════════════════════════╣
║  ℹ️ Formato esperado (separado por TAB)                    ║
║  Tipo de equipo | Condición | Marca | Modelo | Serial |   ║
║  Disco | Memoria | Procesador | SO | [Licencia (opcional)]║
║                                                             ║
║  Ejemplo: Laptop | Nuevo | Dell | Latitude 5550 | D6TK... ║
╠════════════════════════════════════════════════════════════╣
║  [Equipos (uno por línea, separados por TAB)           ]  ║
║  [                                                       ]  ║
║  [        Se importarán: 0 equipo(s)                   ]  ║
║  [                                                       ]  ║
╠════════════════════════════════════════════════════════════╣
║  ⚠️ Información importante                                 ║
║  • Se generarán códigos de activo fijo automáticamente     ║
║  • Los seriales duplicados serán ignorados                 ║
║  • Se convertirán seriales a mayúsculas                    ║
║  • Todos los campos son requeridos excepto Licencia        ║
╠════════════════════════════════════════════════════════════╣
║  [       Importar       ] [       Cancelar        ]       ║
╚════════════════════════════════════════════════════════════╝
```

#### Celulares (Nuevo):
```
╔════════════════════════════════════════════════════════════╗
║  📥 Importar Celulares en Lote                             ║
╠════════════════════════════════════════════════════════════╣
║  ℹ️ Formato esperado (separado por TAB)                    ║
║  Tipo de equipo | Condición | Restricción | Serial |       ║
║  Marca | Modelo | IMEI | Número | Plan | Fecha Entrega    ║
║                                                             ║
║  Ejemplo: FLOTA | Nuevo | Abierta | SN123456 | Apple |...║
╠════════════════════════════════════════════════════════════╣
║  [Celulares (uno por línea, separados por TAB)        ]  ║
║  [                                                       ]  ║
║  [        Se importarán: 0 celular(es)                 ]  ║
║  [                                                       ]  ║
╠════════════════════════════════════════════════════════════╣
║  ⚠️ Información importante                                 ║
║  • Los seriales duplicados serán ignorados                 ║
║  • Los IMEI duplicados serán ignorados                     ║
║  • Se convertirán seriales e IMEI a mayúsculas             ║
║  • Todos los campos son requeridos                         ║
║  • Tipo de equipo debe ser: FLOTA o ESIM                   ║
║  • Condición debe ser: Nuevo, Usado o Personal-ESIM        ║
╠════════════════════════════════════════════════════════════╣
║  [       Importar       ] [       Cancelar        ]       ║
╚════════════════════════════════════════════════════════════╝
```

### 3. ESTRUCTURA DE DATOS

#### Equipos (Original):
```javascript
{
  codActivoFijo: "ATM-EQ-001",
  tipoEquipo: "Laptop",
  condicion: "Nuevo",
  marca: "Dell",
  modelo: "Latitude 5550",
  sn: "D6TK374",
  disco: "512 GB",
  memoria: "16 GB",
  procesador: "Intel® Core™ Ultra 5",
  so: "Windows 11 Pro",
  licencia: "Office 2024",
  estado: "disponible",
  asignado: false,
  registradoPor: "usuario@empresa.com",
  fechaRegistro: Timestamp
}
```

#### Celulares (Nuevo):
```javascript
{
  tipoEquipo: "FLOTA",
  condicion: "Nuevo",
  restriccion: "Abierta",
  serial: "SN001",
  marca: "Apple",
  modelo: "iPhone 14 Pro",
  imei: "359620098765432",
  numero: "+57 3001234567",
  plan: "10 GB Plus con bloqueo",
  fechaEntrega: "2024-01-15",
  registradoPor: "usuario@empresa.com",
  fechaRegistro: Timestamp
}
```

### 4. CAMPOS DE IMPORTACIÓN

#### Equipos (9-10 campos):
```
1. Tipo de equipo        (requerido)
2. Condición             (requerido)
3. Marca                 (requerido)
4. Modelo                (requerido)
5. Serial                (requerido)
6. Disco                 (requerido)
7. Memoria               (requerido)
8. Procesador            (requerido)
9. SO                    (requerido)
10. Licencia             (opcional)
```

#### Celulares (10 campos):
```
1. Tipo de equipo        (requerido)
2. Condición             (requerido)
3. Restricción           (requerido)
4. Serial                (requerido)
5. Marca                 (requerido)
6. Modelo                (requerido)
7. IMEI                  (requerido)
8. Número                (requerido)
9. Plan                  (requerido)
10. Fecha Entrega        (requerido)
```

### 5. VALIDACIONES

#### Equipos:
```javascript
✓ Valida 9 campos requeridos
✓ Ignora seriales duplicados
✓ Convierte seriales a mayúsculas
✓ Genera códigos de activo fijo automáticamente
✓ Registra errores de procesamiento
```

#### Celulares:
```javascript
✓ Valida 10 campos requeridos
✓ Ignora seriales duplicados
✓ Ignora IMEI duplicados
✓ Convierte seriales a mayúsculas
✓ Convierte IMEI a mayúsculas
✓ Registra errores de procesamiento
```

### 6. MENSAJES DE RESULTADO

#### Equipos:
```
✓ Se importaron 5 equipo(s) (1 serial duplicado ignorado) (2 líneas con error)
```

#### Celulares:
```
✓ Se importaron 5 celular(es) (1 serial duplicado ignorado) (2 IMEI duplicados ignorados)
```

### 7. FLUJO DE USUARIO

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  EQUIPOS                              CELULARES              │
│  ─────────────────────────           ──────────────────────  │
│  [Importar Lote] [+Nuevo]            [Importar Lote] [+Nuevo]│
│           │                                    │              │
│           └─────────────────┬──────────────────┘              │
│                             │                                  │
│                    Se abre formulario                         │
│                             │                                  │
│         ┌───────────────────┴────────────────────┐            │
│         │                                        │            │
│         ▼                                        ▼            │
│  [Pegar datos formato TAB]          [Pegar datos formato TAB]│
│         │                                        │            │
│         └───────────────────┬────────────────────┘            │
│                             │                                  │
│                   Se valida cada línea                        │
│                             │                                  │
│         ┌───────────────────┴────────────────────┐            │
│         │                                        │            │
│    Equipos:                                 Celulares:       │
│    • Genera códigos automáticos        • Valida IMEI único   │
│    • Ignora seriales duplicados        • Ignora IMEI duplic. │
│         │                                        │            │
│         └───────────────────┬────────────────────┘            │
│                             │                                  │
│                    Se insertan en Firestore                   │
│                             │                                  │
│                    Se registra en auditoría                   │
│                             │                                  │
│                    Se muestra resultado                       │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### 8. DIFERENCIAS CLAVE

| Aspecto | Equipos | Celulares |
|---------|---------|-----------|
| **Código automático** | ATM-EQ-001 | No aplica |
| **Validación serial** | Sí | Sí |
| **Validación IMEI** | No | Sí |
| **Campos requeridos** | 9 | 10 |
| **Generación de ID** | Manual (código) | Ninguna |
| **Estado inicial** | "disponible" | N/A |
| **Asignación inicial** | false | N/A |
| **Restricción** | No | Sí |
| **Fecha entrega** | No | Sí |
| **Plan datos** | No | Sí |

### 9. EJEMPLO DE IMPORTACIÓN

#### Entrada (TAB-separated):
```
FLOTA	Nuevo	Abierta	AP001	Apple	iPhone 14 Pro	359620098765432	+57 3001234567	10 GB Plus	2024-01-15
FLOTA	Nuevo	Abierta	SA001	Samsung	Galaxy S23	359620098765433	+57 3002345678	10 GB Plus	2024-01-16
```

#### Resultado en Firestore:
```javascript
// Documento 1
{
  tipoEquipo: "FLOTA",
  condicion: "Nuevo",
  restriccion: "Abierta",
  serial: "AP001",
  marca: "Apple",
  modelo: "iPhone 14 Pro",
  imei: "359620098765432",
  numero: "+57 3001234567",
  plan: "10 GB Plus",
  fechaEntrega: "2024-01-15",
  registradoPor: "admin@ejemplo.com",
  fechaRegistro: Timestamp
}

// Documento 2
{
  tipoEquipo: "FLOTA",
  condicion: "Nuevo",
  restriccion: "Abierta",
  serial: "SA001",
  marca: "Samsung",
  modelo: "Galaxy S23",
  imei: "359620098765433",
  numero: "+57 3002345678",
  plan: "10 GB Plus",
  fechaEntrega: "2024-01-16",
  registradoPor: "admin@ejemplo.com",
  fechaRegistro: Timestamp
}
```

#### Mensaje al Usuario:
```
✓ Se importaron 2 celulares
```

### 10. CÓDIGO RELEVANTE

#### Estados (Equipos):
```javascript
const [showImportForm, setShowImportForm] = useState(false);
const [importText, setImportText] = useState('');
```

#### Estados (Celulares):
```javascript
const [showImportForm, setShowImportForm] = useState(false);
const [importText, setImportText] = useState('');
```

**100% idénticos en ambos módulos** ✓

### Conclusión

La implementación es **totalmente coherente** con la estructura del módulo de Equipos, manteniendo:
- ✅ Misma interfaz visual
- ✅ Misma lógica de validación
- ✅ Mismo flujo de usuario
- ✅ Mismas convenciones de código
- ✅ Misma auditoría

Con ajustes necesarios para:
- ✅ Los 10 campos específicos de celulares
- ✅ Validación adicional de IMEI
- ✅ Sin generación de códigos automáticos
- ✅ Diferentes mensajes de confirmación
