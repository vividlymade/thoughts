<script lang="ts">
	import NotificationNewIcon from '$lib/icons/notification--new.svelte'
	import NotificationIcon from '$lib/icons/notification.svelte'
	import NotificationsModal from '$lib/topBar/NotificationsModal.svelte'
    import { tick } from 'svelte'
	import notifications from '$lib/notifications.svelte'

	let showNotificationsModal = $state(false)
    let hasUnreadNotifications = $derived(notifications.list.findIndex((entry) => !entry.isRead) !== -1)
    let shakeIcon = $state(false)

	function toggleNotificationsModal() {
		showNotificationsModal = !showNotificationsModal
	}

	$effect(() => {
		// if(hasUnreadNotifications && showNotificationsModal) {
		// 	hasUnreadNotifications = false
		// }
    })

    // onNotificationReceived={async () => {
    //     if(shakeIcon) {
    //         shakeIcon = false
    //     }
    //
    //     await tick()
    //
    //     shakeIcon = true
    // }}
</script>

<div class="flex relative">
    <button onclick={toggleNotificationsModal}
        class="cursor-pointer size-6 button active:scale-90 drop-shadow-xs text-[#A8A8A8] hover:text-[#686868] transition-all"
        class:active={shakeIcon}
    >
        {#if hasUnreadNotifications}
            <NotificationNewIcon/>
        {:else}
            <NotificationIcon/>
        {/if}
    </button>
    {#if showNotificationsModal}
        <NotificationsModal
            bind:show={showNotificationsModal}
            bind:hasUnreadNotifications
        />
    {/if}
</div>

<style lang="postcss">
    @keyframes rotation-shake {
        0%, 100% {
            transform: rotate(0deg);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: rotate(-20deg);
        }
        20%, 40%, 60%, 80% {
            transform: rotate(20deg);
        }
    }

    @keyframes zoom-in {
        20% {
            scale: 1.25;
        }
        40% {
            scale: 1;
        }
    }

    .active {
        animation: rotation-shake 0.2s ease-in-out, zoom-in 0.8s ease;
        transform-origin: center center;
    }
</style>
