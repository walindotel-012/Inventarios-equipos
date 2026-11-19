# ✅ CHECKLIST INTERACTIVO DE MIGRACIÓN FIREBASE

## 📋 FASE 1: PREPARACIÓN (DÍA 1-2)

### Verificaciones Previas
- [ ] **Acceso a walindotel@gmail.com**
  - [ ] Puedo iniciar sesión ✓
  - [ ] Tengo acceso a Firebase Console
  - [ ] Veo el proyecto inventario-equipos-f67f9

- [ ] **Acceso a equiposinventario8@gmail.com**
  - [ ] Cuenta existe ✓
  - [ ] Puedo iniciar sesión
  - [ ] Tengo acceso a Google Cloud Console

- [ ] **Recurso de almacenamiento**
  - [ ] Tengo acceso a carpeta para backups
  - [ ] Tengo 50+ MB disponibles
  - [ ] Puedo crear archivos

### Documentación
- [ ] **Información Actual Documentada**
  - [ ] Copié firebaseConfig actual en notepad
  - [ ] Copié reglas de Firestore en notepad
  - [ ] Anoté URLs de OAuth
  - [ ] Anoté lista de usuarios existentes

- [ ] **Planificación**
  - [ ] Elegí fecha de migración
  - [ ] Bloqueé 2-3 horas en mi calendario
  - [ ] Informé a usuarios (si necesario)
  - [ ] Preparé plan de rollback

### Instalaciones
- [ ] **Software requerido**
  - [ ] Firebase CLI instalado: `firebase --version`
  - [ ] Node.js v14+ instalado: `node --version`
  - [ ] Git instalado: `git --version`
  - [ ] (Opcional) Google Cloud SDK

---

## 📊 FASE 2: EXPORTACIÓN DE DATOS (DÍA 3)

### Backup del Proyecto Antiguo
- [ ] **Inicia sesión en Firebase (walindotel@gmail.com)**
  ```bash
  firebase logout
  firebase login
  # Selecciona walindotel@gmail.com
  ```

- [ ] **Verifica el proyecto**
  ```bash
  firebase projects:list
  # Deberías ver: inventario-equipos-f67f9
  ```

- [ ] **Exporta Firestore**
  ```bash
  firebase firestore:export ./firestore-backup --project=inventario-equipos-f67f9
  # ⏳ Espera a que termine (1-5 min)
  ```

- [ ] **Verifica el backup**
  - [ ] Carpeta `./firestore-backup` existe
  - [ ] Contiene archivo `firestore_export_metadata`
  - [ ] Contiene carpeta `all_namespaces/all_documents/`

- [ ] **Guarda backup en nube (seguridad)**
  - [ ] Copia carpeta a Google Drive o OneDrive
  - [ ] Renombra como: `backup-equipos-2026-01-16`
  - [ ] Verifica que se subió correctamente

### Documentar Configuración Adicional
- [ ] **Reglas de Firestore**
  ```
  Ve a Firebase Console > Firestore > Rules
  Copia el contenido completo en un archivo
  Guarda como: firestore-rules-backup.txt
  ```

- [ ] **Usuarios actuales**
  ```
  Ve a Firebase Console > Authentication > Users
  Anota los emails de usuarios registrados
  Guarda lista en: usuarios-actuales.txt
  ```

- [ ] **Configuración de OAuth**
  ```
  Ve a Firebase Console > Authentication > Google
  Anota: OAuth 2.0 Client ID
  Ve a Firebase Console > Authentication > Microsoft
  Anota: Application ID
  Guarda en: oauth-config-backup.txt
  ```

### Validación de Backup
- [ ] **Verifica tamaño y contenido**
  - [ ] Tamaño de backup: _____ MB (debe ser > 1 MB si hay datos)
  - [ ] Número de archivos: _____ (debe haber múltiples)

- [ ] **Prueba de integridad**
  ```bash
  # En la carpeta firestore-backup, ejecuta:
  ls -la  # (o dir en Windows)
  # Deberías ver estructura de carpetas
  ```

- [ ] **Documentación completada**
  - [ ] Fecha de backup: 2026-01-__
  - [ ] Tamaño estimado: ____ MB
  - [ ] Número de colecciones: 6
  - [ ] Número de documentos: ____

