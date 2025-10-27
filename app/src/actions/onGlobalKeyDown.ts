import type { Action } from 'svelte/action'

export const onGlobalKeyDown: Action<HTMLElement, (event: KeyboardEvent) => void> = (node, handler) => {
	const handleKeyDown = (event: KeyboardEvent) => {
		if (node) {
			const target = event.target as HTMLElement | null

			if(!target) {
				return
			}

			handler(event)
		}
	}

	document.addEventListener('keydown', handleKeyDown)

	return {
		destroy() {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}
}
