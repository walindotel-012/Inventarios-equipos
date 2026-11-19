/**
 * Utilidad para actualizar accesorios sin serial en Firestore
 * 
 * Uso en la consola del navegador:
 * import { actualizarAcesoriosSinSerial } from './src/utils/updateAccesorios.js'
 * await actualizarAcesoriosSinSerial()
 */

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export async function actualizarAcesoriosSinSerial() {
  try {
    console.log('🔄 Iniciando actualización de accesorios...\n');

    const accesoriosRef = collection(db, 'accesorios');
    const snapshot = await getDocs(accesoriosRef);

    let actualizados = 0;
    let sinActualizar = 0;
    const acesoriosaActualizar = [];

    console.log(`📊 Total de accesorios en la BD: ${snapshot.docs.length}`);
    console.log('---\n');

    for (const docSnap of snapshot.docs) {
      const accesorio = docSnap.data();
      const id = docSnap.id;

      // Verificar si falta identificador
      const tieneIdentificador = 
        accesorio.serial || 
        accesorio.numero || 
        accesorio.numeroSerie || 
        accesorio.imei;

      if (!tieneIdentificador) {
        // Generar un serial por defecto usando el código de activo fijo
        const nuevoSerial = accesorio.codigoActivoFijo || id;
        acesoriosaActualizar.push({
          id,
          codigoActivoFijo: accesorio.codigoActivoFijo,
          tipoAccesorio: accesorio.tipoAccesorio,
          serial: nuevoSerial,
        });
      } else {
        sinActualizar++;
      }
    }

    console.log(`⚠️  Accesorios sin serial encontrados: ${acesoriosaActualizar.length}`);
    console.log(`✅ Accesorios con serial: ${sinActualizar}\n`);

    if (acesoriosaActualizar.length === 0) {
      console.log('✅ Todos los accesorios tienen serial. No hay nada que actualizar.');
      return {
        actualizados: 0,
        sinActualizar,
        total: snapshot.docs.length,
      };
    }

    // Mostrar los que serán actualizados
    console.log('Accesorios a actualizar:');
    acesoriosaActualizar.forEach((acc, idx) => {
      console.log(`${idx + 1}. ${acc.codigoActivoFijo} - ${acc.tipoAccesorio}`);
      console.log(`   → Serial: ${acc.serial}`);
    });

    console.log('\n---\n');
    const confirmacion = confirm(
      `¿Deseas actualizar ${acesoriosaActualizar.length} accesorios?`
    );

    if (!confirmacion) {
      console.log('❌ Operación cancelada.');
      return { cancelado: true };
    }

    console.log('\n🔄 Actualizando...\n');

    for (const accesorio of acesoriosaActualizar) {
      try {
        await updateDoc(doc(db, 'accesorios', accesorio.id), {
          serial: accesorio.serial,
        });

        console.log(`✅ ${accesorio.codigoActivoFijo} - ${accesorio.tipoAccesorio}`);
        actualizados++;
      } catch (error) {
        console.error(`❌ Error actualizando ${accesorio.id}:`, error.message);
      }
    }

    console.log('\n---\n');
    console.log('📊 Resumen:');
    console.log(`✅ Actualizados: ${actualizados}`);
    console.log(`⏭️  Sin cambios: ${sinActualizar}`);
    console.log(`📦 Total: ${actualizados + sinActualizar}`);

    return {
      actualizados,
      sinActualizar,
      total: actualizados + sinActualizar,
      exitoso: true,
    };

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Función auxiliar para revisar accesorios sin serial
 */
export async function revisarAcesoriosSinSerial() {
  try {
    const accesoriosRef = collection(db, 'accesorios');
    const snapshot = await getDocs(accesoriosRef);

    const sinSerial = [];

    for (const docSnap of snapshot.docs) {
      const accesorio = docSnap.data();
      const tieneIdentificador = 
        accesorio.serial || 
        accesorio.numero || 
        accesorio.numeroSerie || 
        accesorio.imei;

      if (!tieneIdentificador) {
        sinSerial.push({
          id: docSnap.id,
          ...accesorio,
        });
      }
    }

    console.log(`\n📋 Accesorios sin identificador (${sinSerial.length}):`);
    sinSerial.forEach(acc => {
      console.log(`${acc.codigoActivoFijo} - ${acc.tipoAccesorio}`);
    });

    return sinSerial;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
