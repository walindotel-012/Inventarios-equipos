# 📥 Guía de Importación de Asignaciones en Lote

## Descripción

La funcionalidad de importación en lote de asignaciones permite registrar múltiples asignaciones de equipos a colaboradores de una sola vez mediante un archivo TSV (Tab-Separated Values).

## Formato Requerido

Los datos deben estar separados por **TAB** (tabulación) y contener exactamente **18 columnas** en este orden:

```
1. Sucursal          - Nombre de la sucursal (ej: Bogotá, Medellín)
2. Oficina           - Nombre de la oficina o sede (ej: Oficina Central)
3. Departamento      - Departamento (ej: Tecnología, Finanzas)
4. Puesto            - Cargo o puesto (ej: Programador Sr, Contador)
5. Nombre            - Nombre completo del colaborador *REQUERIDO*
6. Usuario           - Usuario/Login del colaborador *REQUERIDO*
7. Cod. Activo Fijo  - Código ATM del equipo principal (ej: ATM001)
8. NetBios Name      - Nombre de red NetBIOS (ej: JCRUIZ-PC)
9. Marca             - Marca del equipo (ej: Dell, HP)
10. Modelo           - Modelo del equipo (ej: OptiPlex 7090)
11. S/N              - Número de serie del equipo (ej: 9T4M2B2)
12. Disco            - Configuración del disco (ej: 512GB SSD)
13. Memoria          - Memoria RAM (ej: 32GB)
14. Procesador       - Tipo de procesador (ej: Intel i7-12700)
15. S.O              - Sistema operativo (ej: Windows 11 Pro)
16. Licencia         - Licencia de software (ej: Office 365)
17. Fecha Asignación - Fecha en formato YYYY-MM-DD (ej: 2024-01-15)
18. Asignado por     - Usuario que autoriza la asignación (ej: Admin)
```

## Campos Requeridos

- **Sucursal**: Obligatorio
- **Nombre**: Obligatorio
- **Usuario**: Obligatorio

Los demás campos pueden estar vacíos, pero deben incluir el separador TAB.

## Ejemplo

```
Bogotá	Oficina Central	Tecnología	Programador Sr	Juan Carlos Ruiz	jcruiz	ATM001	JCRUIZ-PC	Dell	OptiPlex 7090	9T4M2B2	512GB SSD	32GB	Intel i7-12700	Windows 11 Pro	Office 365	2024-01-15	Admin
Medellín	Oficina Regional	Finanzas	Contador	María González	mgonzalez	ATM002	MGONZALEZ-PC	HP	EliteDesk 800	KL5N3C3	256GB SSD	16GB	Intel i5-12400	Windows 10 Pro	QuickBooks	2024-01-20	Admin
```

## Cómo Usar

1. **Prepara los datos** en Excel o cualquier editor de texto
2. **Abre el módulo de Asignaciones**
3. **Haz clic en el botón "📥 Importar en Lote"**
4. **Pega los datos** en el área de texto (asegúrate de que los campos estén separados por TAB)
5. **Verifica** el número de asignaciones a importar que se muestra en el aviso
6. **Haz clic en "Importar"**
7. **Espera** a que se completen las importaciones
8. **Verifica** los mensajes de confirmación

## Validaciones

- Si faltan campos requeridos (Sucursal, Nombre, Usuario), la línea será omitida
- Si hay menos de 18 campos, la línea será omitida
- Los campos vacíos se permiten (excepto los requeridos)
- Se detectan y reportan líneas con errores

## Resultados

Después de importar, se mostrará un mensaje indicando:
- Cantidad de asignaciones importadas exitosamente
- Cantidad de líneas con error (si las hay)

## Datos Auto-completados

Durante la importación, el sistema:
- Usa la fecha actual si no especificas "Fecha Asignación"
- Usa el usuario actual si no especificas "Asignado por"
- Busca y vincula automáticamente equipos por código ATM
- Marca el equipo como "asignado" en la base de datos

## Archivo de Ejemplo

Consulta el archivo `ASIGNACIONES_A_IMPORTAR.txt` en la raíz del proyecto para ver un ejemplo completo con 5 asignaciones de muestra.

## Notas Importantes

⚠️ **Importante:**
- Los datos se importan directamente a la base de datos
- No hay opción de "vista previa" antes de confirmar
- Se recomienda hacer una copia de seguridad antes de importar datos en lote
- Cada importación crea registros nuevos (no actualiza existentes)

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| "Campos insuficientes" | Asegúrate de usar TAB para separar campos, no espacios |
| Algunas líneas no se importan | Verifica que tengan los 3 campos requeridos (Sucursal, Nombre, Usuario) |
| Equipo no se vincula | El código ATM debe existir en el módulo de Equipos |
| No se puede importar | Verifica que haya texto en el área de importación |

## Actualización Relacionada

El módulo de Asignaciones también se integra con:
- **Equipos**: Busca y vincula equipos por código ATM
- **Nomenclaturas**: Utiliza NetBios Names registrados
- **Celulares**: Puedes agregar celulares después de importar

---
**Versión:** 1.0  
**Última actualización:** 2024-01-25  
**Columnas soportadas:** 18 (Tab-separated)
