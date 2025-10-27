<script lang="ts">
    import AddIcon from '$lib/icons/add.svelte'
	import AddNewConversationPortal from './AddNewConversationPortal.svelte'

    let isPortalOpen = $state(false)

    function onClick() {
		if(isPortalOpen) {
			return
        }

        isPortalOpen = true
    }
</script>

<button onclick={onClick} title="Add new"
    class="self-end mr-5 bg-white rounded-full p-2 cursor-pointer hover:bg-zinc-100 transition-all active:scale-90 will-change-transform"
    style="box-shadow: 0px 2px 4px rgba(0,0,0,0.08);"
>
    <span class="block size-6 text-[#4DB2FF]">
        <AddIcon/>
    </span>
</button>

{#if isPortalOpen}
    <AddNewConversationPortal bind:open={isPortalOpen} />
{/if}
