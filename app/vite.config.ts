import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import arraybuffer from 'vite-plugin-arraybuffer'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
  build: {
    outDir: 'build/',
    /** Necessary to keep the builds clean. */
    emptyOutDir: true,
  },
  envDir: '../',
  ssr: {
    external: ['reflect-metadata', 'pg'],
    optimizeDeps: {
      esbuildOptions: {
        plugins: [],
        minify: true,
      },
    },
  },
  plugins: [
    arraybuffer(),
    tailwindcss(),
    sveltekit(),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
  }
})
