import type { Action } from 'svelte/action'

/**
 * An action responsible for registering globally a given `keydown` event handler when the component is mounted.
 * Cleans up the event listener automatically when unmounted.
 */
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
