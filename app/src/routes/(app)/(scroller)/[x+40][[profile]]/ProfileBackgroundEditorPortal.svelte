<script lang="ts">
    import { portal } from 'svelte-portal'
	import Cropper, { type CropArea, type OnCropComplete } from 'svelte-easy-crop'
    import { documentScrollLock } from '../../../../actions/documentScrollLock'
    import { fly } from 'svelte/transition'

    let {
		sourceUrl,
    }: {
		sourceUrl: string,
    } = $props()

    let currentImage: Blob | undefined

    let crop = $state({ x: 0, y: 0 })
    let zoom = $state(1)

    let pixelsCrop: CropArea

	const onCropComplete: OnCropComplete = async (event) => {
		pixelsCrop = event.pixels
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
        currentImage = await canvas.convertToBlob()
        avatarPreviewUrl = URL.createObjectURL(currentImage)

        await replaceImage(avatarInputElement, currentImage)

        showAvatarEditor = false
    }
</script>

<div
    use:portal
    use:documentScrollLock
    transition:fly
    class="bg-black/20 backdrop-blur-[1px] fixed top-0 bottom-0 left-0 right-0 flex flex-col space-y-2 items-center justify-center">
>
    <Cropper
        image={sourceUrl}
        cropShape="round"
        aspect={1}
        showGrid={false}
        bind:zoom
        bind:crop
        oncropcomplete={onCropComplete}
    />
</div>