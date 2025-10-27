import type { Action } from 'svelte/action'

export const documentScrollLock: Action = () => {
	const originalOverflow = document.body.style.overflow

	document.documentElement.style.overflow = 'hidden'

	return {
		destroy() {
			document.documentElement.style.overflow = originalOverflow
		}
	}
}
