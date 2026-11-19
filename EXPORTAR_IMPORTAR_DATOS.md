# 📤 Guía Técnica: Exportar e Importar Datos Firebase

## Método 1: Usando Firebase CLI (Recomendado)

### 1.1 Instalar Firebase CLI

```bash
# En Windows (PowerShell como Administrador)
npm install -g firebase-tools

# Verificar instalación
firebase --version
```

### 1.2 Autenticarse

```bash
# Login con cuenta walindotel@gmail.com
firebase login

# Verificar proyectos disponibles
firebase projects:list
```

### 1.3 Exportar Datos del Proyecto Antiguo

```bash
# Exportar Firestore completo
firebase firestore:export ./firestore-backup --project=inventario-equipos-f67f9

# Esto crea una carpeta con los datos en formato especial
# Los datos se guardan en: ./firestore-backup/
```

### 1.4 Importar en Proyecto Nuevo

```bash
# Primero, cambia a la nueva cuenta
firebase logout
firebase login
# Inicia sesión con equiposinventario8@gmail.com

# Importar datos en nuevo proyecto
firebase firestore:import ./firestore-backup --project=nuevo-proyecto-id
```

---

## Método 2: Exportar/Importar Manualmente (Via Console)

### 2.1 Exportar Cada Colección Como JSON

**Proyecto Antiguo (walindotel@gmail.com):**

```javascript
// 1. Abre la consola de desarrollador (F12)
// 2. Ve a Firestore en Firebase Console
// 3. Copia este código en la consola:

// Función para descargar datos
const exportCollection = async (collectionName) => {
  const collection = firebase.firestore().collection(collectionName);
  const snapshot = await collection.get();
  const data = {};
  
  snapshot.forEach(doc => {
    data[doc.id] = doc.data();
  });
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${collectionName}.json`;
  a.click();
};

// Descargar cada colección
await exportCollection('equipos');
await exportCollection('asignaciones');
await exportCollection('celulares');
await exportCollection('descargos');
await exportCollection('nomenclaturas');
await exportCollection('auditLogs');

// Esto descargará 6 archivos JSON
```

### 2.2 Importar Datos en Proyecto Nuevo

**Proyecto Nuevo (equiposinventario8@gmail.com):**

```javascript
// 1. Asegúrate de que estás en el nuevo proyecto
// 2. Ve a Firestore en Firebase Console
// 3. Copia este código en la consola:

// Función para importar datos
const importCollection = async (collectionName, jsonData) => {
  const db = firebase.firestore();
  const batch = db.batch();
  
  for (const docId in jsonData) {
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, jsonData[docId]);
  }
  
  await batch.commit();
  console.log(`✓ Importados ${Object.keys(jsonData).length} documentos en ${collectionName}`);
};

// Cargar archivos JSON (debes hacer esto manualmente o vía fetch)
// Ejemplo con un archivo cargado:
const equiposData = { /* contenido del archivo equipos.json */ };
await importCollection('equipos', equiposData);

// Repite para cada colección
```

---

## Método 3: Usando Google Cloud Storage (Para Proyectos Grandes)

### 3.1 Crear Bucket en Google Cloud Storage

```bash
# Instalar Google Cloud SDK
choco install google-cloud-sdk  # Windows
# o brew install google-cloud-sdk  # macOS

# Autenticar
gcloud auth login

# Crear bucket
gsutil mb gs://tu-backup-bucket/

# Exportar a bucket
firebase firestore:export gs://tu-backup-bucket/backup-2026-01-16 --project=inventario-equipos-f67f9
```

### 3.2 Importar Desde Bucket

```bash
# Desde el proyecto nuevo
firebase firestore:import gs://tu-backup-bucket/backup-2026-01-16 --project=nuevo-proyecto-id
```

---

## Método 4: Script Node.js (Para Automatizar)

### 4.1 Crear Script de Exportación

**Archivo: `scripts/export-firebase.js`**

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

// Inicializar con credenciales del proyecto antiguo
const serviceAccount = require('./serviceAccountKey-old.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'inventario-equipos-f67f9'
});

const db = admin.firestore();

const collections = [
  'equipos',
  'asignaciones',
  'celulares',
  'descargos',
  'nomenclaturas',
  'auditLogs'
];

async function exportData() {
  const allData = {};

  for (const collection of collections) {
    console.log(`Exportando ${collection}...`);
    const snapshot = await db.collection(collection).get();
    
    allData[collection] = {};
    snapshot.forEach(doc => {
      allData[collection][doc.id] = doc.data();
    });
    
    console.log(`✓ Exportados ${snapshot.size} documentos de ${collection}`);
  }

  // Guardar a archivo
  fs.writeFileSync('firestore-backup.json', JSON.stringify(allData, null, 2));
  console.log('✓ Backup completado en firestore-backup.json');
  
  admin.app().delete();
}

exportData().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

**Ejecutar:**
```bash
node scripts/export-firebase.js
```

### 4.2 Crear Script de Importación

**Archivo: `scripts/import-firebase.js`**

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

// Inicializar con credenciales del proyecto nuevo
const serviceAccount = require('./serviceAccountKey-new.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'nuevo-proyecto-id'
});

const db = admin.firestore();

async function importData() {
  const backup = JSON.parse(fs.readFileSync('firestore-backup.json', 'utf8'));

  for (const [collection, documents] of Object.entries(backup)) {
    console.log(`Importando ${collection}...`);
    
    for (const [docId, docData] of Object.entries(documents)) {
      await db.collection(collection).doc(docId).set(docData, { merge: true });
    }
    
    console.log(`✓ Importados ${Object.keys(documents).length} documentos en ${collection}`);
  }

  console.log('✓ Importación completada');
  admin.app().delete();
}

importData().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

**Ejecutar:**
```bash
node scripts/import-firebase.js
```

---

## Método 5: Backup Automático Mensual

### 5.1 Script de Backup Periódico

**Archivo: `.github/workflows/firebase-backup.yml`**

```yaml
name: Firebase Backup

