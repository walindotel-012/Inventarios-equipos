#!/usr/bin/env node
# Script para limpiar la base de datos Firebase

Write-Host "`n=================================" -ForegroundColor Yellow
Write-Host "⚠️  ADVERTENCIA: OPERACIÓN DESTRUCTIVA" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "`nEsta acción eliminará TODOS los registros de tu base de datos:"
Write-Host "  • equipos"
Write-Host "  • celulares"
Write-Host "  • nomenclaturas"
Write-Host "  • asignaciones"
Write-Host "  • entregas"
Write-Host "  • descargos"
Write-Host "`nEsta acción NO se puede deshacer.`n" -ForegroundColor Red

$confirm = Read-Host "¿Estás seguro? (escribe 'BORRAR TODO' para confirmar)"

if ($confirm -eq "BORRAR TODO") {
    Write-Host "`nEjecutando script de eliminación...`n" -ForegroundColor Yellow
    node clear-database.mjs
} else {
    Write-Host "`n✗ Operación cancelada." -ForegroundColor Green
}
