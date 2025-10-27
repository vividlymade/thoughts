<script lang="ts">
    import type { Snippet } from 'svelte'

	let {
		icon,
		label,
		onClick,
	}: {
		icon: Snippet | any,
        label: string,
		onClick: () => void
    } = $props()
</script>

<button
    onclick={onClick}
    class="cursor-pointer items-center space-x-3.5 text-black outline-none
    hover:bg-zinc-200 active:scale-99 transition-all duration-200 will-change-transform w-full flex"
>
    <span class="flex size-3.5 rounded-full p-2 border border-zinc-100 shadow-sm box-content bg-[#5381ED] text-white">{@render icon()}</span>
    <span>{label}</span>
</button>
