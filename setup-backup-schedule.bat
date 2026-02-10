@echo off
REM Script para programar respaldos automáticos
REM Ejecuta como Administrador

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     CONFIGURADOR DE RESPALDOS AUTOMÁTICOS              ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Verificar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Este script requiere permisos de ADMINISTRADOR
    echo Por favor, ejecuta CMD como Administrador y vuelve a intentar
    pause
    exit /b 1
)

echo ✅ Permisos de administrador detectados
echo.

set projectPath=C:\Users\WuarlinDotel\Inventario-equipos
set backupScript=%projectPath%\backup-manual.js

REM Verificar que el script existe
if not exist "%backupScript%" (
    echo ❌ Error: No se encontró %backupScript%
    pause
    exit /b 1
)

echo 📝 Configuración:
echo   • Hora de ejecución: 04:00 PM (todos los días)
echo   • Script: %backupScript%
echo   • Nombre de tarea: 'Respaldo-Inventario-Equipos'
echo.

REM Crear tarea programada
REM /CREATE: Crear tarea nueva
REM /TN: Nombre de la tarea
REM /TR: Ruta a ejecutar
REM /SC: Frecuencia (DAILY = diariamente)
REM /ST: Hora de inicio (16:00 = 4:00 PM)
REM /F: Forzar crear (sobrescribir si existe)
REM /RL: Run Level (HIGHEST = máximos permisos)

echo ⏳ Registrando tarea en Windows Task Scheduler...
echo.

schtasks /create ^
    /TN "Respaldo-Inventario-Equipos" ^
    /TR "node.exe \"%projectPath%\backup-manual.js\"" ^
    /SC DAILY ^
    /ST 16:00 ^
    /F ^
    /RL HIGHEST

if %errorLevel% equ 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║           ✅ CONFIGURACIÓN COMPLETADA                  ║
    echo ╚════════════════════════════════════════════════════════╝
    echo.
    
    echo 📋 Detalles de la tarea:
    echo   • Nombre: Respaldo-Inventario-Equipos
    echo   • Horario: Diariamente a las 4:00 PM
    echo   • Estado: Habilitada
    echo.
    
    echo 🔍 Para verificar o modificar la tarea:
    echo   1. Abre 'Programador de tareas' ^(Task Scheduler^)
    echo   2. Busca la tarea: 'Respaldo-Inventario-Equipos'
    echo.
    
    echo 💡 Para ejecutar respaldo manualmente ahora:
    echo   node backup-manual.js
    echo.
    
    echo 🗑️  Para eliminar la tarea:
    echo   schtasks /delete /TN "Respaldo-Inventario-Equipos" /F
    echo.
) else (
    echo.
    echo ❌ Error al crear la tarea
    echo Verifica que ejecutaste CMD como Administrador
    echo.
)

pause
