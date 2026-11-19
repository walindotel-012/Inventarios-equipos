# 🚀 Inicio Rápido - Importación de Asignaciones

## En 3 Pasos:

### 1️⃣ Abre el Módulo
Navega a **Asignaciones** en la aplicación

### 2️⃣ Haz Clic en "📥 Importar en Lote"
Encontrarás el botón en el encabezado junto a "Exportar Excel"

### 3️⃣ Pega los Datos
- Copia datos TAB-separados (18 columnas)
- Pégalos en el área de texto
- Haz clic en "Importar"

## Formato de Datos

```
Sucursal	Oficina	Departamento	Puesto	Nombre	Usuario	Cod.ATM	NetBios	Marca	Modelo	S/N	Disco	Memoria	CPU	SO	Licencia	FechaAsign	AsignadoPor
Bogotá	Central	TI	Prog	Juan Ruiz	jruiz	ATM001	JRUIZ-PC	Dell	OptiPlex	123AB	512SSD	32GB	i7	Win11	Office365	2024-01-15	Admin
```

**Nota:** Los campos están separados por **TAB**, no por espacios.

## Campos Requeridos
✅ Sucursal  
✅ Nombre  
✅ Usuario

Los demás son opcionales.

## Ejemplo de Uso

```
Bogotá	Oficina Central	Tecnología	Programador Sr	Juan Carlos Ruiz	jcruiz	ATM001	JCRUIZ-PC	Dell	OptiPlex 7090	9T4M2B2	512GB SSD	32GB	Intel i7-12700	Windows 11 Pro	Office 365	2024-01-15	Admin
```

## Resultado

✅ La asignación se crea en la base de datos  
✅ El equipo se vincula automáticamente  
✅ Se marca como asignado en inventario  
✅ Aparece en la lista de asignaciones  

## ❌ Solución de Errores

| Error | Solución |
|-------|----------|
| "Campos insuficientes" | Usa TAB (no espacios) entre campos |
| Línea omitida | Verifica que tenga nombre y usuario |
| Equipo no vinculado | El ATM debe existir en Equipos |

## Archivos Útiles

📄 [`ASIGNACIONES_A_IMPORTAR.txt`](ASIGNACIONES_A_IMPORTAR.txt) - Ejemplo de 5 asignaciones  
📖 [`GUIA_IMPORTACION_ASIGNACIONES.md`](GUIA_IMPORTACION_ASIGNACIONES.md) - Documentación completa  

---

**¡Listo!** Ahora puedes importar múltiples asignaciones en segundos.
