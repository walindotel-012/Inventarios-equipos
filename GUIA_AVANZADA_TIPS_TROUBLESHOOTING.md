# 🔧 Guía Avanzada - Tips, Trucos y Troubleshooting

## Para Usuarios Experimentados

---

## 1. Búsqueda Avanzada

### Búsqueda Parcial
```
Escribes: DELL
Encuentra: Todos los Dell (equipos, asignaciones, etc)

Escribes: 123
Encuentra: ATM-EQ-0123, serial 123X45Y, modelo P123, etc
```

### Búsqueda Exacta de Serial
```
Necesitas el serial exacto firmado: ABC123-DEF456
Escribe: ABC123-DEF456
(El sistema busca mientras escribes)
```

### Combinación de Filtros
En Asignaciones, combina:
- Búsqueda por **Serial** + filtro de **Usuario**
- Búsqueda por **Nombre** + año (en observaciones)

---

## 2. Importación Masiva Avanzada

### Preparar datos en Excel

**Formato correcto** (separados por tabulación):
```
codActivoFijo    marca    modelo        sn           disco    memoria    procesador        so           licencia           tipoEquipo    condicion
ATM-EQ-001       Dell     5480          ABC123       512 GB   16 GB      Intel i7 Gen 10   Windows 10   Microsoft Office   Laptop        Nuevo
ATM-EQ-002       Lenovo   ThinkCentre   XYZ789       1 TB     32 GB      Intel i9 Gen 11   Windows 11   Office 365         CPU           Nuevo
ATM-EQ-003       HP       EliteDesk     JKL456       2 TB     16 GB      Intel i5 Gen 9    Windows 10   Sin Licencia       Monitor       Usado
```

### Pasos de importación
1. Abre Excel
2. Copia todas las filas (incluyendo header)
3. Ve a módulo (Equipos/Asignaciones/Celulares)
4. Haz clic "Importar"
5. **Pega en el área de texto**
6. Haz clic "Importar"
7. Espera confirmación

### Validaciones automáticas
- Detecta si falta información
- Previene duplicados (si código existe, lo salta o promedia)
- Reporta errores específicos

### Tip Pro: Preparación
```
1. En Excel fuente, copia columnas en orden EXACTO
2. No dejes celdas vacías si el campo es obligatorio
3. Máximo 1000 registros por importación (para rendimiento)
4. Después de importar, verifica aleatorios (haz clic 5-10 registros)
```

---

## 3. Uso Avanzado de Filtros

### En Asignaciones: Filtro Múltiple
Necesitas asignaciones de Bogotá, puesto "Gerente":

1. Busca por **Nombre** (digita parte del nombre)
2. Luego busca por **Usuario** (filtro secundario)
3. Scroll down, mira Sucursal en el resultado
4. Puedes exportar el resultado

### En Equipos: Filtro de Disponibilidad
Laptops Dell disponibles:
1. Filtra **Tipo** = "Laptop"
2. Filtra **Marca** = "Dell"
3. Busca "disponible" (aparecerán solo sin asignar)

### En Celulares: Filtro por Plan
Celulares con plan "10 GB Plus":
1. Filtra **Restricción** = "Abierta"
2. Filtra **Plan** = "10 GB Plus"
3. Exporta para reportar a carrier

---

## 4. Aprovechando Dropdowns Dinámicos

### Las opciones se aprenden del sistema
Cuando haces:
- **Primer Dell** → "Dell" aparece en dropdown después
- **Primera nomenclatura "ATMUSER01"** → aparece en dropdown
- **Primer procesador "Intel i7 Gen 10"** → aparece en dropdown

**Beneficio**: Dropdowns se llenan automáticamente con lo que ya usaste

### Agregar Nuevas Opciones
En dropdown, si escribes algo nuevo:
1. Escribe "Mi Nueva Marca"
2. El sistema permite crearla
3. Se agrega a futuras ofertas

---

## 5. Bitácora: Análisis Forense

### ¿Dónde desapareció equipo ATM-EQ-200?

**Paso 1**: Ve a Bitácora
**Paso 2**: En búsqueda general, escribe el código
**Paso 3**: Ves TODO lo que pasó:
```
2024-01-15 10:30 | Juan Pérez    | UPDATE | Creada asignación ATM-EQ-200 a María García
2024-01-17 14:22 | Admin User    | UPDATE | Actualizado estado a "dañado"
2024-01-20 09:15 | Juan Pérez    | DELETE | Eliminada asignación (descargo)
```

### Filtros de Bitácora para Análisis

**Auditoría por usuario**:
1. Filtra usuario = "Admin"
2. Filtra acción = "DELETE"
3. Período mes = "Enero 2024"
4. Ves TODO lo que Admin eliminó en enero
5. Exporta Excel como evidencia

**Auditoría por módulo**:
1. Filtra módulo = "Equipos"
2. Filtra acción = "UPDATE"
3. Fecha desde = hoy -7 días
4. Ves cambios recientes
5. Exporta para compliance

---

## 6. Generación de Reportes Avanzados

