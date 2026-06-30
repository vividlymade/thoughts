<script lang="ts">
import TrashCanIcon from '$lib/icons/trash-can.svelte'
import AccountRemovalPortal from './portals/AccountRemovalPortal.svelte'

let {
	localUserId,
}: {
	localUserId: string,
} = $props()

let isPortalOpen = $state(false)

function onButtonClick() {
    if(isPortalOpen) {
        return
    }

    isPortalOpen = true
}
</script>

<button onclick={onButtonClick} class="cursor-pointer w-fit self-end rounded-full">
    <span class="flex items-center space-x-2 rounded-xl
        bg-red-300 hover:bg-red-400 duration-200 active:scale-95 will-change-transform transition-all text-white
        p-2.5 px-4"
    >
        <span class="size-5"><TrashCanIcon/></span>
        <span class="text-[11px] font-light text-xs">Remove Account</span>
    </span>
</button>

{#if isPortalOpen}
    <AccountRemovalPortal bind:open={isPortalOpen} localUserId={localUserId} />
{/if}
