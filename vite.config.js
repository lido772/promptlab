import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), 'index.html'),
        features: resolve(process.cwd(), 'features.html'),
        security: resolve(process.cwd(), 'security.html'),
        models: resolve(process.cwd(), 'models.html'),
        guidePromptEngineering: resolve(process.cwd(), 'guide-prompt-engineering.html'),
        comparatifOutilsPrompt: resolve(process.cwd(), 'comparatif-outils-prompt.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});