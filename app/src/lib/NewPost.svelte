<script lang="ts">
import EmojiIcon from '$lib/icons/face--satisfied.svelte'
import SendIcon from '$lib/icons/send.svelte'
import ImageIcon from '$lib/icons/image.svelte'
import GIFIcon from '$lib/icons/GIF.svelte'
import CloseIcon from '$lib/icons/close.svelte'
import { onMount } from 'svelte'
import { type Picker } from 'emoji-mart'
// import type Attachment from '../post/Attachment'
import AppConsts from '../AppConsts'
import Post from '../post/Post.svelte'
import { flip } from 'svelte/animate'
import { fade, scale } from 'svelte/transition'
import HTTPCode from '../HTTPCode'
import { goto } from '$app/navigation'
import ImageAttachment from '../post/ImageAttachment'
import Profile from '../Profile'
import LoadingIcon from '$lib/icons/loading.svelte'
import type { NewPostResponse } from '../routes/api/posts/+server'
import EmojiPicker from '$lib/EmojiPicker.svelte'
import { onOutsideClick } from '../actions/onOutsideClick'
import UnavailableFeatureModal from '$lib/UnavailableFeatureModal.svelte'

let {
    localUserId,
    localUserHandle,
    localUserName,
	onPostSuccess,
}: {
	localUserId: string,
	localUserHandle: string,
	localUserName: string,
    onPostSuccess: (post: Post) => void,
} = $props()

let emojiPickerWrapper: HTMLDivElement | undefined
let textInputElement: HTMLInputElement | undefined

let content = $state("")

onMount(() => {
	const mouseDownHandler = (e: MouseEvent) => {
        isTextAreaFocused = true
    }

	element.addEventListener('mousedown', mouseDownHandler)

    return () => {
        element.removeEventListener('mousedown', mouseDownHandler)
    }
})

async function onPostSendRequest() {
	if(awaitingForResponse) {
		return
    }

	if(content.length === 0 && attachments.length === 0) {
		return
    }

	const formData = new FormData()

    formData.set('content', content)

    for(const attachment of attachments) {
		formData.append('attachment', attachment.file)
    }

	fetch('/api/posts', {
		method: 'POST',
        body: formData,
	}).then(async (response) => {
		switch(response.status) {
            case HTTPCode.CREATED: {
                const result = await response.json() as NewPostResponse

                const attachmentsIds = result.attachments

                const attachments: ImageAttachment[] = []

                for(const id of attachmentsIds) {
                    attachments.push(new ImageAttachment(`/api/posts/attachment/${id}`))
                }

                onPostSuccess(
                    new Post(
                        result.postId,
                        new Profile('', `/api/users/${localUserId}/avatar`, localUserHandle, localUserName),
                        content,
                        attachments,
                        result.postTime,
						0,
                        [],
                        0,
                        0,
                        false,
                    )
                )

                break
            }
            case HTTPCode.UNAUTHORIZED: {
                await goto('/signin')

                break
            }
        }


        content = ''
        attachments = []
    }).finally(() => {
		awaitingForResponse = false
    })

    awaitingForResponse = true
}

let showStickerPicker = $state(false)
let showStickerPickerTimer: ReturnType<typeof setTimeout>

function openStickerPicker() {
    showStickerPicker = !showStickerPicker

    if(showStickerPicker) {
		clearInterval(showStickerPickerTimer)

		if (showStickerPickerTimer) {
			showStickerPickerTimer = setTimeout(() => {
				showStickerPicker = false
			}, 2000)
		}
	}
}

let dragCounter = 0

let awaitingForResponse = $state(false)
let isDraggingOver = $state(false)

class InputAttachment {
	static idCounter = 0

	id: number
    file: File
	constructor(file: File) {
		this.id = InputAttachment.idCounter++
        this.file = file
    }
}

let attachments: InputAttachment[] = $state([])

let localUserAvatarSrc = $derived(`/api/users/${localUserId}/avatar`)

function onDragOver(event: DragEvent) {
	isDraggingOver = true
}

function onAttachmentsChange(event: Event) {
	const target = event.target as HTMLInputElement

    if(!target.files) {
		return
    }

	for(const file of target.files) {
		if(attachments.length === AppConsts.MAX_ALLOWED_POST_ATTACHMENTS) {
			break
        }

	    if(file.size > AppConsts.MAX_ALLOWED_POST_ATTACHMENT_SIZE) {
			continue
        }

		attachments.push(
			new InputAttachment(file)
        )
    }

	target.value = ''
}

let element: HTMLDivElement

let isSendButtonHold = $state(false)
let isTextAreaFocused = $state(false)

function onAttachmentRemoval(attachment: InputAttachment) {
    const index = attachments.findIndex(item => item.id === attachment.id)

    if (index !== -1) {
        attachments.splice(index, 1)
    }
}

let showEmojiPicker = $state(false)

</script>

