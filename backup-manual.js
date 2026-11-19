#!/usr/bin/env node

/**
 * Script de respaldo manual de Firestore
 * Uso: node backup-manual.js
 * 
 * Este script respalda todas las colecciones de Firestore a Cloud Storage
 * Útil para respaldos puntuales sin esperar al programado
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Inicializar Firebase Admin SDK
try {
  // Intenta cargar desde la ubicación estándar de Firebase
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountData);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  console.log('📝 Para usar este script, descarga la clave de servicio:');
  console.log('   1. Firebase Console → Configuración → Cuentas de servicio');
  console.log('   2. Genera una nueva clave privada');
  console.log('   3. Guárdala como serviceAccountKey.json en este directorio');
  process.exit(1);
}

const firestore = admin.firestore();

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

async function backupAllCollections() {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0];
  const backupCollectionName = 'backups_manual';

  console.log('\n📦 Iniciando respaldo manual de Firestore');
  console.log(`📅 Fecha: ${timestamp}`);
  console.log('─'.repeat(50));

  let totalDocuments = 0;
  let successCount = 0;
  let errorCount = 0;
  const backupData = {};

  for (const collectionName of collectionsToBackup) {
    try {
      console.log(`\n⏳ Respaldando ${collectionName}...`);
      
      const snapshot = await firestore.collection(collectionName).get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      backupData[collectionName] = data;
      totalDocuments += data.length;
      successCount++;
      
      console.log(`✅ ${collectionName}: ${data.length} documentos`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error en ${collectionName}: ${error.message}`);
    }
  }

  // Guardar respaldo en colección Firestore
  try {
    const backupId = `backup_${timestamp}_${Date.now()}`;
    
    await firestore.collection(backupCollectionName).doc(backupId).set({
      backupDate: timestamp,
      timestamp: new Date().toISOString(),
      collectionsBackedUp: successCount,
      collectionsError: errorCount,
      totalDocuments: totalDocuments,
      status: errorCount === 0 ? 'completed' : 'completed-with-errors',
      data: backupData
    });

    console.log(`✅ Respaldo guardado con ID: ${backupId}`);
  } catch (error) {
    console.error('❌ Error guardando respaldo:', error.message);
  }

  // Mostrar resumen
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 RESUMEN DEL RESPALDO');
  console.log(`✅ Colecciones exitosas: ${successCount}`);
  console.log(`❌ Colecciones con error: ${errorCount}`);
  console.log(`📄 Total de documentos: ${totalDocuments}`);
  console.log(`📍 Ubicación: Firestore → backups_manual → ${timestamp}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Respaldo completado exitosamente!\n');
  } else {
    console.log('\n⚠️ Respaldo completado con algunos errores\n');
  }

  process.exit(errorCount === 0 ? 0 : 1);
}

// Ejecutar respaldo
backupAllCollections().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
