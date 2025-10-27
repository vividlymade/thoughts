<script lang="ts">
    import EmailIcon from '$lib/icons/email.svelte'
    import ChangeEmailPortal from './portals/ChangeEmailPortal.svelte'
	import SettingsButton from './SettingsButton.svelte'

	let isPortalOpen = $state(false)

    function onClick() {
		if(isPortalOpen) {
			return
        }

        isPortalOpen = true
    }
</script>

<SettingsButton label="Change e-mail" onClick={onClick} icon={EmailIcon} />

{#if isPortalOpen}
    <ChangeEmailPortal bind:open={isPortalOpen} />
{/if}
