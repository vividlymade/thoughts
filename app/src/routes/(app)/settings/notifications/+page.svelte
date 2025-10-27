<script>
    import SwitchOption from '$lib/settings/SwitchOption.svelte'
	import settings from '$lib/settings.svelte'

    let { data } = $props()

    let enabledSounds = $derived(data.settings.notifications.enabledNotificationSounds || false)

    let awaitingForResponse = $state(false)
</script>

<ul>
    <SwitchOption
        name="Sound"
        description="Plays sound on your device when you receive a notification."
        bind:checked={enabledSounds}
        onChange={() => {
			if(enabledSounds) {
                fetch('/api/settings/notifications/sound/enable', {
                    method: 'POST',
                }).then((response) => {
                    if(response.ok) {
                        settings.notificationSoundEnabled = enabledSounds = true
                    }
                }).finally(() => {
                    awaitingForResponse = false
                })

                awaitingForResponse = true
            } else {
                fetch('/api/settings/notifications/sound/disable', {
                    method: 'POST',
                }).then((response) => {
                    if(response.ok) {
                        settings.notificationSoundEnabled = enabledSounds = false
                    }
                }).finally(() => {
                    awaitingForResponse = false
                })

                awaitingForResponse = true
            }
        }}
        disabled={awaitingForResponse}
    />
</ul>

<style>
    ul {
        display: flex;
        flex-direction: column;
    }
</style>
