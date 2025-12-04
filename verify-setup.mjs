#!/usr/bin/env node

/**
 * Script de verificación del proyecto
 * Verifica que todos los archivos necesarios estén en su lugar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const requiredFiles = [
  'src/App.jsx',
  'src/main.jsx',
  'src/index.css',
  'src/firebase.js',
  'src/constants.js',
  'src/contexts/AuthContext.jsx',
  'src/components/Navbar.jsx',
  'src/pages/Login.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Equipos.jsx',
  'src/pages/Nomenclaturas.jsx',
  'src/pages/Asignacion.jsx',
  'src/pages/HojaEntrega.jsx',
  'src/utils/helpers.js',
  '.env.example',
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
];

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

console.log('🔍 Verificando estructura del proyecto...\n');

let allGood = true;

// Verificar archivos
console.log('📁 Verificando archivos requeridos:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NO ENCONTRADO`);
    allGood = false;
  }
});

// Verificar variables de entorno
console.log('\n🔐 Verificando variables de entorno (.env.local):');
const envLocalPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key] = line.split('=');
    if (key && !line.startsWith('#')) acc.push(key.trim());
    return acc;
  }, []);

  requiredEnvVars.forEach(envVar => {
    if (envVars.includes(envVar)) {
      const value = envContent
        .split('\n')
        .find(line => line.startsWith(envVar))?
        .split('=')?.[1];
      if (value && !value.includes('your_')) {
        console.log(`  ✅ ${envVar} - Configurado`);
      } else {
        console.log(`  ⚠️  ${envVar} - NO CONFIGURADO (placeholder detectado)`);
      }
    } else {
      console.log(`  ❌ ${envVar} - FALTANTE`);
      allGood = false;
    }
  });
} else {
  console.log(`  ❌ .env.local no existe`);
  console.log(`  📝 Copia .env.example a .env.local y completa con tus credenciales de Firebase`);
  allGood = false;
}

// Verificar package.json
console.log('\n📦 Verificando dependencias principales:');
const packagePath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  'firebase',
  'jspdf',
  'html2canvas',
  'tailwindcss',
];

requiredDeps.forEach(dep => {
  if (packageData.dependencies[dep] || packageData.devDependencies[dep]) {
    console.log(`  ✅ ${dep}`);
  } else {
    console.log(`  ❌ ${dep} - NO ENCONTRADO`);
    allGood = false;
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✨ Todo looks good! Puedes ejecutar: npm run dev');
} else {
  console.log(
    '⚠️  Hay algunas cosas que revisar. Por favor, verifica los puntos marcados con ❌'
  );
  console.log('\n📋 Próximos pasos:');
  console.log('  1. Copia .env.example a .env.local');
  console.log('  2. Completa las credenciales de Firebase en .env.local');
  console.log('  3. Ejecuta: npm install (si no lo has hecho)');
  console.log('  4. Ejecuta: npm run dev');
}
console.log('='.repeat(50) + '\n');