---

## 🆕 FASE 3: CREAR NUEVO PROYECTO (DÍA 4)

### Logout del proyecto antiguo
- [ ] **Cambiar de cuenta**
  ```bash
  firebase logout
  firebase login
  # Selecciona equiposinventario8@gmail.com
  ```

### Crear Proyecto en Firebase Console
- [ ] **Ve a Firebase Console con cuenta nueva**
  - [ ] URL: https://console.firebase.google.com
  - [ ] Inicia sesión con equiposinventario8@gmail.com

- [ ] **Crear nuevo proyecto**
  - [ ] Haz clic en "Agregar proyecto"
  - [ ] Nombre: `equiposinventario-nueva` (o similar)
  - [ ] Habilita Google Analytics: ☐ Sí / ☐ No
  - [ ] Haz clic en "Crear proyecto"
  - [ ] ⏳ Espera 2-3 minutos

### Anotar Información del Nuevo Proyecto
- [ ] **Project ID**: `_______________________`
- [ ] **Project Number**: `_______________________`
- [ ] **Auth Domain**: `_______________________`

### Habilitar Firestore
- [ ] **En el nuevo proyecto**
  - [ ] Ve a Firestore Database
  - [ ] Haz clic en "Crear base de datos"
  - [ ] Modo: Selecciona "Modo de producción"
  - [ ] Ubicación: Selecciona "us-central1" (o tu zona)
  - [ ] Haz clic en "Crear"

- [ ] **Verifica que Firestore está activo**
  - [ ] Ves la UI de Firestore
  - [ ] Está vacía (sin colecciones)

### Habilitar Authentication
- [ ] **Configura métodos de autenticación**
  - [ ] Ve a Authentication
  - [ ] Haz clic en "Comenzar"
  - [ ] Habilita: ☑️ Email/Password
  - [ ] Habilita: ☑️ Google
  - [ ] Habilita: ☑️ Microsoft
  - [ ] Guarda cambios

### Registrar Aplicación Web
- [ ] **Registra la aplicación**
  - [ ] Ve a Configuración del Proyecto > General
  - [ ] Baja a "Tus aplicaciones"
  - [ ] Si no hay app web, haz clic en "Registrar app" y selecciona "</>"
  - [ ] Dale un nombre: "Web"
  - [ ] Haz clic en "Registrar"

### Obtener y Guardar Credenciales Nuevas
- [ ] **Copia la configuración Firebase**
  ```javascript
  const firebaseConfig = {
    apiKey: "________________________________",
    authDomain: "________________________________",
    projectId: "________________________________",
    storageBucket: "________________________________",
    messagingSenderId: "________________________________",
    appId: "________________________________"
  };
  ```

- [ ] **Guarda las credenciales**
  - [ ] Crear archivo: `firebase-config-new.txt`
  - [ ] Pega la configuración
  - [ ] Guarda en tu backup

---

## 📥 FASE 4: IMPORTAR DATOS (DÍA 5)

### Preparar para Importación
- [ ] **Verifica que estás conectado a la cuenta correcta**
  ```bash
  firebase use --add
  # Selecciona el nuevo proyecto
  ```

### Ejecutar Importación
- [ ] **Importa Firestore desde backup**
  ```bash
  firebase firestore:import ./firestore-backup --project=[nuevo-proyecto-id]
  # ⏳ Espera (puede tomar 5-15 min según tamaño)
  ```

- [ ] **Verifica que completó sin errores**
  - [ ] Mensaje: "✓ Firestore imported successfully"
  - [ ] No hay mensajes de error en rojo

### Validar Datos Importados
- [ ] **En Firebase Console (nuevo proyecto)**
  - [ ] Ve a Firestore Database
  - [ ] Verifica que aparecen las colecciones:
    - [ ] ☑️ equipos
    - [ ] ☑️ asignaciones
    - [ ] ☑️ celulares
    - [ ] ☑️ descargos
    - [ ] ☑️ nomenclaturas
    - [ ] ☑️ auditLogs

