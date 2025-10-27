<script lang="ts">
    import * as TimeFormatUtils from '../../../utils/TimeFormatUtils.svelte'
	import { Channel, type ChannelContext } from './Channel.svelte'
	import ChannelType from './ChannelType'
    import OverflowMenuHorizontal from '$lib/icons/overflow-menu--vertical.svelte'
    import { slide } from 'svelte/transition'

	let {
		channelContext,
        currentChannelContext,
	}: {
		channelContext: ChannelContext,
		currentChannelContext: ChannelContext,
    } = $props()

    const readableRelativeTime = $derived(TimeFormatUtils.createTimeAgo(channelContext.channel.latestMessageTime!))

    function toggleChannelMoreOptions(event: MouseEvent, channel: Channel) {
		event.stopPropagation()
		event.preventDefault()
	}
</script>

<a href="/messages/{channelContext.channel.id}"
   class="group flex items-center rounded-2xl p-3 py-5 justify-between
    {channelContext.channel.id === currentChannelContext.channel.id ? 'bg-[#E2E2E2]/20' : ''}"
>
    <div class="flex-1 flex items-center space-x-2 h-12 min-w-0">
        <span class="size-1.75 aspect-square transition-all {channelContext.channel.isUnread && 'bg-[#4d7ded]'} rounded-full"></span>
        <img class="rounded-full size-10" src={channelContext.channel.picture} alt=""/>
        <div class="flex-1 flex flex-col select-none min-w-0">
            {#if channelContext.channel.type === ChannelType.DIRECT}
                <div class="flex text-xs place-content-between flex-1 space-y-0.2">
                    <div class="flex space-x-1">
                        <p class="text-[#373737] font-semibold">{channelContext.channel.name}</p>
                        <p class="text-[#B1B1B1]">(@{channelContext.channel.handle})</p>
                    </div>
                    <p class="text-[#B1B1B1] mr-3 font-light">{readableRelativeTime.value}</p>
                </div>
            {/if}
            {#if channelContext.channel.latestMessage === undefined}
                <p class="text-xs font-light text-[#A7A7A7] flex-1">Start messaging right now!</p>
            {:else}
                {#key channelContext.channel.latestMessageTime}
                    <p in:slide={{ axis: 'y', duration: 10000 }} class="text-xs font-light text-[#606060] flex-1 text-ellipsis text-nowrap whitespace-nowrap overflow-hidden">
                        {channelContext.channel.latestMessage}
                    </p>
                {/key}
            {/if}
        </div>
    </div>
    <div>
        <button title="More"
                onclick={(e) => toggleChannelMoreOptions(e, channelContext.channel)}
                class="-translate-x-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute cursor-pointer size-8 p-2 drop-shadow-lg/3 self-end text-[#373737] hover:text-[#A7A7A7] aspect-square bg-white hover:bg-zinc-50 rounded-full"
        >
            <OverflowMenuHorizontal/>
        </button>
    </div>
</a>
