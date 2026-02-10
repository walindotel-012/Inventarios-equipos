#!/usr/bin/env node

/**
 * Script de restauración de respaldo desde Firestore
 * Uso: node restore-backup.js <backup_id>
 * 
 * Ejemplo:
 *   node restore-backup.js backup_2026-01-22_1769108332835
 * 
 * Este script restaura TODAS las colecciones de un respaldo anterior.
 * ⚠️ ADVERTENCIA: Esto SOBRESCRIBE todos los datos actuales
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Inicializar Firebase Admin SDK
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountData);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  console.log('📝 Guárdala como serviceAccountKey.json en este directorio');
  process.exit(1);
}

const firestore = admin.firestore();

// Crear interfaz para preguntas
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function listBackups() {
  try {
    console.log('\n📋 Listando respaldos disponibles...\n');
    
    const snapshot = await firestore.collection('backups_manual').get();
    
    if (snapshot.empty) {
      console.log('❌ No hay respaldos disponibles');
      return [];
    }

    const backups = [];
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const totalDocs = data.totalDocuments || 0;
      const date = data.backupDate || 'unknown';
      
      backups.push({
        id: doc.id,
        date: date,
        totalDocuments: totalDocs,
        status: data.status
      });

      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   📅 Fecha: ${date}`);
      console.log(`   📄 Documentos: ${totalDocs}`);
      console.log(`   ✅ Estado: ${data.status}`);
      console.log('');
    });

    return backups;
  } catch (error) {
    console.error('❌ Error listando respaldos:', error.message);
    return [];
  }
}

async function restoreBackup(backupId) {
  try {
    console.log(`\n⏳ Cargando respaldo: ${backupId}...`);
    
    const backupDoc = await firestore.collection('backups_manual').doc(backupId).get();
    
    if (!backupDoc.exists) {
      console.error('❌ Respaldo no encontrado');
      return false;
    }

    const backupData = backupDoc.data();
    const data = backupData.data || {};

    console.log('\n' + '━'.repeat(60));
    console.log('⚠️ ADVERTENCIA - OPERACIÓN DESTRUCTIVA');
    console.log('━'.repeat(60));
    console.log('\n📌 Esto SOBRESCRIBIRÁ todos los datos en estas colecciones:');
    
    Object.keys(data).forEach(collection => {
      const count = data[collection].length;
      console.log(`   • ${collection}: ${count} documentos`);
    });

    console.log('\n⚠️ No se puede deshacer. ¿Continuar?');
    
    const confirm = await question('\nEscribe "restaurar" para confirmar: ');
    
    if (confirm !== 'restaurar') {
      console.log('\n❌ Restauración cancelada');
      return false;
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📦 INICIANDO RESTAURACIÓN');
    console.log('━'.repeat(60));

    let restoredCollections = 0;
    let totalDocuments = 0;

    for (const [collectionName, documents] of Object.entries(data)) {
      if (!Array.isArray(documents) || documents.length === 0) {
        console.log(`⏭️ ${collectionName}: Vacío (omitido)`);
        continue;
      }

      try {
        console.log(`\n⏳ Restaurando ${collectionName}...`);

        // Crear batch para operaciones por lotes
        let batch = firestore.batch();
        let batchCount = 0;

        for (const doc of documents) {
          const docId = doc.id;
          const docData = { ...doc };
          delete docData.id; // Remover el campo ID

          const docRef = firestore.collection(collectionName).doc(docId);
          batch.set(docRef, docData);

          batchCount++;
          totalDocuments++;

          // Commit cada 500 documentos
          if (batchCount === 500) {
            await batch.commit();
            batch = firestore.batch();
            batchCount = 0;
          }
        }

        // Commit de los documentos restantes
        if (batchCount > 0) {
          await batch.commit();
        }

        restoredCollections++;
        console.log(`✅ ${collectionName}: ${documents.length} documentos restaurados`);
      } catch (error) {
        console.error(`❌ Error restaurando ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📊 RESUMEN DE RESTAURACIÓN');
    console.log('━'.repeat(60));
    console.log(`✅ Colecciones restauradas: ${restoredCollections}`);
    console.log(`📄 Total de documentos: ${totalDocuments}`);
    console.log(`📅 Fecha del respaldo: ${backupData.backupDate}`);
    console.log('━'.repeat(60));
    console.log('\n🎉 Restauración completada exitosamente!\n');

    return true;
  } catch (error) {
    console.error('❌ Error en restauración:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🔄 RESTAURADOR DE RESPALDOS FIRESTORE');
  console.log('═'.repeat(60));

  const backupId = process.argv[2];

  if (!backupId) {
    // Listar respaldos disponibles
    const backups = await listBackups();
    
    if (backups.length === 0) {
      rl.close();
      process.exit(1);
    }

    const selectedNum = await question('Selecciona el número del respaldo a restaurar (o Ctrl+C para salir): ');
    const selected = backups[parseInt(selectedNum) - 1];

    if (!selected) {
      console.log('❌ Selección inválida');
      rl.close();
      process.exit(1);
    }

    await restoreBackup(selected.id);
  } else {
    // Restaurar el backup especificado directamente
    await restoreBackup(backupId);
  }

  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
