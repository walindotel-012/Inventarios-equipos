# Script para programar respaldos automáticos en Windows Task Scheduler
# Uso: Ejecuta en PowerShell como Administrador

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CONFIGURADOR DE RESPALDOS AUTOMÁTICOS              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar permisos de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ Este script requiere permisos de ADMINISTRADOR" -ForegroundColor Red
    Write-Host "Por favor, ejecuta PowerShell como Administrador y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Permisos de administrador detectados`n" -ForegroundColor Green

# Ruta del proyecto
$projectPath = "C:\Users\WuarlinDotel\Inventario-equipos"
$backupScript = Join-Path $projectPath "backup-manual.js"

# Verificar que el script existe
if (-not (Test-Path $backupScript)) {
    Write-Host "❌ Error: No se encontró $backupScript" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Configuración:" -ForegroundColor Yellow
Write-Host "  • Hora de ejecución: 04:00 PM (todos los días)" -ForegroundColor Gray
Write-Host "  • Script: $backupScript" -ForegroundColor Gray
Write-Host "  • Nombre de tarea: 'Respaldo-Inventario-Equipos'" -ForegroundColor Gray
Write-Host ""

# Crear script wrapper que ejecutará node
$wrapperScript = Join-Path $projectPath "run-backup.ps1"

$wrapperContent = @"
# Script wrapper para ejecutar backup desde Task Scheduler
Set-Location "$projectPath"
Write-Host "🔄 Iniciando respaldo automático..." -ForegroundColor Cyan
Write-Host "📅 Hora: `$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

try {
    node backup-manual.js
    Write-Host "✅ Respaldo completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en respaldo: `$_" -ForegroundColor Red
    exit 1
}
"@

# Guardar script wrapper
$wrapperContent | Out-File -FilePath $wrapperScript -Encoding UTF8 -Force
Write-Host "✅ Script wrapper creado: $wrapperScript`n" -ForegroundColor Green

# Crear acción de tarea
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$wrapperScript`"" `
    -WorkingDirectory $projectPath

Write-Host "✅ Acción de tarea creada`n" -ForegroundColor Green

# Crear disparador (trigger) para las 4:00 PM diariamente
$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At 4:00PM

Write-Host "✅ Trigger creado (4:00 PM diariamente)`n" -ForegroundColor Green

# Crear configuración de tarea
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Write-Host "✅ Configuración de tarea creada`n" -ForegroundColor Green

# Registrar la tarea
$taskName = "Respaldo-Inventario-Equipos"
$taskPath = "\Inventario-Equipos\"

Write-Host "⏳ Registrando tarea en Windows Task Scheduler..." -ForegroundColor Cyan

try {
    $task = Register-ScheduledTask `
        -TaskName $taskName `
        -TaskPath $taskPath `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Force

    Write-Host "✅ Tarea registrada exitosamente!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error registrando tarea: $_" -ForegroundColor Red
    exit 1
}

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ CONFIGURACIÓN COMPLETADA                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Detalles de la tarea:" -ForegroundColor Yellow
Write-Host "  • Nombre: $taskName" -ForegroundColor Gray
Write-Host "  • Ruta: $taskPath" -ForegroundColor Gray
Write-Host "  • Horario: Diariamente a las 4:00 PM" -ForegroundColor Gray
Write-Host "  • Estado: Habilitada" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Para verificar o modificar la tarea:" -ForegroundColor Yellow
Write-Host "  1. Abre 'Programador de tareas' (Task Scheduler)" -ForegroundColor Gray
Write-Host "  2. Navega a: Biblioteca de Programador > Inventario-Equipos" -ForegroundColor Gray
Write-Host "  3. Busca la tarea: '$taskName'" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Próximo respaldo programado:" -ForegroundColor Yellow
$nextRun = (Get-ScheduledTask -TaskName $taskName -TaskPath $taskPath | Get-ScheduledTaskInfo).NextRunTime
Write-Host "  $nextRun" -ForegroundColor Green
Write-Host ""

Write-Host "💡 Para ejecutar respaldo manualmente ahora:" -ForegroundColor Cyan
Write-Host "  node backup-manual.js" -ForegroundColor Magenta
Write-Host ""

Write-Host "🗑️ Para desactivar/eliminar la tarea:" -ForegroundColor Yellow
Write-Host "  Abre Task Scheduler y elimina la tarea, o ejecuta:" -ForegroundColor Gray
Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -TaskPath '$taskPath' -Confirm:`$false" -ForegroundColor Magenta
Write-Host ""
