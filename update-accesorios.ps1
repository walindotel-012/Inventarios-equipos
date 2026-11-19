# Script para actualizar accesorios sin serial en Firestore
# Uso: .\update-accesorios.ps1

Write-Host "🔄 Iniciando actualización de accesorios en Firestore..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script Node.js
node update-accesorios.mjs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Actualización completada exitosamente" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error durante la actualización" -ForegroundColor Red
}