- [ ] **Verificar cantidad de documentos**
  | Colección | Anterior | Nueva | ✓ Igual |
  |-----------|----------|-------|---------|
  | equipos | ___ | ___ | ☐ |
  | asignaciones | ___ | ___ | ☐ |
  | celulares | ___ | ___ | ☐ |
  | descargos | ___ | ___ | ☐ |
  | nomenclaturas | ___ | ___ | ☐ |
  | auditLogs | ___ | ___ | ☐ |

- [ ] **Verifica contenido de un documento**
  - [ ] Abre colección "equipos"
  - [ ] Haz clic en un documento
  - [ ] Verifica que tiene los campos esperados
  - [ ] Anota un ID de documento para testing: `_________________`

---

## 🔐 FASE 5: CONFIGURACIÓN DE SEGURIDAD (DÍA 5)

### Aplicar Reglas de Firestore
- [ ] **Ve a Firestore Database > Rules**
  - [ ] Borra las reglas por defecto
  - [ ] Copia las reglas del archivo `firestore-rules-backup.txt`
  - [ ] Pega en el editor
  - [ ] Haz clic en "Publicar"

- [ ] **Verifica las reglas**
  - [ ] Mensaje: "Rules updated"
  - [ ] No hay advertencias de seguridad

### Configurar OAuth - Google
- [ ] **Ve a Authentication > Google**
  - [ ] Haz clic en "Editar"
  - [ ] Obtén el OAuth 2.0 Client ID: `_________________`
  - [ ] Copia y guarda para referencia

- [ ] **Ve a Google Cloud Console**
  - [ ] Abre el proyecto correspondiente
  - [ ] Ve a APIs & Services > OAuth consent screen
  - [ ] Verifica que está configurada
  - [ ] Ve a Credentials
  - [ ] Haz clic en el OAuth 2.0 Client ID
  - [ ] Bajo "Authorized JavaScript origins", agrega:
    - [ ] `http://localhost:5173` (desarrollo)
    - [ ] `https://tu-dominio.com` (producción)

### Configurar OAuth - Microsoft
- [ ] **Ve a Authentication > Microsoft**
  - [ ] Haz clic en "Editar"
  - [ ] Obtén el Application ID: `_________________`

- [ ] **Ve a Microsoft Azure Portal**
  - [ ] App registrations > Tu aplicación
  - [ ] Ve a Authentication
  - [ ] Bajo "Redirect URIs", agrega:
    - [ ] `http://localhost:5173` (desarrollo)
    - [ ] `https://tu-dominio.com` (producción)

### Permitir Dominios de Desarrollo
- [ ] **En Authentication > Settings**
  - [ ] Baja a "Authorized domains"
  - [ ] Agrega: `localhost`
  - [ ] Verifica email si es necesario

---

## 💻 FASE 6: ACTUALIZAR CÓDIGO (DÍA 5)

### Actualizar firebase.js
- [ ] **Abre `src/firebase.js`**
  - [ ] Reemplaza `firebaseConfig` con valores nuevos
  - [ ] Copia desde `firebase-config-new.txt`
  - [ ] Verifica que tiene 6 campos (apiKey, authDomain, etc.)
  - [ ] Guarda el archivo

### Verificar Imports
- [ ] **Verifica que los imports son correctos**
  ```javascript
  import { initializeApp } from "firebase/app";
  import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";
  ```

### Commit de cambios
- [ ] **Haz commit en Git**
  ```bash
  git add src/firebase.js
  git commit -m "chore: update firebase credentials to new project"
  git push
  ```

---

## 🧪 FASE 7: TESTING EN DESARROLLO (DÍA 6)

### Iniciar en modo desarrollo
- [ ] **Instala dependencias (si es necesario)**
  ```bash
  npm install
  ```

- [ ] **Inicia servidor de desarrollo**
  ```bash
  npm run dev
  ```

- [ ] **Verifica que no hay errores de compilación**
  - [ ] ☑️ Compiló sin errores
  - [ ] ☑️ La aplicación se abrió en `http://localhost:5173`

### Testing de Autenticación
- [ ] **Login con Email**
  - [ ] Abre la app en http://localhost:5173
  - [ ] Haz clic en "Login"
  - [ ] Ingresa email de prueba: `test@example.com`
  - [ ] Ingresa contraseña
  - [ ] Resultado: ☐ Exitoso / ☐ Error
  - [ ] Si error, anota: `_____________________`

