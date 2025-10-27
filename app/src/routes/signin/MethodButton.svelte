<script lang="ts">
    import type { Snippet } from 'svelte'

	let { text, href, icon }: {
        text: string,
		href: string,
        icon: Snippet,
    } = $props()
</script>
<div class="active:scale-95 transition-all will-change-transform">
    <a href={href} class="flex items-center pl-16 py-4 border border-[#EFEFEF] rounded-2xl text-[11px] l-2/3 my-0.75"
       style="box-shadow: 0px 0px 8px rgba(0,0,0,0.03);">{@render icon()} {text}</a>
</div>
