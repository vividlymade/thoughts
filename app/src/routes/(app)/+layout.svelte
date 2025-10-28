<script lang="ts">
	import TopBar from '$lib/TopBar.svelte'
	import { onMount, untrack } from 'svelte'
	import realtimeClient from '$lib/realtime/realtimeClient'
	import notifications, { Notification } from '$lib/notifications.svelte'
	import settings from '$lib/settings.svelte'

    let { children, data } = $props()

    $effect.pre(() => {
		untrack(() => {
			if (data.notifications) {
				/** Loads initial notifications. */
				for (const notification of data.notifications) {
					notifications.list.push(
						new Notification(
							notification.id,
							notification.title,
							notification.content,
							notification.time,
							notification.isRead,
						)
					)
				}
			}

			if(data.enabledNotificationSounds) {
				settings.notificationSoundEnabled = data.enabledNotificationSounds
            }
		})
	})

    onMount(() => {
		realtimeClient.connect()
    })
</script>

<TopBar localUserId={data.localUserId} localUserHandle={data.localUserHandle} localUserName={data.localUserName} />
{@render children()}
