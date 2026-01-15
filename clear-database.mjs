import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";
import * as readline from "readline";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDISgwREfbDOU1sB448sU5TW6ZUHLy0i_A",
  authDomain: "inventario-equipos-d1553.firebaseapp.com",
  projectId: "inventario-equipos-d1553",
  storageBucket: "inventario-equipos-d1553.firebasestorage.app",
  messagingSenderId: "581733770014",
  appId: "1:581733770014:web:4135c37f92480c5983df0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Colecciones a limpiar
const COLLECTIONS = [
  'equipos',
  'celulares',
  'nomenclaturas',
  'asignaciones',
  'entregas',
  'descargos'
];

// Función para confirmar con el usuario
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'si' || answer.toLowerCase() === 's' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Función para borrar una colección
async function deleteCollection(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`✓ Colección "${collectionName}" eliminada (${querySnapshot.docs.length} documentos)`);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error(`✗ Error al eliminar colección "${collectionName}":`, error.message);
    return 0;
  }
}

// Función principal
async function clearDatabase() {
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  ADVERTENCIA: OPERACIÓN DESTRUCTIVA');
  console.log('='.repeat(60));
  console.log('\nEsta acción eliminará TODOS los registros de tu base de datos:');
  COLLECTIONS.forEach(col => console.log(`  • ${col}`));
  console.log('\nEsta acción NO se puede deshacer.\n');

  const confirmed = await askConfirmation('¿Estás seguro de que deseas continuar? (si/no): ');

  if (!confirmed) {
    console.log('\n✗ Operación cancelada.');
    process.exit(0);
  }

  const secondConfirm = await askConfirmation('⚠️  Escribe "BORRAR TODO" para confirmar definitivamente: ');
  
  if (secondConfirm !== true) {
    // Pidiendo que escriban exactamente "BORRAR TODO"
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Escribe "BORRAR TODO" para confirmar: ', async (answer) => {
      rl.close();
      
      if (answer === 'BORRAR TODO') {
        await executeClear();
      } else {
        console.log('\n✗ Confirmación incorrecta. Operación cancelada.');
        process.exit(0);
      }
    });
  } else {
    await executeClear();
  }
}

async function executeClear() {
  console.log('\n' + '='.repeat(60));
  console.log('🗑️  Iniciando eliminación de registros...');
  console.log('='.repeat(60) + '\n');

  let totalDeleted = 0;

  for (const collectionName of COLLECTIONS) {
    const deleted = await deleteCollection(collectionName);
    totalDeleted += deleted;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✓ Proceso completado`);
  console.log(`Total de documentos eliminados: ${totalDeleted}`);
  console.log('='.repeat(60) + '\n');
  
  process.exit(0);
}

// Ejecutar
clearDatabase().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
