<script lang="ts">
import OverflowMenuHorizontalIcon from '$lib/icons/overflow-menu--horizontal.svelte'
import ReplyIcon from '$lib/icons/reply.svelte'
import TrashCanIcon from '$lib/icons/trash-can.svelte'
import { onOutsideClick } from '../../../../actions/onOutsideClick'
import { scale } from 'svelte/transition'

let {
	id = $bindable(),
    authorId,
	authorHandle,
    time,
    content,

    replyingToMessageContent,
    onReplyButtonClick,

    localUserId,
    onRemoval,
}: {
	id: string
    authorId: string
	authorHandle?: string
    content?: string
    time: Date

    replyingToMessageContent?: string
    onReplyButtonClick: () => void

    localUserId: string

    onRemoval?: () => void
} = $props()

const isMine = $derived(authorId === localUserId)

let showMoreMenu = $state(false)

function onMessageRemovalRequest() {
	const formData = new FormData()

    formData.set('id', id)

	fetch(`/api/messages`, {
        method: 'DELETE',
        body: formData,
        signal: AbortSignal.timeout(2000),
    }).then((response) => {
		if(response.ok) {
			onRemoval?.()
		}
    })
}
</script>

<div class="group flex space-x-3 items-center {isMine ? 'self-end flex-row-reverse space-x-reverse' : ''}">
    {#if !isMine}
        <a href="/@{authorHandle}">
            <img src="/api/users/{authorId}/avatar" class="rounded-full size-10 shrink-0" alt="">
        </a>
    {/if}
    <div style="box-shadow: 0px 2px 11px rgba(0,0,0,0.08);"
         title="Sent at {time.toLocaleString()}"
         class="p-2.5 px-3 h-fit flex rounded-2xl flex-col space-y-2 max-w-2/3
            {isMine ? 'bg-[#53a6e2] text-white' : 'bg-white text-[#6E6E6E]'}"
    >
        {#if replyingToMessageContent}
            <div class="space-y-1">
                <p class="text-[10px] flex space-x-1 items-center mb-2">
                    <span class="flex size-3 mb-0.5"><ReplyIcon/></span>
                    <span>Replied to</span>
                </p>
                <p
                    class="p-2 px-2 rounded-xl bg-white text-black font-extralight hover:scale-103 transition-all will-change-transform"
                >{replyingToMessageContent}</p>
            </div>
        {/if}
        <p class="text-xs">
            {content}
        </p>
    </div>
    <button
        onclick={() => onReplyButtonClick()}
        class="size-4 cursor-pointer active:scale-95 text-zinc-400 hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-all"
    ><ReplyIcon/></button>
    <div class="flex">
        <button
            onclick={() => showMoreMenu = true}
            class="size-4 cursor-pointer active:scale-95 text-zinc-400 hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-all"
        ><OverflowMenuHorizontalIcon/></button>
        {#if showMoreMenu}
            <div class="relative">
                <div
                    use:onOutsideClick={() => showMoreMenu = false}
                    transition:scale
                    class="absolute select-none overflow-clip -translate-y-1/2 flex flex-col top-full right-5 w-fit text-zinc-400 text-[11px] bg-white shadow-lg rounded-xl z-100 will-change-transform"
                >
                    {#if isMine}
                        <button
                            onclick={onMessageRemovalRequest}
                            class="items-center flex space-x-2 justify-center font-light p-3.5 cursor-pointer hover:bg-zinc-100 active:scale-95 active:rounded-xl transition-all will-change-transform outline-none"
                        >
                            <span class="size-3 self-center"><TrashCanIcon/></span>
                            <span>Remove</span>
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
