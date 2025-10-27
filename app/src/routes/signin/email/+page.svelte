<script lang="ts">
    import LoginIcon from '$lib/icons/login.svelte'
    import EmailIcon from '$lib/icons/email.svelte'
	import logoSrc from '$lib/images/logo.svg'
	import { goto } from '$app/navigation'
	import NextButton from '$lib/NextButton.svelte'
	import CenteredFormModal from '$lib/modals/CenteredFormModal.svelte'
	import FormTextInput from '$lib/modals/FormTextInput.svelte'
	import AppConsts from '../../../AppConsts'

    let awaitingForResponse = false
</script>

<svelte:head>
    <title>{AppConsts.PROJECT_NAME} – Sign in or Sign up</title>
</svelte:head>

<div class="flex-1 flex flex-col justify-center w-120 h-full space-y-20 self-center">
    <a href="/#" class="absolute place-self-center z-10 inset-x-0 top-0 bottom-1/2 mx-auto">
        <img src={logoSrc} width="164" class="ml-5 drop-shadow-lg/1" alt="Logo" draggable="false">
    </a>
    <CenteredFormModal enhance={({ formElement, formData, action, cancel, submitter }) => {
			awaitingForResponse = true

            return async ({ result, update }) => {
                awaitingForResponse = false

                if (result.type === 'redirect') {
					await goto(result.location)
                }
			}
        }}
        headerIcon={LoginIcon}
        headerText="Sign in or Sign up"
    >
        <div class="mt-3 w-96">
            <FormTextInput label="E-mail" icon={EmailIcon} name="email" type="email" placeholder="Type in the e-mail" />
        </div>

        <NextButton isLoading={awaitingForResponse} />
    </CenteredFormModal>
</div>

<style lang="postcss">
    @import '../../../shared.pcss';
</style>
