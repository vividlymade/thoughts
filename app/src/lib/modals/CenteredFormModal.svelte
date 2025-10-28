<script lang="ts">
    import { enhance as _enhance } from '$app/forms'
	import type { Snippet } from 'svelte'
	import type { SubmitFunction } from '@sveltejs/kit'
	import type { HTMLFormAttributes } from 'svelte/elements'


    let {
		headerIcon,
        headerText,
		enhance,
        children,
        enctype,
	}: {
		headerIcon: Snippet | any,
		headerText: string,
		enhance: SubmitFunction,
        children: Snippet,
        enctype?: HTMLFormAttributes['enctype'],
    } = $props()

</script>

<form method="post"
      enctype={enctype}
      use:_enhance={enhance}
      class="relative w-full h-fit flex flex-col content-center place-items-center place-self-center bg-white/50 backdrop-blur-xs rounded-4xl px-12 py-8 justify-self-center space-y-3 select-none" style="box-shadow: 0px 2px 50px rgba(0,0,0,0.05); backdrop-filter: blur(2.5px);"
    >
    <h1 class="font-light text-[#0a0a0a] text-xl flex items-center self-start">
        <span class="w-4.5 mr-3">{@render headerIcon()}</span>
        {headerText}
    </h1>
    {@render children()}
</form>
