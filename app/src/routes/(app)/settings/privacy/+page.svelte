<script lang="ts">
    import CheckboxOption from '$lib/settings/SwitchOption.svelte'

    let { data } = $props()

    let allowMessagesFromEveryone = $derived(data.settings.privacy.allowMessagesFromEveryone || false)
	let keepAccountPrivate = $state(data.settings.privacy.keepAccountPrivate || false)

    let blockedAccounts = $state([])

    let awaitingForResponse = $state(false)
</script>

<ul class="space-y-5">
    <li>
        <CheckboxOption
            name="Allow messages from everyone"
            description="When this option is enabled anyone can message you. Otherwise only the people you follow can message you."
            bind:checked={allowMessagesFromEveryone}
            disabled={awaitingForResponse}
            onChange={() => {
				const baseUrl = '/api/settings/privacy/allowMessagesFromEveryone'

				if(allowMessagesFromEveryone) {
                    fetch(`${baseUrl}/enable`, {
                        method: 'POST',
                    }).then((response) => {
                        if(response.ok) {
                            allowMessagesFromEveryone = true
                        }
                    }).finally(() => {
                        awaitingForResponse = false
                    })

                    awaitingForResponse = true
                } else {
                    fetch(`${baseUrl}/disable`, {
                        method: 'POST',
                    }).then((response) => {
                        if(response.ok) {
                            allowMessagesFromEveryone = false
                        }
                    }).finally(() => {
                        awaitingForResponse = false
                    })

                    awaitingForResponse = true
                }
            }}
        />
    </li>
    <li>
        <CheckboxOption
            name="Keep the account private"
            description="No one can see your profile's content unless you're following them."
            bind:checked={keepAccountPrivate}
            disabled={awaitingForResponse}
            onChange={() => {
				const baseUrl = '/api/settings/privacy/keepAccountPrivate'

				if(keepAccountPrivate) {
                    fetch(`${baseUrl}/enable`, {
                        method: 'POST',
                    }).then((response) => {
                        if(response.ok) {
                            keepAccountPrivate = true
                        }
                    }).finally(() => {
                        awaitingForResponse = false
                    })

                    awaitingForResponse = true
                } else {
                    fetch(`${baseUrl}/disable`, {
                        method: 'POST',
                    }).then((response) => {
                        if(response.ok) {
                            keepAccountPrivate = false
                        }
                    }).finally(() => {
                        awaitingForResponse = false
                    })

                    awaitingForResponse = true
                }
            }}
        />
    </li>

    <li>
        <h3 class="text-sm">Blocked accounts</h3>
        {#if blockedAccounts.length > 0}
            <ul>
                {#each blockedAccounts as blockedAccount}
                    <li>{blockedAccount.profile.handle}</li>
                {/each}
            </ul>
        {:else}
            <p class="text-xs ml-2 font-light text-zinc-600">There's currently no blocked accounts</p>
        {/if}
    </li>
</ul>