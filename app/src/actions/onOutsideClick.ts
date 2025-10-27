import type { Action } from 'svelte/action'

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

	document.addEventListener('click', handleClick, {
		capture: true,
	})

	return {
		destroy() {
			document.removeEventListener('click', handleClick)
		}
	}
}
