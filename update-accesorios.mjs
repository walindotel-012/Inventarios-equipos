import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuración de Firebase (reemplaza con tus valores)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function actualizarAcesorios() {
  try {
    console.log('🔄 Iniciando actualización de accesorios...\n');

    const accesoriosRef = collection(db, 'accesorios');
    const snapshot = await getDocs(accesoriosRef);

    let actualizados = 0;
    let sinActualizar = 0;

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
        const nuevoSerial = `${accesorio.codigoActivoFijo || id}`;

        try {
          await updateDoc(doc(db, 'accesorios', id), {
            serial: nuevoSerial,
          });

          console.log(`✅ Actualizado: ${accesorio.codigoActivoFijo} - ${accesorio.tipoAccesorio}`);
          console.log(`   Serial generado: ${nuevoSerial}\n`);
          actualizados++;
        } catch (error) {
          console.error(`❌ Error actualizando ${id}:`, error.message);
        }
      } else {
        console.log(`⏭️  Ya tiene identificador: ${accesorio.codigoActivoFijo}`);
        sinActualizar++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ Actualizados: ${actualizados}`);
    console.log(`⏭️  Sin cambios: ${sinActualizar}`);
    console.log(`📦 Total procesados: ${actualizados + sinActualizar}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la actualización
actualizarAcesorios();
