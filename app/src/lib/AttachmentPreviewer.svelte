<script lang="ts">
    import { portal } from 'svelte-portal'
    import { documentScrollLock } from '../actions/documentScrollLock'
    import { onGlobalKeyDown } from '../actions/onGlobalKeyDown'
    import CloseIcon from './icons/close.svelte'
	import type Attachment from '../post/Attachment'
    import { onOutsideClick } from '../actions/onOutsideClick'
    import { scale, fly } from 'svelte/transition'

	let {
		attachment = $bindable(),
    }: {
		attachment: Attachment | undefined,
    } = $props()
</script>
<div use:portal
     use:documentScrollLock
     use:onGlobalKeyDown={(e) => {
         if(e.key === 'Escape') {
             attachment = undefined
         }
     }}
     transition:fly
     class="bg-black/20 backdrop-blur-[1px] fixed top-0 bottom-0 left-0 right-0 flex flex-col space-y-2 items-center justify-center">
    <div>
        <div class="relative self-end">
            <button
                onclick={(e) => {
                    e.preventDefault()

                    attachment = undefined
                }}
                class="flex size-5 translate-x-1/2 absolute bottom-5 -right-8 bg-black/20 text-white
                    hover:text-zinc-100 hover:bg-black/10 active:scale-90
                    transition-all cursor-pointer box-content p-2 rounded-full"
            ><CloseIcon/></button>
        </div>
        <img
            use:onOutsideClick={() => attachment = undefined}
            transition:scale
            src={attachment.source} alt=""
            class="object-cover will-change-transform active:scale-95 transition-all duration-300 rounded-xl shadow-lg bg-white min-h-72 max-h-112"
        >
    </div>
</div>