- [ ] **Login con Google**
  - [ ] Haz logout si es necesario
  - [ ] Haz clic en "Inicia sesión con Google"
  - [ ] Selecciona cuenta Google
  - [ ] Resultado: ☐ Exitoso / ☐ Error
  - [ ] Si error, anota: `_____________________`

- [ ] **Login con Microsoft**
  - [ ] Haz logout si es necesario
  - [ ] Haz clic en "Inicia sesión con Microsoft"
  - [ ] Ingresa credenciales Microsoft
  - [ ] Resultado: ☐ Exitoso / ☐ Error
  - [ ] Si error, anota: `_____________________`

### Testing de Datos
- [ ] **Verifica que ves los datos**
  - [ ] Ve a "Equipos"
    - [ ] ☑️ Aparecen equipos de la BD
    - [ ] ☑️ Count coincide con new project
  - [ ] Ve a "Asignaciones"
    - [ ] ☑️ Aparecen asignaciones
  - [ ] Ve a "Bitácora"
    - [ ] ☑️ Aparecen logs

- [ ] **Testing de filtros**
  - [ ] En Equipos, prueba filtros:
    - [ ] ☑️ Filtro por marca
    - [ ] ☑️ Filtro por modelo
    - [ ] ☑️ Exportar (devuelve datos filtrados)

- [ ] **Testing de CRUD**
  - [ ] Crear un equipo de prueba
    - [ ] ☑️ Se crea exitosamente
    - [ ] ☑️ Aparece en la tabla
  - [ ] Editar el equipo
    - [ ] ☑️ Se actualiza exitosamente
  - [ ] Eliminar el equipo
    - [ ] ☑️ Se elimina exitosamente

### Revisión de Consola
- [ ] **Abre Developer Console (F12)**
  - [ ] ☑️ No hay errores rojos
  - [ ] ☑️ No hay advertencias sobre Firebase
  - [ ] ☑️ Network: llamadas a Firebase son exitosas

- [ ] **Verifica que no hay errores de certificado**
  - [ ] La aplicación carga normalmente
  - [ ] No hay alertas de seguridad

---

## 🚀 FASE 8: DEPLOYMENT A PRODUCCIÓN (DÍA 7)

### Build para Producción
- [ ] **Crea build de producción**
  ```bash
  npm run build
  ```

- [ ] **Verifica que build completó**
  - [ ] ☑️ Sin errores
  - [ ] ☑️ Carpeta `dist/` fue creada
  - [ ] ☑️ Contiene archivos JS/HTML

### Pre-deployment Checks
- [ ] **Verifica archivo de producción**
  - [ ] `dist/index.html` existe
  - [ ] `dist/assets/` tiene archivos
  - [ ] No hay referencias al proyecto antiguo

- [ ] **Dominio de producción permitido**
  - [ ] En Firebase, ve a Authentication > Authorized domains
  - [ ] Tu dominio está en la lista
  - [ ] ☑️ Tu dominio: `_______________________`

### Deploy Opciones

#### Si usas Firebase Hosting:
- [ ] **Deploy con Firebase CLI**
  ```bash
  firebase deploy --only hosting
  ```
  - [ ] ☑️ Deploy completó exitosamente
  - [ ] ☑️ URL: `_______________________`

#### Si usas otro hosting (Vercel, Netlify, etc):
- [ ] **Commit y push a main**
  ```bash
  git add .
  git commit -m "feat: migrate to new firebase project"
  git push origin main
  ```
  - [ ] ☑️ Deploy automático iniciado
  - [ ] ☑️ Deploy completó exitosamente

### Post-deployment Verification
- [ ] **Prueba la app en producción**
  - [ ] Abre https://tu-dominio.com
  - [ ] ☑️ Carga sin errores
  - [ ] ☑️ Login funciona
  - [ ] ☑️ Datos aparecen

- [ ] **Verifica Analytics (opcional)**
  - [ ] Ve a Firebase Console > Analytics
  - [ ] ☑️ Ves eventos de la aplicación

---

## 📊 FASE 9: MONITOREO POST-MIGRACIÓN (DÍA 7-14)

