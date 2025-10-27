<script lang="ts">
	import { onMount } from 'svelte'
	import type { MediaResponse } from '../../../../api/users/[id]/media/+server'
	import type Attachment from '../../../../../post/Attachment'
	import ImageAttachment from '../../../../../post/ImageAttachment'
	import AttachmentPreviewer from '$lib/AttachmentPreviewer.svelte'
    import Image from '$lib/icons/image.svelte'

    let { data } = $props()

    const loadedMedia: ImageAttachment[] = $state([])

    let nextCursor: MediaResponse['cursor']

    async function fetchMore() {
		let url = `/api/users/${data.profile.id}/media`

        if(nextCursor) {
			const queryString = new URLSearchParams({
                afterTime: nextCursor.afterTime.toString(),
                postId: nextCursor.postId,
                order: nextCursor.order.toString(),
            }).toString()

			url += '?' + queryString
        }

		return fetch(url, {
			method: 'GET',
        }).then(async (response) => {
			const responseData = await response.json() as MediaResponse

            for(const entry of responseData.media) {
				loadedMedia.push(new ImageAttachment(`/api/posts/attachment/${entry}`))
			}

            nextCursor = responseData.cursor

            if(nextCursor) {
                await fetchMore()
            }
		})
    }

	onMount(() => {
		fetchMore()
    })

	let currentlyPreviewedAttachment: Attachment | undefined = $state()
</script>
<div class="flex flex-col mb-42 items-center">
    <div class="grid grid-cols-3 rounded-2xl gap-4 bg-white p-3" style="box-shadow: 0px 2px 10px rgba(0,0,0,0.05);">
        {#each loadedMedia as entry}
            <button class="rounded-xl overflow-clip relative" onclick={() => { currentlyPreviewedAttachment = entry }}>
                <img
                    draggable="false"
                    class="w-full hover:scale-105 hover:brightness-80 duration-500 aspect-square object-cover rounded-xl select-none cursor-pointer active:scale-95 transition-all will-change-transform hover:drop-shadow-xl drop-shadow-2xl/5 bg-white"
                    src={entry.source}
                    alt=""
                >
                <span class="size-6 bottom-3 right-3 absolute text-white pointer-events-none"><Image/></span>
            </button>
        {/each}
    </div>
    <p class="text-xs font-extralight text-[#B1B1B1] mt-8 select-none">
        {#if loadedMedia.length === 0}
            Seems like there is nothing to see here...
        {:else}
            You've reached the end!
        {/if}
    </p>
</div>

{#if currentlyPreviewedAttachment}
    <AttachmentPreviewer bind:attachment={currentlyPreviewedAttachment} />
{/if}
