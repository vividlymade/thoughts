import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
// import { vitePreprocess } from '@sveltejs/kit/vite'

// /** @type {import('@sveltejs/kit').Config} */
/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
const config = {
    onwarn: (warning, handler) => {
        if(warning.code === 'block_empty') {
            return
        }

        handler(warning)
    },
    kit: {
        adapter: adapter(),
    },
    preprocess: vitePreprocess({
        script: true,
    }),
    compilerOptions: {
        cssHash: ({ hash, css, name, filename }) => {
            return `style-${hash(css)}`
        },
    },
}

export default config