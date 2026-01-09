<script lang="ts">
	import AccountRemovalButton from './AccountRemovalButton.svelte'
	import ChangePasswordButton from './ChangePasswordButton.svelte'
	import ChangeEmailButton from './ChangeEmailButton.svelte'

    let { data } = $props()

    const localUserId = $derived(data.localUserId)!
</script>
<div class="flex-1 flex flex-col justify-between space-y-6">
    <div class="text-xs font-extralight *:rounded-2xl *:p-2.5 bg-white-50 border bg-white border-zinc-100 drop-shadow-sm/3 rounded-2xl overflow-clip">
        <ChangeEmailButton/>
        <ChangePasswordButton/>
    </div>
    <AccountRemovalButton localUserId={localUserId} />
</div>