### Reporte de Disponibilidad por Tipo
1. Ve a "Equipos Disponibles"
2. Filtra tipo = "Laptop"
3. Exporta Excel
4. En Excel, cuenta por marca (COUNTIF)
5. Resultado: "12 Dell, 5 Lenovo, 3 HP disponibles"

### Reporte de Asignaciones Activas
1. Ve a "Asignaciones"
2. Exporta TODO
3. En Excel, elimina donde "descargo" = TRUE
4. Resultado: asignaciones vigentes

### Reporte de Ciclo de Vida
1. Ve a "Bitácora"
2. Filtra módulo = "Asignaciones"
3. Filtra acción = "CREATE" y "DELETE"
4. Exporta
5. En Excel, empareja creación/eliminación
6. Calcula promedio asignación duración

---

## 7. Atajos y Optimizaciones

### Atajos de Teclado
| Atajo | Qué Pasa |
|-------|----------|
| **Tab** | Siguiente campo formulario |
| **Shift+Tab** | Campo anterior |
| **Enter** (búsqueda) | Busca |
| **Escape** | Cierra diálogo/modal |
| **Ctrl+C** | Copia serial (selecciónalo primero) |
| **Ctrl+V** | Pega en búsqueda |

### Velocidad de Copia/Pega
**Nunca escribas seriales**:
1. En tabla, ve a serial del equipo
2. Haz triple-clic → selecciona
3. Ctrl+C → copia
4. Ve a búsqueda asignación
5. Ctrl+V → pega
6. Auto-completa TODO

### Creación Rápida de Asignaciones (Método Pro)
1. Abre Excel con equipos disponibles
2. Abre aplicación (lado a lado)
3. Copia serial de Excel
4. Pega en búsqueda asignación
5. Completa empleado
6. Guarda
7. Recopia siguiente serial
8. CICLO: 2 min por asignación (vs 5 min normal)

---

## 8. Gestión Avanzada de Permisos (Admin Only)

### Estructura de Roles Sugerida

**Patrón 1: Por Área**
```
IT Manager (admin): TODO
IT Support: Equipos, Asignaciones, Descargos, Bitácora
RH Officer: Asignaciones, Hoja Entrega, Equipos Disponibles
Finance Audit: Equipos Disponibles, Bitácora (read-only)
Procurement: Equipos, Celulares
```

**Patrón 2: Por Seniority**
```
Junior Tech: Equipos, Celulares (solo lectura)
Senior Tech: Equipos, Asignaciones, Descargos, Celulares
Team Lead: ↑ + Bitácora + Nomenclaturas
Manager: TODO except Admin Permisos (solo Admin)
```

### Auditoría de Cambios de Permisos
1. Ve Bitácora
2. Filtra módulo = "Admin de Permisos"
3. Ves TODOS los cambios de permisos (quién dio acceso a quién)
4. Exporta para compliance

---

## 9. Troubleshooting Avanzado

### "El auto-completado no funciona"
**Problema**: Serial escrito incorrectamente
**Solución**:
1. Ve a Equipos
2. Busca el equipo
3. Haz Ctrl+C en el serial exacto
4. Ve a Asignaciones
5. Haz Ctrl+V en búsqueda
6. Ahora funciona

**Alternativo**: El serial no coincide con BD
- Verifica ortografía exacta en tabla de Equipos

### "Un equipo aparece como disponible pero ya lo asigné"
**Problema**: Caché del navegador
**Solución**:
1. Presiona F5 (refresh)
2. O Ctrl+F5 (refresh sin caché)
3. Si persiste: cierra pestaña, abre de nuevo
4. Los datos en server son siempre correctos

### "No puedo editar un registro"
**Problema**: Falta permisos
**Solución**:
1. Verifica que tu usuario tiene permisos al módulo
2. Pídele al admin que revise en "Admin de Permisos"
3. Tu usuario debe estar en la lista

### "PDF sale con formato extraño"
**Problema**: Zoom navegador o márgenes impresora
**Solución**:
1. Ve a imprimir (Ctrl+P)
2. Configura:
   - Márgenes: Personalizado, 1" lado y lado
   - Escala: 100%
   - Tamaño: Carta/A4
3. Vista previa debe verse bien
4. Imprime

### "Importación dice "duplicado" pero no veo dónde"
**Problema**: Código ya existe en BD
**Solución**:
1. Busca ese código en el módulo
2. Sí existe: ¿Quieres actualizar? Elimina el viejo primero, luego importa nuevo
3. ¿No existe pero dice duplicado? Error temporal, intenta en 2 minutos

---

## 10. Casos de Uso Avanzados

### Caso 1: Auditoría de Integridad
**Quiero validar que no hay equipos huérfanos**

```
1. Exporta Equipos (todoList A)
2. Exporta Asignaciones (lista B)
3. En Excel, busca equipos en A que NO están en B
4. Lista C = equipos sin asignar (deberían estar en "Disponibles")
5. Haz clic "Equipos Disponibles", exporta
6. Compara C vs Disponibles
7. Si diferencia: hay inconsistencia, reporta a admin
```

### Caso 2: Análisis de Rotación
**¿Cuánto tiempo promedio un empleado tiene equipo?**

