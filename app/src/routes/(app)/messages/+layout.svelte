<script lang="ts">
	import SearchIcon from '$lib/icons/search.svelte'
	import AddNewConversationButton from './AddNewConversationButton.svelte'
	import AppConsts from '../../../AppConsts'
	import { untrack } from 'svelte'
	import { Channel, ChannelContext, DirectChannel } from './Channel.svelte'
	import chat from '$lib/chat.svelte'
    import { slide } from 'svelte/transition'
	import ConversationListEntry from './ConversationListEntry.svelte'

	let { data, children } = $props()

	$effect.pre(() => {
		untrack(() => {
			if (!chat.hasBeenInitialized) {
				for (const conversation of data.conversations.entries) {
					chat.contexts.push(
						new ChannelContext(
							new DirectChannel(
								conversation.id,
								`/api/users/${conversation.userId || data.localUserId}/avatar`,
								conversation.userHandle || data.localUserHandle!,
								conversation.userName || data.localUserName,
								conversation.latestMessageTime,
								conversation.latestMessageContent,
								conversation.isUnread || false,
								false,
								false,
							),
						)
					)
				}

				chat.hasBeenInitialized = true
			}
		})
	})

    let conversationsSearchValue = $state("")

	let currentChannelContext = $state(chat.contexts[0])

	function onCurrentUserFollowButtonClick() {
		const userId = currentChannelContext.channel.id

		fetch(`/api/users/${userId}/follow`, {
			method: 'POST',
		})
	}

	let canSend = $state(false)
</script>

<svelte:head>
    <title>{AppConsts.PROJECT_NAME} – Messages</title>
</svelte:head>

<div class="flex space-x-16 mx-16 my-16 flex-1">
    <div class="flex-4 max-w-md min-w-76 flex flex-col space-y-5 mt-10">
        <div class="flex bg-white/80 backdrop-blur-xs rounded-2xl items-center p-3 space-x-2 text-[#b1b1b1]"
             style="box-shadow: 0px 2px 8px rgba(0,0,0,0.08);"
        >
            <label class="size-5 translate-y-[1.25px]" for="search">
                <SearchIcon/>
            </label>
            <input
                id="search"
                placeholder="Search..."
                class="text-xs font-light w-full outline-none placeholder:text-[#b1b1b1] placeholder:select-none text-[#000000]"
                bind:value={conversationsSearchValue}
            >
        </div>
        <div class="p-2 pl-0 bg-white rounded-3xl" style="box-shadow: 0px 2px 18px rgba(0,0,0,0.08);">
            <div class="flex flex-col h-86 p-2 space-y-1 overflow-y-auto">
                {#if conversationsSearchValue.length > 0}
                    <p class="self-center text-xs font-extralight my-5 select-none">Whoops, looks like we couldn't find anything...</p>
                {:else}
                    <div class="flex flex-col text-zinc-400" transition:slide>
                        {#each chat.contexts as channelContext}
                            <ConversationListEntry channelContext={channelContext} currentChannelContext={currentChannelContext} />
                        {/each}
                        {#if chat.contexts.length === 0}
                            <p class="self-center text-xs font-extralight my-5 select-none">Nothing to find here yet...</p>
                        {:else}
                            <p class="self-center text-xs font-extralight my-8 select-none">You've reached the end...</p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
        <AddNewConversationButton/>
    </div>
    <div class="flex-9 flex flex-col bg-white rounded-3xl"
         style="box-shadow: 0px 2px 15px rgba(0,0,0,0.08);"
    >
        {@render children()}
    </div>
</div>

<style lang="postcss">
    @import '../../../shared.pcss';
</style>
