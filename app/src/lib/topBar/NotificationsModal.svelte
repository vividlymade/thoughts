<script lang="ts">
    import NotificationIcon from '$lib/icons/notification.svelte'
    import { scale, fly, draw, fade, crossfade, slide } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import { onOutsideClick } from '../../actions/onOutsideClick'
    import * as TimeFormatUtils from '../../utils/TimeFormatUtils.svelte'
	import AppConsts from '../../AppConsts'
	import iconSrc from '$lib/images/icon.svg'
	import notifications, { Notification } from '$lib/notifications.svelte'

	let {
		show = $bindable(),
        hasUnreadNotifications = $bindable(),
	}: {
		show: boolean,
        hasUnreadNotifications: boolean,
	} = $props()

    // function markNotificationAsRead() {
	// 	fetch('/api/notifications/read').then(res => res.json())
    // }

    // function loadMore() {
	// 	fetch('/api/notifications')
    // }
</script>

<div
    use:onOutsideClick={() => show = false}
    transition:fly={{ x: 400, duration: 800 }} style="box-shadow: 0px 4px 25px rgba(0,0,0,0.02);"
        class="absolute flex flex-col justify-center text-[#c1c1c1] bg-white/95 rounded-3xl p-2 w-96 text-xs z-100 select-none translate-y-15 -translate-x-4/5 space-y-1"
>
    <div class="self-center justify-self-center font-light pt-2 flex items-center space-x-2">
        <span class="block size-5"><NotificationIcon/></span>
        <p>Notifications</p>
    </div>
    <hr class="text-zinc-100 w-5 self-center">
    <div class="flex flex-col max-h-48 overflow-y-auto">
        <div class="flex flex-col">
            {#each notifications.list as notification(notification.id)}
                {@const timeAgo = TimeFormatUtils.createTimeAgo(notification.time)}
                <button
                    animate:flip transition:slide
                    onclick={() => {
						fetch(`/api/notifications/${notification.id}`, {
							method: 'PATCH',
						})

						notification.isRead = true
                    }}
                    class="group flex p-4 cursor-pointer active:scale-99 will-change-transform rounded-2xl hover:bg-zinc-100/70 transition-all"
                >
                    <!-- Note: This container can be used for future transitions. -->
                    <span class="flex space-x-5 will-change-transform flex-1">
                        <span class="flex self-center">
                            <img
                                src={iconSrc} alt="Icon" draggable="false"
                                class="w-7 drop-shadow-sm/15 group-hover:scale-105 transition-all duration-500"
                            >
                        </span>
                        <span class="flex flex-col flex-1">
                            <span class="flex w-full justify-between">
                                <span class="flex items-center space-x-1.5">
                                    {#if !notification.isRead}
                                        <span transition:slide|global={{ axis: 'x' }}
                                              class="block bg-[#ff6363] size-1.25 rounded-full"
                                        ></span>
                                    {/if}
                                    <span class="block text-[#000000] font-light">{notification.title}</span>
                                </span>
                                <span class="block text-[11px] font-extralight">{timeAgo.value}</span>
                            </span>
                            <span class="block text-left font-light">{notification.content}</span>
                        </span>
                    </span>
                </button>
            {:else}
                <p
                    class="font-light self-center my-8 text-zinc-300"
                >It looks quite empty in here!</p>
            {/each}
        </div>
    </div>
</div>