```
1. Ve Bitácora
2. Filtra por CREATE asignaciones (mes X)
3. Filtra por DELETE asignaciones (mes X+1)
4. Empareja por usuario
5. Calcula diferencia fechas
6. Promedio = rotación típica
```

### Caso 3: Validar Nomenclaturas
**Quiero que NO haya NetBios duplicados en dominio activo**

```
1. Ve RH, obtén lista usuarios (ej: LDAP query)
2. En app, ve a Nomenclaturas, exporta
3. En Excel, intersecciona
4. ¿Hay nomenclatura asignada 2x? Problema (imposible)
5. ¿Hay nomenclatura en LDAP pero no en app? Huérfana
6. Limpia inconsistencias
```

---

## 11. Performance Tips

### Si la app se siente lenta

**Paso 1: Try these**
1. Cierra otras pestañas (la app usa RAM)
2. Actualiza navegador (F5)
3. Cierra navegador completamente, reabre
4. Usa navegador moderno (Chrome/Edge, no IE)

**Paso 2: Check Filter**
- El filtro activo ralentiza búsqueda
- Limpia filtros (haz clic "Limpiar")
- Intenta de nuevo

**Paso 3: Large Export**
- Si exportas 10k registros = espera 5-10 seg
- Mientras exporta, ves círculo cargador
- No interrumpas

### Recomendaciones Hardware
- Navegador moderno (Chrome/Edge v90+)
- Internet mínimo 1 Mbps (para Firebase sync)
- Monitor 1024x768+ (responsive pero mejor con pantalla grande)

---

## 12. Scripts SQL que NO puedes ejecutar (Pero buen conocimiento)

**Por qué**: El sistema usa Firebase (NoSQL), no SQL
**Pero si admin quiere exportar base completa**:
1. Admin acude a Firebase Console
2. Descargas datos en formato JSON
3. Conviertes a CSV en herramienta externa

**NO HAY acceso SQL directo** (por seguridad)

---

## 13. Mejores Prácticas Enterprise

### Política de Nomenclaturas
Crea una tabla de referencia:
```
Formato: [EMPRESA]-[TIPO]-[NUMERO]

Ejemplos:
ATM-IT-001 (IT Team)
ATM-HR-001 (HR Team)
ATM-FM-001 (Facilities)
ATM-USR-0001 (Usuario estándar)
```

Implementa: En app, nomenclaturas siguen patrón
Beneficio: Auto-identificas área del usuario

### Política de Códigos de Activo
Sistema actual usa `ATM-EQ-###` (auto)

Tu organización podría querer:
```
ATM-BTA-2024-001 (año, asset tracking)
```

Cambio: Hay que modificar código en generador (contacta dev)

### Backup Policy
**Aunque Firebase es seguro**:
1. Exporta Equipos = mensual
2. Exporta Asignaciones = mensual
3. Exporta Bitácora = trimestral
4. Guarda en OneDrive/Drive compartido
5. Retención: 1 año

---

## 14. Integración con Excel

### Actualizaciones Masivas (Workflow)
1. Exporta Equipos desde app
2. Abre en Excel
3. Haz cambios masivos (ej: actualiza SO de 20 laptops)
4. Guarda como CSV
5. Regresa a app, "Importar"
6. Selecciona opción "Actualizar existentes"
7. Confirma
8. ✓ Cambios aplicados

### Creación de Reportes a partir de Exports
```
Exporta Asignaciones.xlsx
│
├─ Tabla pivot: Equipos por sucursal
├─ Tabla pivot: Equipos por puesto
├─ Gráfico: Distribución por marca
├─ Gráfico: Antigüedad promedio
└─ Reporta a ejecutivos
```

---

## 15. Deep Dive: Estructura de Datos

### Colecciones en Firebase (Para curiosos)
```
equipos/
├─ codActivoFijo (unique key)
├─ marca, modelo, sn, especificaciones, asignado (true/false)

asignaciones/
├─ id (unique)
├─ empleado (nombre, usuario, sucursal)
├─ equipoPrincipal, equipoSecundario, celular, accesorios
├─ fechas

celulares/
├─ serial (unique)
├─ marca, modelo, imei, numero

nomenclaturas/
├─ netbiosName (unique, max 14 chars)

accesorios/
├─ codigoActivoFijo (ATM-ACC-####)

descargos/
├─ id
├─ asignacionId (referencia)
├─ condicion, observaciones

auditLogs/
├─ timestamp, userId, action, module, details

permisos/
├─ userId
├─ email, nombre, modulos [], isAdmin (bool)
```

---

## 16. Cuando Necesites Ayuda Dev

Si encuentras bug o feature request:

**Información a proveer**:
1. Qué intentaste hacer
2. Qué pasó (screenshot si posible)
3. Qué esperabas
4. Navegador y versión
5. Timestamp aproximado
6. Tu usuario

**Prioridad bugs**:
🔴 Críticos: Datos perdidos, app no abre
🟡 Altos: Módulo no funciona
🟢 Medios: Cosmético, lento

---

**Fin. Eres ahora un power user. Go forth and automate.** ⚡

