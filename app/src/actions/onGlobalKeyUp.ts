import type { Action } from 'svelte/action'

/**
 * An action responsible for registering globally a given `keyup` event handler when the component is mounted.
 * Cleans up the event listener automatically when unmounted.
 */
export const onGlobalKeyUp: Action<HTMLElement, (event: KeyboardEvent) => void> = (node, handler) => {
	const handleKeyUp = (event: KeyboardEvent) => {
		if (node) {
			const target = event.target as HTMLElement | null

			if(!target) {
				return
			}

			handler(event)
		}
	}

	document.addEventListener('keyup', handleKeyUp)

	return {
		destroy() {
			document.removeEventListener('keyup', handleKeyUp)
		}
	}
}
