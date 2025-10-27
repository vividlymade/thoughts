<script lang="ts">
    import PasswordIcon from '$lib/icons/password.svelte'
	import logoSrc from '$lib/images/logo.svg'
	import { goto } from '$app/navigation'
	import NextButton from '$lib/NextButton.svelte'
	import CenteredFormModal from '$lib/modals/CenteredFormModal.svelte'
	import FormTextInput from '$lib/modals/FormTextInput.svelte'
	import AppConsts from '../../../AppConsts'
	import HTTPCode from '../../../HTTPCode'

    let awaitingForResponse = false
    let showError = $state(false)
</script>

<svelte:head>
    <title>{AppConsts.PROJECT_NAME} – Sign in</title>
</svelte:head>

<div class="flex-1 flex flex-col justify-center w-120 h-full space-y-20 self-center">
    <a href="/#" class="absolute place-self-center z-10 inset-x-0 top-0 bottom-1/2 mx-auto">
        <img src={logoSrc} width="164" class="ml-5 drop-shadow-lg/1" alt="Logo" draggable="false">
    </a>
    <CenteredFormModal enhance={({ formElement, formData, action, cancel, submitter }) => {
			awaitingForResponse = true

            return async ({ result, update }) => {
                awaitingForResponse = false

                switch(result.type) {
					case 'failure': {
						if(result.status === HTTPCode.UNAUTHORIZED) {
							showError = true
						}

					    break
					}
					case 'redirect': {
					    await goto(result.location)

					    break
					}
                }
			}
        }}
        headerIcon={PasswordIcon}
        headerText="Sign in"
    >
        <div class="mt-3 w-92">
            <input autocomplete="email" type="email" hidden />
            <FormTextInput label="Password" icon={PasswordIcon} name="password" type="password" autocomplete="current-password" placeholder="Type in your password" />
        </div>

        <p class="text-red-300 text-xs py-1 font-extralight {!showError && 'invisible'}">{#if showError}Incorrect password...{/if}</p>

        <NextButton isLoading={awaitingForResponse} />
    </CenteredFormModal>
</div>

<style lang="postcss">
    @import '../../../shared.pcss';
</style>
