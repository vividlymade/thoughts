<script lang="ts">
	import NextButton from '$lib/NextButton.svelte'
	import { goto } from '$app/navigation'
	import LoginIcon from '$lib/icons/login.svelte'
	import CenteredFormModal from '$lib/modals/CenteredFormModal.svelte'
	import FormTextInput from '$lib/modals/FormTextInput.svelte'
    import PasswordIcon from '$lib/icons/password.svelte'
    import UserIcon from '$lib/icons/user.svelte'
    import IdentificationIcon from '$lib/icons/identification.svelte'
	import AppConsts from '../../AppConsts'
	import FormField from './FormField'

    let { data, form } = $props()

    let handle = $state('')
    let name = $state('')
    let password = $state('')
    let passwordConfirm = $state('')

    let awaitingForResponse = $state(false)
</script>

<div class="flex-1 flex flex-col justify-center items-center w-full h-full space-y-20 select-none">
    <div class="w-120">
        <CenteredFormModal
            enhance={({ formElement, formData, action, cancel, submitter }) => {
                awaitingForResponse = true

                return async ({ result, update }) => {
                    awaitingForResponse = false

                    if (result.type === 'redirect') {
                        await goto(result.location)
                    }

                    await update()
                }
            }}
            headerIcon={LoginIcon}
            headerText="Signing up"
        >
            <div class="space-y-2">
                <p class="font-extralight text-zinc-600 mt-2">{data.email}</p>
                <hr class="text-zinc-200 w-full">
            </div>
            <FormTextInput
                label="Handle"
                icon={IdentificationIcon}
                name={FormField.HANDLE}
                type="text"
                placeholder="Your unique name on the platform" bind:value={handle}
                minLength={AppConsts.MIN_ALLOWED_HANDLE_LENGTH}
                maxLength={AppConsts.MAX_ALLOWED_HANDLE_LENGTH}
            />
            <FormTextInput
                label="Name"
                icon={UserIcon}
                name={FormField.NAME}
                type="text"
                placeholder="Your display name on the platform"
                bind:value={name}
                minLength={AppConsts.MIN_ALLOWED_NAME_LENGTH}
                maxLength={AppConsts.MAX_ALLOWED_NAME_LENGTH}
            />
            <FormTextInput
                label="Password"
                icon={PasswordIcon}
                name={FormField.PASSWORD}
                type="password"
                autocomplete="new-password"
                placeholder="Password – (at least {AppConsts.MIN_PASSWORD_LENGTH} up to {AppConsts.MAX_PASSWORD_LENGTH} characters length)"
                bind:value={password}
                minLength={AppConsts.MIN_PASSWORD_LENGTH}
                maxLength={AppConsts.MAX_PASSWORD_LENGTH}
            />
            <FormTextInput
                label="Repeat password"
                icon={PasswordIcon}
                name={FormField.PASSWORD_CONFIRM}
                type="password"
                autocomplete="new-password"
                placeholder="Repeat the password again"
                bind:value={passwordConfirm}
                minLength={AppConsts.MIN_PASSWORD_LENGTH}
                maxLength={AppConsts.MAX_PASSWORD_LENGTH}
            />

            <p class="text-red-300 text-xs py-1 font-extralight {!form?.error && 'invisible'}">{#if form?.error}{form.error.message}{/if}</p>

            <NextButton isLoading={awaitingForResponse} />
        </CenteredFormModal>
    </div>
</div>
