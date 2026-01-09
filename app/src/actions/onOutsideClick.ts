import type { Action } from 'svelte/action'

/**
 * An action responsible for registering and detecting a given `click` events outside of the element it is applied to. handler when the component is mounted.
 * Cleans up the event listener automatically when unmounted.
 */
export const onOutsideClick: Action<HTMLElement, () => void> = (node, handler) => {
	const handleClick = (event: MouseEvent) => {
		if (node) {
			const target = event.target as HTMLElement | null

			const triggeredOutsideNode = !node.contains(target)

			if(triggeredOutsideNode) {
				handler()
			}
		}
	}

	/** Defer adding the listener to the next event loop cycle so the click
	 * that opened the component won't immediately trigger the handler. */
	setTimeout(() => {
		document.addEventListener('click', handleClick)
	}, 0)

	return {
		destroy() {
			document.removeEventListener('click', handleClick)
		}
	}
}
