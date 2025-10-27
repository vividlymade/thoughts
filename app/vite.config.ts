import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import arraybuffer from 'vite-plugin-arraybuffer'
// import { svelte } from '@sveltejs/vite-plugin-svelte'

import { sveltekit } from '@sveltejs/kit/vite'
// import { esbuildDecorators } from '@anatine/esbuild-decorators'
// import swc from '@rollup/plugin-swc'

// export default defineConfig({
//   plugins: [sveltekit()]
// });


export default defineConfig({
  build: {
    outDir: 'build/',
    /** Necessary to keep the builds clean. */
    emptyOutDir: true,
  },
  // root: 'src',
  // base: './',
  // preview: {
  //   host: true,
  //   port: 80,
  //   strictPort: true
  // },
  // server: {
  //   host: true,
  //   port: 80,
  //   strictPort: true
  // },
  envDir: '../',
  ssr: {
    external: ['reflect-metadata', 'pg'],
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          // esbuildDecorators({
          //   tsconfig: './tsconfig.json',
          // }),
        ],
        minify: true,
      },
    },
  },
  plugins: [
    arraybuffer(),
	// svelte()
    tailwindcss(),
    sveltekit(),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
  }
})
