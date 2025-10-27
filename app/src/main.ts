import { mount } from 'svelte'

// import './app.css'

import App from './routes/(landing)/+page.svelte'

const app = mount(App, { target: document.body } as any)

export default app