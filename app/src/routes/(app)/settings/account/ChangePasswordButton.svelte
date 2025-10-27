<script lang="ts">
    import PasswordIcon from '$lib/icons/password.svelte'
    import ChangePasswordPortal from './portals/ChangePasswordPortal.svelte'
	import SettingsButton from './SettingsButton.svelte'

	let isPortalOpen = $state(false)

    function onClick() {
		if(isPortalOpen) {
			return
        }

        isPortalOpen = true
    }
</script>

<SettingsButton label="Change password" onClick={onClick} icon={PasswordIcon} />

{#if isPortalOpen}
    <ChangePasswordPortal bind:open={isPortalOpen} />
{/if}