### Monitoreo Diario (Día 1-3)
- [ ] **Día 1 (Miércoles)**
  - [ ] Hora: 09:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`
  - [ ] Hora: 12:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`
  - [ ] Hora: 17:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`

- [ ] **Día 2 (Jueves)**
  - [ ] Hora: 09:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`
  - [ ] Hora: 17:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`

- [ ] **Día 3 (Viernes)**
  - [ ] Hora: 09:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`
  - [ ] Hora: 17:00 - Estado: ☐ OK / ☐ ERROR - Notas: `____________`

### Verificaciones de Datos
- [ ] **Monitoreo de integridad**
  - [ ] Documente conteo de equipos
  - [ ] Documente conteo de asignaciones
  - [ ] Verifique que auditLogs continúan registrándose
  - [ ] Verifique que los nuevos cambios se guardan

### Feedback de Usuarios
- [ ] **Recopila feedback**
  - [ ] ¿Usuarios pueden logearse? ☑️ Sí / ☐ No
  - [ ] ¿Hay problemas reportados? ☑️ No / ☐ Sí → Detalles: `____________`
  - [ ] ¿Velocidad es similar? ☑️ Sí / ☐ No / ☐ Mejor

---

## ✨ FASE 10: LIMPIEZA Y FINALIZACIÓN (DÍA 14+)

### Documentación Final
- [ ] **Completa documento de migración**
  - [ ] Fecha de migración: `2026-01-__`
  - [ ] Hora de inicio: `__:__`
  - [ ] Hora de término: `__:__`
  - [ ] Duración total: `__:__`
  - [ ] Problemas encontrados: ☐ Ninguno / ☐ Ver abajo
  - [ ] Problemas: `_________________________________`

- [ ] **Actualiza documentación del proyecto**
  - [ ] LEEME.md actualizado
  - [ ] SETUP.md actualizado
  - [ ] Credenciales documentadas (solo para el equipo)

### Backup Final
- [ ] **Haz backup del nuevo proyecto**
  ```bash
  firebase firestore:export ./firestore-backup-final --project=[nuevo-proyecto-id]
  ```
  - [ ] ☑️ Backup guardado
  - [ ] ☑️ Guardado en Google Drive/OneDrive

### Decisión Sobre Proyecto Antiguo
- [ ] **¿Qué hacer con proyecto antiguo?**
  - [ ] ☐ Mantener activo (por 90 días) como fallback
  - [ ] ☐ Desactivar después de 7 días
  - [ ] ☐ Eliminar después de 30 días (después de confirmar que todo OK)

- [ ] **Si decides eliminar**
  - [ ] Abre Firebase Console con walindotel@gmail.com
  - [ ] Ve a Configuración del proyecto > Configuración
  - [ ] Haz clic en "Eliminar este proyecto"
  - [ ] Escribe el nombre del proyecto para confirmar
  - [ ] Haz clic en "Eliminar"

---

## 🎉 MIGRACIÓN COMPLETADA!

### Confirmación Final
- [ ] **Toda la migración fue exitosa**
- [ ] **Todos los datos se migraron correctamente**
- [ ] **Los usuarios están activos en nuevo proyecto**
- [ ] **El proyecto antiguo está eliminado o desactivado**

### Próximos Pasos
- [ ] Compartir documentación de migración con el equipo
- [ ] Entrenar a nuevos usuarios en la nueva plataforma
- [ ] Monitorear periódicamente (semanal/mensual)
- [ ] Planificar backups automáticos mensuales

---

## 📝 NOTAS PERSONALES

Usa este espacio para anotar tu experiencia:

```
Problemas encontrados:
_____________________________
_____________________________

Cómo los solucioné:
_____________________________
_____________________________

Aprendizajes:
_____________________________
_____________________________

Tiempo real invertido:
_____________________________

Recomendaciones para futuras migraciones:
_____________________________
_____________________________
```

---

**¡Migración completada exitosamente! 🎉**

Fecha de finalización: `____-____-____`  
Responsable: `_____________________`  
Firma: `_____________________`

---

**Documento Creado:** 16 de Enero de 2026  
**Versión:** 1.0  
**Última Actualización:** 16 de Enero de 2026
