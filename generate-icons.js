import sharp from 'sharp';
import * as fs from 'fs';

// SVG del monitor
const monitorSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <style>
      .monitor-screen { fill: none; stroke: #003399; stroke-width: 20; stroke-linejoin: round; }
      .monitor-stand { fill: none; stroke: #003399; stroke-width: 20; stroke-linejoin: round; }
      .monitor-foot { fill: #003399; }
      .monitor-pole { stroke: #003399; stroke-width: 16; stroke-linecap: round; }
    </style>
  </defs>
  <!-- Pantalla -->
  <rect x="80" y="120" width="352" height="280" rx="16" class="monitor-screen"/>
  <!-- Soporte -->
  <path d="M 100 400 L 160 480 L 432 480 L 492 400" class="monitor-stand"/>
  <!-- Patas -->
  <circle cx="160" cy="480" r="20" class="monitor-foot"/>
  <circle cx="432" cy="480" r="20" class="monitor-foot"/>
  <!-- Polos del monitor -->
  <line x1="240" y1="120" x2="240" y2="80" class="monitor-pole"/>
  <line x1="392" y1="120" x2="392" y2="80" class="monitor-pole"/>
</svg>
`;

const sizes = [
  { size: 192, filename: 'icon-192x192.png', purpose: 'any' },
  { size: 512, filename: 'icon-512x512.png', purpose: 'any maskable' },
  { size: 180, filename: 'apple-touch-icon-180x180.png', purpose: 'apple' }
];

async function generateIcons() {
  const publicDir = './public';
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generando iconos de monitor...');

  for (const { size, filename } of sizes) {
    try {
      await sharp(Buffer.from(monitorSVG))
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(`${publicDir}/${filename}`);
      
      console.log(`✓ Creado: ${filename} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Error generando ${filename}:`, error.message);
    }
  }

  console.log('¡Iconos generados exitosamente!');
}

generateIcons().catch(console.error);
