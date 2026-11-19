#!/usr/bin/env node

/**
 * Script para normalizar estado de accesorios
 * Marca todos los accesorios asignados en asignaciones activas como asignado: true
 */

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
  process.exit(1);
}

const firestore = admin.firestore();

async function normalizeAccesorios() {
  console.log('\n📋 NORMALIZADOR DE ACCESORIOS');
  console.log('════════════════════════════════════════════\n');

  try {
    // Paso 1: Obtener todas las asignaciones
    console.log('⏳ Leyendo asignaciones...');
    const asignacionesSnap = await firestore.collection('asignaciones').get();
    const asignaciones = asignacionesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ Encontradas ${asignaciones.length} asignaciones\n`);

    // Paso 2: Obtener todos los accesorios
    console.log('⏳ Leyendo accesorios...');
    const accesoriosSnap = await firestore.collection('accesorios').get();
    const accesorios = accesoriosSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ Encontrados ${accesorios.length} accesorios\n`);

    // Paso 3: Identificar accesorios asignados
    const accesoriosAsignados = new Set();
    asignaciones.forEach(asignacion => {
      if (asignacion.accesorioId) {
        accesoriosAsignados.add(asignacion.accesorioId);
      }
    });

    console.log(`📊 Accesorios con asignaciones: ${accesoriosAsignados.size}\n`);

    // Paso 4: Actualizar estado de accesorios
    console.log('⏳ Actualizando estado de accesorios...\n');
    let actualizados = 0;

    for (const accesorio of accesorios) {
      const debeEstarAsignado = accesoriosAsignados.has(accesorio.id);
      const estaActualmenteMarcadoAsignado = accesorio.asignado === true;

      // Si debe estar asignado pero no está marcado, marcarlo
      if (debeEstarAsignado && !estaActualmenteMarcadoAsignado) {
        await firestore.collection('accesorios').doc(accesorio.id).update({
          asignado: true
        });
        console.log(`✅ ${accesorio.codigoActivoFijo} - MARCADO COMO ASIGNADO`);
        actualizados++;
      }
      // Si NO debe estar asignado pero está marcado, desmaracarlo
      else if (!debeEstarAsignado && estaActualmenteMarcadoAsignado) {
        await firestore.collection('accesorios').doc(accesorio.id).update({
          asignado: false
        });
        console.log(`✅ ${accesorio.codigoActivoFijo} - MARCADO COMO DISPONIBLE`);
        actualizados++;
      }
    }

    console.log('\n' + '════════════════════════════════════════════');
    console.log('✅ NORMALIZACIÓN COMPLETADA');
    console.log('════════════════════════════════════════════');
    console.log(`\n📊 Accesorios actualizados: ${actualizados}`);
    console.log(`✅ Estado de accesorios sincronizado correctamente\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

normalizeAccesorios();
