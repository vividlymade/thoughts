<script lang="ts">
    import iconSrc from '$lib/images/icon.svg'
    import { slide, scale } from 'svelte/transition'
	import AddNewConversationPortal from './AddNewConversationPortal.svelte'
    import UserFollowIcon from '$lib/icons/user--follow.svelte'

    let show = $state(false)

    let showAddNewConversationModal = $state(false)

    $effect(() => {
		show = true
    })
</script>

{#if show}
    <div transition:slide={{ duration: 800 }}
         class="flex flex-col h-full select-none will-change-transform"
    >
        <!-- Animation wrapper. -->
        <div transition:scale={{ duration: 1000 }}
             class="place-content-center items-center justify-items-center flex flex-col space-y-12 w-full h-full"
        >
            <img
                src={iconSrc} alt="Icon" draggable="false"
                class="h-9 drop-shadow-sm/15 hover:scale-115 transition-all duration-500"
            >
            <p class="text-[#373737] text-lg font-extralight drop-shadow-sm/15">
                Hey, it looks like you haven't texted anyone yet!
            </p>
            <p class="text-[#979797] text-sm font-extralight drop-shadow-sm/15">
                You can start at any moment...
            </p>
            <button
                onclick={() => showAddNewConversationModal = true}
                class="flex p-3 px-5 text-xs items-center space-x-3 bg-[#4C86FF] rounded-2xl font-extralight cursor-pointer hover:bg-[#5C96FF] active:scale-90 will-change-transform transition-all duration-200"
            >
                <span class="flex size-4"><UserFollowIcon/></span>
                <span>Start texting now!</span>
            </button>
        </div>
    </div>
{/if}

{#if showAddNewConversationModal}
    <AddNewConversationPortal bind:open={showAddNewConversationModal} />
{/if}

