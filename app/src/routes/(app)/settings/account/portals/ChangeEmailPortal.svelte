<script lang="ts">
    import { portal } from 'svelte-portal'
    import { fly, scale, slide } from 'svelte/transition'
	import FormTextInput from '$lib/modals/FormTextInput.svelte'
	import EmailIcon from '$lib/icons/email.svelte'
	import PasswordIcon from '$lib/icons/password.svelte'
    import { onOutsideClick } from '../../../../../actions/onOutsideClick'
    import { onGlobalKeyDown } from '../../../../../actions/onGlobalKeyDown'

	let {
		open = $bindable(),
	}: {
		open: boolean,
    } = $props()

    let currentEmail = $state('')
    let newEmail = $state('')
    let currentPassword = $state('')
    let awaitingForResponse = $state(false)

    function onCancelButtonClick() {
        open = false
    }

	function onChangeButtonClick() {
		const formData = new FormData()

        formData.set('currentEmail', currentEmail)
        formData.set('newEmail', newEmail)
        formData.set('password', currentPassword)

		fetch('/api/settings/account/email', {
			method: 'POST',
            body: formData,
        }).finally(() => {
			awaitingForResponse = false
        })

        awaitingForResponse = true
    }

	let canChange = $derived(
		currentEmail.length !== 0 &&
        newEmail.length !== 0 &&
        currentPassword.length !== 0 &&
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
                    <span class="flex size-5"><EmailIcon/></span>
                </div>
                <p class="font-semibold text-sm">Changing e-mail</p>
            </div>
            <FormTextInput label="Current e-mail" placeholder="Your current e-mail" icon={EmailIcon} bind:value={currentEmail} type="email" />
            <FormTextInput label="Current e-mail" placeholder="Your new e-mail" icon={EmailIcon} bind:value={newEmail} type="email" />
            <FormTextInput label="Current password" placeholder="Your password" icon={PasswordIcon} bind:value={currentPassword} type="password" />
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
                class="bg-[#4d7ded] hover:bg-[#5d8dfd] disabled:bg-zinc-300 text-white"
                disabled={!canChange}
            >
                Change
            </button>
        </div>
    </div>
</div>
