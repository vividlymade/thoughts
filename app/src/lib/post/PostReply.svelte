<script lang="ts">
import PostAuthorHeaderLine from '$lib/post/PostAuthorHeaderLine.svelte'
import OverflowMenuVertical from '$lib/icons/overflow-menu--vertical.svelte'
import type Post from '../../post/Post.svelte'
import * as TimeFormatUtils from '../../utils/TimeFormatUtils.svelte'
import TrashCanIcon from '$lib/icons/trash-can.svelte'
import { onOutsideClick } from '../../actions/onOutsideClick'
import { scale, slide } from 'svelte/transition'
import FavoriteFilledIcon from '$lib/icons/favorite--filled.svelte'
import FavoriteIcon from '$lib/icons/favorite.svelte'
import { goto } from '$app/navigation'
import { parseHashtags, TextContentEntryType } from '$lib/post/TextContentEntry'
import PostTag from '$lib/PostTag.svelte'

let {
	localUserId,
	localUserHandle,
    post,
	reply,
    onRemoval,
}: {
	localUserId?: string,
	localUserHandle?: string,
    post: Post,
	reply: Post,
    onRemoval?: () => void,
} = $props()

let readableRelativeTime = $derived(TimeFormatUtils.createTimeAgo(reply.time))
let textContentParts = $derived(parseHashtags(reply.content))

let showMoreMenu = $state(false)
let ownsReply = $derived(reply.author.handle === localUserHandle)

function onReplyRemovalRequest() {
	fetch(`/api/posts/${reply.id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(2000),
    }).then((response) => {
		if(response.ok) {
			onRemoval?.()
		}
    })
}

async function onLikeChangeRequest() {
    if(!localUserId) {
        await goto('/signin')

        return
    }

    if (reply.hasBeenLikedLocally) {
        reply.hasBeenLikedLocally = false
        reply.likes--

        fetch(`/api/posts/${reply.id}/like`, {
            method: 'DELETE',
            signal: AbortSignal.timeout(2000),
        }).catch(() => {
            reply.hasBeenLikedLocally = true
            reply.likes++
        }).finally(() => {
            awaitingForLikeResponse = false
        })

        awaitingForLikeResponse = true
    } else {
        reply.hasBeenLikedLocally = true
        reply.likes++

        fetch(`/api/posts/${reply.id}/like`, {
            method: 'POST',
            signal: AbortSignal.timeout(2000),
        }).then((response) => {
            if (!response.ok) {
                reply.hasBeenLikedLocally = false
                reply.likes--
            }
        }).catch(() => {
            reply.hasBeenLikedLocally = false
            reply.likes--
        }).finally(() => {
            awaitingForLikeResponse = false
        })

        awaitingForLikeResponse = true
    }
}


let awaitingForLikeResponse = $state(false)
</script>

<div class="flex space-x-3">
    <div class="size-10 aspect-square rounded-full border overflow-clip">
        <a class="flex flex-row space-x-2" href="/@{reply.author.handle}">
            <img class="" alt="" src="{reply.author.pictureURL}">
        </a>
    </div>
    <div class="flex flex-col space-y-0.75">
        <PostAuthorHeaderLine
            handle={reply.author.handle}
            name={reply.author.name}
        />
        <div class="group flex space-x-2 items-center relative">
            <p class="text-[#454545] text-[11px] bg-white w-fit p-2.5 rounded-xl border border-[rgb(248,248,248)] hover:bg-zinc-50 transition-all"
                 style="box-shadow: 0px 0px 1px rgba(0,0,0,0.08);"
            >
                {#each textContentParts as part}
                    {#if part.type === TextContentEntryType.TEXT}
                        {part.text}
                    {:else if part.type === TextContentEntryType.HASHTAG}
                        {@const value = part.value}

                        <PostTag value={value}/>
                    {/if}
                {/each}
            </p>
            <button
                title="More"
                onclick={() => showMoreMenu = !showMoreMenu}
                class="group-hover:opacity-100 opacity-0 cursor-pointer size-8 p-2 drop-shadow-lg/3 self-center text-[#373737] hover:text-[#A7A7A7] transition-all duration-200 aspect-square hover:bg-zinc-100 active:scale-95 rounded-full"
            >
                <OverflowMenuVertical/>
            </button>
            {#if showMoreMenu}
                <div
                    use:onOutsideClick={() => showMoreMenu = false}
                    transition:scale
                    class="absolute select-none overflow-clip flex flex-col top-full mt-1 right-0 w-fit text-zinc-400 text-[11px] bg-white shadow-lg rounded-xl z-100 will-change-transform"
                >
                    {#if ownsReply}
                        <button onclick={onReplyRemovalRequest} class="items-center flex space-x-2 justify-center font-light p-3.5 cursor-pointer hover:bg-zinc-100 active:scale-95 active:rounded-xl transition-all will-change-transform">
                            <span class="size-3 self-center"><TrashCanIcon/></span>
                            <span>Remove</span>
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
        <div class="active:scale-90 duration-200 transition-transform will-change-transform w-fit">
            <button title="Like" onclick={onLikeChangeRequest} disabled={awaitingForLikeResponse}
                    class="flex place-content-center cursor-pointer place-items-center w-fit mx-3 space-x-2 {reply.hasBeenLikedLocally ? 'text-red-300' : 'text-zinc-500  hover:text-red-300'}
                        transition-colors rounded-lg box-border duration-400">
                <span class="flex size-4 place-content-center">
                    {#if reply.hasBeenLikedLocally}
                        <span class="flex" in:scale out:slide={{ axis: 'x' }}>
                            <FavoriteFilledIcon/>
                        </span>
                    {:else}
                        <span class="flex" in:scale out:slide={{ axis: 'x' }}>
                            <FavoriteIcon/>
                        </span>
                    {/if}
                </span>
                <span>{reply.likes}</span>
            </button>
        </div>
        <p
            class="text-[#B1B1B1] text-[11px] font-extralight mx-1.5 cursor-default"
           title={new Date(reply.time).toLocaleString()}
        >{readableRelativeTime.value}</p>
    </div>
</div>