<div
    class="w-full rounded-3xl bg-white flex flex-col relative select-none will-change-transform
        {isTextAreaFocused ? 'drop-shadow-xl/3 scale-[1.048]' : ''} transition-all duration-500 backface-visible transform-gpu"
    style="box-shadow: 0px 2px 15px rgba(0,0,0,0.04); transform-origin: 50% 0; view-transition-name: new-post;"
    role="form"
    bind:this={element}
    use:onOutsideClick={() => isTextAreaFocused = false}
    ondragenter={(e) => {
        e.preventDefault()

        dragCounter++
        isDraggingOver = true
    }}
    ondrop={(e) => {
		e.preventDefault()

	    isDraggingOver = false
        dragCounter = 0
    }}
    ondragover={(e) => {
		e.preventDefault()
		e.stopImmediatePropagation()
    }}
    ondragleave={(e) => {
		e.preventDefault()
		e.stopImmediatePropagation()

		dragCounter--;

        if (dragCounter === 0) {
            isDraggingOver = false
        }
    }}
>
    <div class="flex">
        <img class="size-10 m-3 rounded-full aspect-square border select-none" style="box-shadow: 0px 2px 5px rgba(0,0,0,0.08);" src={localUserAvatarSrc} alt="Avatar" draggable="false">
        <textarea
            bind:value={content}
            onkeydown={(e) => {
				if(e.ctrlKey && e.key === 'Enter') {
					isSendButtonHold = true
                }
            }}
            onkeyup={(e) => {
				if(e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault()

                    isSendButtonHold = false

                    onPostSendRequest()
				}
            }}
            placeholder="Share your thoughts here..."
            minlength={AppConsts.MIN_ALLOWED_POST_LENGTH}
            maxlength={AppConsts.MAX_ALLOWED_POST_LENGTH}
            disabled={awaitingForResponse}
            class="placeholder:text-[#B1B1B1] text-[#818181] text-xs placeholder:text-[11px] font-light flex resize-none w-full py-2 my-4 outline-none">
        </textarea>
    </div>
    <div class="{attachments.length === 0 && 'hidden'} visible h-24 mx-6 my-4 flex space-x-4">
        {#each attachments as attachment, index (attachment.id)}
            <div in:scale class="group w-fit relative hover:cursor-pointer active:scale-90 transition-all">
                <div class="opacity-0 cursor-pointer transition-all hover:opacity-100 bg-white/40 duration-500 w-full h-full absolute"></div>
                <button onclick={() => { onAttachmentRemoval(attachment) }} class="opacity-0 group-hover:opacity-100 transition-all cursor-pointer size-5 absolute active:scale-90 m-1 bg-white text-zinc-300 rounded-full right-0">
                    <CloseIcon/>
                </button>
                <img class="bg-white peer object-contain rounded-xl h-auto w-auto max-h-full max-w-full"
                     style="box-shadow: 0px 2px 5px rgba(0,0,0,0.08);"
                     alt="" src={URL.createObjectURL(attachment.file)} draggable="false">
            </div>
        {/each}
    </div>
    <div class="flex flex-row justify-between px-4 items-center pb-2">
        <div class="flex text-[#A8A8A8] space-x-3 *:flex">
            {#snippet extraButtonIcon(icon)}
                <span class="block active:scale-90 transition-all w-5.5 cursor-pointer">{@render icon()}</span>
            {/snippet}
            <label>
                <input onchange={onAttachmentsChange} type="file" accept="image/*" multiple class="hidden" />
                {@render extraButtonIcon(ImageIcon)}
            </label>
            <div>
                <button onclick={() => showEmojiPicker = !showEmojiPicker}>
                    {@render extraButtonIcon(EmojiIcon)}
                </button>
                {#if showEmojiPicker}
                    <div class="relative">
                        <div class="absolute">
                            <EmojiPicker bind:open={showEmojiPicker} onEmojiSelect={(emoji) => content += emoji.native} />
                        </div>
                    </div>
                {/if}
            </div>
            <div>
                <button onclick={openStickerPicker}>
                    {@render extraButtonIcon(GIFIcon)}
                </button>
                {#if showStickerPicker}
                    <div class="relative self-end flex">
                        <UnavailableFeatureModal bind:show={showStickerPicker} />
                    </div>
                {/if}
            </div>
        </div>

        <div class="flex space-x-2 items-center">
            {#if content.length > 0}
                <p transition:fade={{ duration: 200 }}
                   class="text-xs p-2 transition-colors font-light
                    {content.length === AppConsts.MAX_ALLOWED_POST_LENGTH ? 'text-red-400' : 'text-zinc-300'}"
                >{AppConsts.MAX_ALLOWED_POST_LENGTH - content.length}</p>
            {/if}

            <button onclick={onPostSendRequest} disabled={awaitingForResponse} class="active:scale-90 {isSendButtonHold ? 'scale-90' : ''} transition-all will-change-transform">
            <span class="block cursor-pointer rounded-full bg-[#5381ED] size-9 p-2 text-white">
                <span class="size-5">
                    {#if awaitingForResponse}
                        <LoadingIcon/>
                    {:else}
                        <SendIcon/>
                    {/if}
                </span>
            </span>
        </button>
        </div>
    </div>
    <div class="{isDraggingOver ? 'bg-white/90 backdrop-blur-xl' : 'bg-white opacity-0'} space-x-3 text-xs pointer-events-none w-full h-full top-0 left-0 flex items-center justify-center font-extralight absolute z-100">
        <div class="size-5"><ImageIcon/></div>
        <p>Drop your attachments here</p>
    </div>
</div>
