<script lang="ts">
	import CenteredFormModal from '$lib/modals/CenteredFormModal.svelte'
    import LoginIcon from '$lib/icons/login.svelte'
	import NextButton from '$lib/NextButton.svelte'
    import UserAvatarIcon from '$lib/icons/user--avatar.svelte'
	import AppConsts from '../../../AppConsts'
	import Cropper, { type CropArea, type OnCropComplete } from 'svelte-easy-crop'
    import CheckmarkIcon from '$lib/icons/checkmark.svelte'
    import { fade, scale } from 'svelte/transition'
    import { expoOut } from 'svelte/easing'

    /** Cubic‑bezier implementation (adapted based on the MDN polyfill). */
	const ease = (t: number) => {
		const cx = 3 * 0.25
		const bx = 3 * (0.25 - 0.25)
		const ax = 1 - cx - bx

		const cy = 3 * 0.1
		const by = 3 * (0.25 - 0.1)
		const ay = 1 - cy - by

		let x = t

		for (let i = 0; i < 5; i++) {
			const fx = ((ax * x + bx) * x + cx) * x - t
			const dfx = (3 * ax * x + 2 * bx) * x + cx

			if (Math.abs(fx) < 1e-6) break

            x -= fx / dfx
		}

		return ((ay * x + by) * x + cy) * x
	}

	let showAvatarEditor = $state(false)
    let avatarEditorSourceUrl: string | undefined = $state()
    let currentAvatar: Blob | undefined
    let avatarPreviewUrl: string | undefined = $state()
    let crop = $state({ x: 0, y: 0 })
    let zoom = $state(1)

    function onAvatarFileChange(event: Event) {
		const target = event.target as HTMLInputElement
        const file = target.files?.[0]

        if(!file) {
			return
        }

        if(file.size > AppConsts.MAX_ALLOWED_AVATAR_SIZE) {
            return
        }

        /** A new object URL. */
        const newRawAvatarUrl = URL.createObjectURL(file)

        avatarEditorSourceUrl = newRawAvatarUrl
        showAvatarEditor = true
    }

	let pixelsCrop: CropArea

	const onCropComplete: OnCropComplete = async (event) => {
		pixelsCrop = event.pixels
    }

	let avatarInputElement: HTMLInputElement

    async function replaceImage(fileInput: HTMLInputElement, newImageBlob: Blob) {
        const newFile = new File([newImageBlob], '')

        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(newFile)
        fileInput.files = dataTransfer.files

        return newFile
    }

	async function onCropAccept() {
		const img = new Image()
		img.src = avatarEditorSourceUrl!

		/** Resolves the image. */
        await img.decode()

        const canvas = new OffscreenCanvas(pixelsCrop.width, pixelsCrop.height)
        const ctx = canvas.getContext('2d')

        if(!ctx) {
			return
        }

        ctx.drawImage(
            img,
            pixelsCrop.x, pixelsCrop.y, pixelsCrop.width, pixelsCrop.height,
            0, 0, pixelsCrop.width, pixelsCrop.height,
        )

        URL.revokeObjectURL(avatarPreviewUrl!)
        currentAvatar = await canvas.convertToBlob()
        avatarPreviewUrl = URL.createObjectURL(currentAvatar)

        await replaceImage(avatarInputElement, currentAvatar)

        showAvatarEditor = false
    }

	function onCropAcceptButtonMount(button: HTMLButtonElement) {
        const handleKeyPress = (e: KeyboardEvent) => {
            if(e.key === 'Enter') {
                button.click()
            }
        }

        document.body.addEventListener('keypress', handleKeyPress)

        return {
            destroy() {
                document.body.removeEventListener('keypress', handleKeyPress)
            }
        }
    }
</script>

