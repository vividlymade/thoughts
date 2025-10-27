<script lang="ts">
    import { portal } from 'svelte-portal'
    import { fly, scale, slide, blur } from 'svelte/transition'
	import BlogIcon from '$lib/icons/blog.svelte'
	import AddCommentIcon from '$lib/icons/add-comment.svelte'
	import UserFollowIcon from '$lib/icons/user--follow.svelte'
	import WarningIcon from '$lib/icons/warning--alt--filled.svelte'
	import FormTextInput from '$lib/modals/FormTextInput.svelte'
	import PasswordIcon from '$lib/icons/password.svelte'
    import { onOutsideClick } from '../../../../../actions/onOutsideClick'
    import { onGlobalKeyDown } from '../../../../../actions/onGlobalKeyDown'

	let {
		open = $bindable(),
	}: {
		open: boolean,
    } = $props()

    let currentPasswordValue = $state('')
    let newPasswordValue = $state('')
    let newPasswordConfirmValue = $state('')
    let awaitingForResponse = $state(false)

    function onCancelButtonClick() {
        open = false
    }

	function onChangeButtonClick() {
		fetch('/api/settings/account/password', {
			method: 'POST',
        }).finally(() => {
			awaitingForResponse = false
        })

        awaitingForResponse = true
    }

	let canChange = $derived(
		currentPasswordValue.length !== 0 &&
        newPasswordValue.length !== 0 &&
        newPasswordConfirmValue === newPasswordValue &&
        !awaitingForResponse
    )
</script>

<div
    use:portal
    use:onGlobalKeyDown={(e) => {
		if(e.key === 'Escape') {
            open = false
        }
    }}
    in:fly={{ duration: 800 }} out:fly
    class="fixed top-0 left-0 right-0 bottom-0 bg-black/45 backdrop-blur-[1.5px] flex items-center justify-center"
>
    <div in:slide={{ duration: 500 }} out:scale={{ duration: 250 }}
         use:onOutsideClick={() => open = false}
        class="flex flex-col bg-white w-md rounded-3xl p-8 text-xs text-zinc-600 select-none items-center space-y-6 will-change-transform"
    >
        <div class="flex flex-col space-y-5 w-full">
            <div class="flex space-x-3 self-center items-center text-black">
                <div class="flex items-center justify-center">
                    <span class="flex size-5"><PasswordIcon/></span>
                </div>
                <p class="font-semibold text-sm">Changing password</p>
            </div>
            <FormTextInput label="Current password" placeholder="Your current password" icon={PasswordIcon} bind:value={currentPasswordValue} type="password" />
            <FormTextInput label="New password" placeholder="Your new password" icon={PasswordIcon} bind:value={newPasswordValue} type="password" />
            <FormTextInput label="Repeat new password" placeholder="Your new password (repeat)" icon={PasswordIcon} bind:value={newPasswordConfirmValue} type="password" />
            {#if canChange}
                <p transition:slide class="font-extralight mt-2 self-center">Make sure to remember your new password!</p>
            {/if}
        </div>

        <div class="space-x-3.5 font-normal text-[11px]
                *:p-4 *:rounded-full *:shadow-lg *:not-disabled:cursor-pointer *:min-w-16 *:transition-all *:not-disabled:active:scale-95 *:will-change-transform"
        >
            <button
                onclick={onCancelButtonClick}
                class="bg-white hover:bg-zinc-200 "
                disabled={awaitingForResponse}
            >
                Cancel
            </button>
            <button
                onclick={onChangeButtonClick}
                class="bg-[#4d7ded] hover:bg-blue-400 disabled:bg-zinc-300 text-white"
                disabled={!canChange}
            >
                Change
            </button>
        </div>
    </div>
</div>
