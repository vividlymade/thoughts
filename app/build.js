import { $ } from 'bun'

await Promise.all([
    (async () => {
        try {
            await $`bunx vite build`
        } catch (e) {
            console.error(e)
        }
    })()
])