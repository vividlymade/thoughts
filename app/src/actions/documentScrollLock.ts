import type { Action } from 'svelte/action'

/**
 * An action responsible for detecting `click` events outside the element when the component is mounted.
 * Cleans up the event listener automatically when unmounted.
 */
export const documentScrollLock: Action = () => {
	const originalOverflow = document.body.style.overflow

	document.documentElement.style.overflow = 'hidden'

	return {
		destroy() {
			document.documentElement.style.overflow = originalOverflow
		}
	}
}
