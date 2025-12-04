<script lang="ts">
	import data from '@emoji-mart/data'
	import type { Picker } from 'emoji-mart'
    import { scale, slide } from 'svelte/transition'
    import { onOutsideClick } from '../actions/onOutsideClick'
	import EmojiMart from '$lib/stores/emojiMart'

	let {
		onEmojiSelect,
        open = $bindable(),
	}: {
		onEmojiSelect: (emoji: any) => void,
        open: boolean,
    } = $props()

    let emojiPickerWrapper: HTMLElement

    let picker: Picker | HTMLElement

    function onEmojiPickerWrapperMount(wrapper: any) {
		(async function() {
			// if (!$EmojiMart) {
			// 	EmojiMart.set(await import('emoji-mart'))
			// }

			picker = new EmojiMart!.Picker({
				data: data,
				theme: 'light',
                emojiSize: 18,
                emojiButtonSize: 32,
				autoFocus: true,
                dynamicWidth: true,
				onEmojiSelect: (emoji: any) => {
					onEmojiSelect(emoji)
				}
			})

			wrapper.appendChild(picker as unknown as HTMLElement)
		})()
    }
</script>

<div
    use:onEmojiPickerWrapperMount
    use:onOutsideClick={() => open = false}
    bind:this={emojiPickerWrapper}
    transition:scale
    class="transition-all duration-500 will-change-auto z-100"
></div>

<style>
    :global(em-emoji-picker) {
        --background-rgb: 85, 170, 255;
        --border-radius: 24px;
        --category-icon-size: 16px;
        --preview-placeholder-size: 10px;
        --font-family: inherit;
        --font-size: 12px;
        --shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.08);

        width: 300px;
        overflow: auto;

        height: 45vh;
        min-height: 300px;
    }
</style>
