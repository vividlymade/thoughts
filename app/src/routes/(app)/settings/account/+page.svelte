<script lang="ts">
	import AccountRemovalButton from './AccountRemovalButton.svelte'
	import ChangePasswordButton from './ChangePasswordButton.svelte'
	import ChangeEmailButton from './ChangeEmailButton.svelte'

    let { data } = $props()

    const localUserId = $derived(data.localUserId)!
</script>
<div class="flex-1 flex flex-col justify-between space-y-6">
    <div class="text-xs font-extralight *:rounded-2xl *:p-2.5">
        <ChangeEmailButton/>
        <ChangePasswordButton/>
    </div>
    <AccountRemovalButton localUserId={localUserId} />
</div>
