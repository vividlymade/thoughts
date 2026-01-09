<script lang="ts">
    import { scale } from 'svelte/transition'
    import TrashCanIcon from '$lib/icons/trash-can.svelte'
	import { onOutsideClick } from '../../actions/onOutsideClick'

	let {
		show = $bindable(),
        ownsPost,
        onPostRemovalRequest,
    }: {
		show: boolean,
        ownsPost: boolean,
        onPostRemovalRequest: () => void,
    } = $props()
</script>

<div
    use:onOutsideClick="{() => show = false}"
    transition:scale
     class="absolute select-none overflow-clip flex flex-col top-full left-0 w-fit text-zinc-400 text-[11px]
     bg-white shadow-lg rounded-xl z-100 will-change-transform"
>
    {#if ownsPost}
        <button onclick={onPostRemovalRequest} class="items-center flex space-x-2 justify-center font-light p-3.5
            cursor-pointer hover:bg-zinc-100 active:scale-95 active:rounded-xl transition-all will-change-transform"
        >
            <span class="size-3 self-center"><TrashCanIcon/></span>
            <span>Remove</span>
        </button>
    {/if}
</div>