{#if showAvatarEditor}
<div out:fade={{duration: 300, easing: ease }} class="overflow-hidden fixed w-full h-full transition-all z-1000 {!showAvatarEditor ? 'reverse invisible' : 'fade-in'}">
    <p class="absolute text-white z-200 font-thin place-self-center top-1/8 bg-black/30 p-3 rounded-xl text-sm">Cropping profile picture...</p>
    <div class="w-full h-full
        [&>div>div]:text-black/60!
        [&>div>img]:rounded-2xl!
        [&>div]:transition-all
        [&>div]:cursor-default! [&>div>*]:cursor-grab! [&>div>*]:active:cursor-grabbing!"
    >
        <Cropper
            image={avatarEditorSourceUrl}
            cropShape="round"
            aspect={1}
            showGrid={false}
            cropSize={{ width: 300, height: 300 }}
            bind:zoom
            bind:crop
            oncropcomplete={onCropComplete}
        />
    </div>
    <button use:onCropAcceptButtonMount onclick={onCropAccept} class="button absolute bottom-1/6 place-self-center
        left-0 right-0 size-11 bg-[#4071E4] hover:bg-[#5081D4] p-2 rounded-full z-200"
    >
        <CheckmarkIcon/>
    </button>
</div>
{/if}

<svelte:head>
    <title>Welcome on {AppConsts.PROJECT_NAME}!</title>
</svelte:head>

<div class="flex flex-col flex-1 justify-center self-center">
    <div class="w-140 flex flex-col">
        <!-- Spacer. -->
        <div class="basis-2/7 flex-none"></div>
        <!-- TODO: Refactor one form into two separate ones.
            To not send any other data unnecessarily when continuing without the avatar.  -->
        <CenteredFormModal headerIcon={LoginIcon} headerText="Welcome on {AppConsts.PROJECT_NAME}!" enhance={() => {}} enctype="multipart/form-data">
            <div class="flex flex-col items-center space-y-10 mt-5 w-full">
                <div class="flex flex-col items-center space-y-6">
                    <p class="text-[#C8C8C8] text-sm font-extralight select-none">Pick your avatar from your device</p>
                    <label class="rounded-full border-4 bg-white box-border hover:border-solid {avatarPreviewUrl && 'border-[#5081F4]'} hover:border-[#4071E4] transition-all size-24 block cursor-pointer active:scale-90 will-change-transform duration-250 select-none">
                        <input name="avatar" type="file" accept="image/*" bind:this={avatarInputElement} onchange={onAvatarFileChange} class="hidden" />
                        {#if avatarPreviewUrl}
                            {#key avatarPreviewUrl}
                                <img in:scale|global={{ duration: 1000, easing: expoOut }} out:scale={{ duration: 0 }} src={avatarPreviewUrl} alt="Avatar" draggable="false" class="size-full absolute rounded-full duration-1000 box-border block will-change-auto" />
                                <span in:scale|global={{ duration: 400, easing: expoOut }} out:scale={{ duration: 0 }} class="block text-white absolute bottom-0 right-0 size-6 bg-green-500 border-2 border-white rounded-full will-change-auto">
                                    <CheckmarkIcon/>
                                </span>
                            {/key}
                        {/if}
                        {#if !avatarPreviewUrl}
                            <span class="block p-5 ">
                                <UserAvatarIcon/>
                            </span>
                        {/if}
                    </label>
                </div>

                <div class="flex justify-between w-full">
                    <button name="action" value="continueWithout"
                        class="cursor-pointer text-xs font-light text-[#757575] hover:text-[#B5B5B5] active:scale-90 transition-transform will-change-transform"
                    >
                        Continue without
                    </button>
                    <NextButton/>
                </div>
            </div>
        </CenteredFormModal>
        <!-- Spacer. -->
        <div class="basis-20 flex-none"></div>
    </div>
</div>
<style lang="postcss">
    @import '../../../shared.pcss';

    @keyframes fade-in {
        0% {
            opacity: 0;
            visibility: hidden;
        }
        100% {
            opacity: 1;
            visibility: visible;
        }
    }

    .fade-in {
        animation: fade-in 0.6s forwards;
    }

    .reverse {
        animation-direction: reverse;
    }
</style>
