const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const firestore = admin.firestore();
const storage = admin.storage();

/**
 * Función para respaldar automáticamente las colecciones de Firestore a Cloud Storage
 * Se ejecuta mediante Cloud Scheduler todos los días a las 2:00 AM
 */
exports.backupFirestore = functions.pubsub.topic('firestore-backup').onPublish(async (message) => {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0]; // Formato: 2026-01-22
  const bucket = storage.bucket();
  
  const collectionsToBackup = [
    'equipos',
    'celulares',
    'accesorios',
    'asignaciones',
    'nomenclaturas',
    'marcas',
    'tiposAccesorio',
    'bitacora',
    'auditlog'
  ];

  try {
    console.log(`🔄 Iniciando backup de Firestore - ${timestamp}`);

    // Respaldar cada colección
    for (const collectionName of collectionsToBackup) {
      try {
        const snapshot = await firestore.collection(collectionName).get();
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const backupData = {
          collection: collectionName,
          timestamp: new Date().toISOString(),
          documentCount: data.length,
          data: data
        };

        const filename = `backups/${timestamp}/${collectionName}.json`;
        await bucket.file(filename).save(JSON.stringify(backupData, null, 2));
        
        console.log(`✅ ${collectionName}: ${data.length} documentos respaldados`);
      } catch (collectionError) {
        console.warn(`⚠️ Error respaldando ${collectionName}:`, collectionError.message);
        // Continuar con la siguiente colección aunque una falle
      }
    }

    // Crear un archivo de resumen
    const summaryData = {
      backupDate: timestamp,
      timestamp: new Date().toISOString(),
      collections: collectionsToBackup.length,
      status: 'completed'
    };

    await bucket.file(`backups/${timestamp}/SUMMARY.json`).save(
      JSON.stringify(summaryData, null, 2)
    );

    console.log(`✅ Backup completado exitosamente - ${timestamp}`);
    
    return {
      success: true,
      timestamp: timestamp,
      message: 'Backup completado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error en backup: ${error.message}`);
    throw error;
  }
});

/**
 * Función para limpiar respaldos antiguos (mantener últimos 30 días)
 */
exports.cleanupOldBackups = functions.pubsub.topic('firestore-backup').onPublish(async (message) => {
  try {
    const bucket = storage.bucket();
    const files = await bucket.getFiles({ prefix: 'backups/' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let deletedCount = 0;

    for (const file of files[0]) {
      const fileDate = new Date(file.metadata.timeCreated);
      
      if (fileDate < thirtyDaysAgo) {
        await file.delete();
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} respaldos antiguos eliminados`);
    }

    return {
      success: true,
      deletedCount: deletedCount
    };
  } catch (error) {
    console.error('❌ Error en limpieza de backups:', error);
    // No lanzar error para no interrumpir el flujo
    return { success: false, error: error.message };
  }
});
