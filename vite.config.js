import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (repo hosted at https://walindotel-012.github.io/Inventarios-equipos/)
  base: '/Inventarios-equipos/',
})