on:
  schedule:
    # Ejecutar cada primer día del mes a las 2 AM UTC
    - cron: '0 2 1 * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: Backup Firestore
        run: firebase firestore:export gs://tu-backup-bucket/backup-${{ github.run_number }} --project=inventario-equipos-f67f9
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: backup-${{ github.run_number }}
          release_name: Firebase Backup - ${{ github.run_number }}
          body: Firestore backup - ${{ github.run_date }}
```

---

## Verificación Post-Importación

### Verificar Integridad de Datos

```javascript
// En la consola de Firebase del proyecto nuevo
// Ejecuta esto para verificar:

const db = firebase.firestore();

const collections = ['equipos', 'asignaciones', 'celulares', 'descargos', 'nomenclaturas', 'auditLogs'];

async function verifyData() {
  console.log('🔍 Verificando datos importados...\n');
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    console.log(`${collection}: ${snapshot.size} documentos`);
  }
}

verifyData();
```

### Comparar Proyectos

```javascript
// Script para comparar cantidad de documentos

const comparar = async () => {
  const antiguo = {
    equipos: 0,
    asignaciones: 0,
    celulares: 0,
    descargos: 0,
    nomenclaturas: 0,
    auditLogs: 0
  };
  
  const nuevo = { ...antiguo };
  
  // Ejecuta en proyecto antiguo y anota los números
  // Luego ejecuta en proyecto nuevo y compara
  
  console.log('ANTIGUO vs NUEVO');
  console.log('equipos:', antiguo.equipos, 'vs', nuevo.equipos);
  console.log('asignaciones:', antiguo.asignaciones, 'vs', nuevo.asignaciones);
  // ... etc
};
```

---

## Troubleshooting

### Problema: "Permission denied" durante importación

**Solución:**
```bash
# Asegúrate que tienes permisos en Firestore
firebase firestore:delete --all --project=nuevo-proyecto-id --yes

# Luego importa nuevamente
firebase firestore:import ./firestore-backup --project=nuevo-proyecto-id
```

### Problema: Documentos duplicados

**Solución:**
```javascript
// Limpia antes de importar:
const db = firebase.firestore();

async function deleteAllDocs() {
  const collections = ['equipos', 'asignaciones', 'celulares', 'descargos', 'nomenclaturas', 'auditLogs'];
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    snapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });
  }
}

deleteAllDocs();
```

### Problema: Archivo muy grande

**Solución:**
- Exporta colecciones por separado
- Usa Google Cloud Storage (Método 3)
- Particiona los datos

---

## Tamaño Estimado de Datos

| Colección | Documentos Estimados | Tamaño Aproximado |
|-----------|----------------------|-------------------|
| equipos | 100-500 | 1-5 MB |
| asignaciones | 100-300 | 2-10 MB |
| celulares | 50-200 | 0.5-2 MB |
| descargos | 50-200 | 0.5-2 MB |
| nomenclaturas | 10-50 | 0.1-0.5 MB |
| auditLogs | 1000+ | 5-20 MB |
| **TOTAL** | **~1500-2000** | **~10-40 MB** |

---

## Checklist de Exportación/Importación

- [ ] Proyecto antiguo accesible
- [ ] Proyecto nuevo creado
- [ ] Firestore inicializado en proyecto nuevo
- [ ] Backup completado
- [ ] Datos verificados (mismo número de documentos)
- [ ] Datos muestreados (contenido correcto)
- [ ] Sin duplicados detectados
- [ ] Rutas de referencias intactas
- [ ] Timestamps preservados
- [ ] Documento de migración completado

---

**Última actualización:** 16 de Enero de 2026
**Versión:** 1.0
