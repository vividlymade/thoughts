<script lang="ts">
	import type Post from '../post/Post.svelte'
	import FavoriteIcon from '$lib/icons/favorite.svelte'
	import FavoriteFilledIcon from '$lib/icons/favorite--filled.svelte'
	import AddCommentIcon from '$lib/icons/add-comment.svelte'
	import ShareIcon from '$lib/icons/share.svelte'
	import AttachmentType from '../post/AttachmentType'
	import * as TimeFormatUtils from '../utils/TimeFormatUtils.svelte'
	import { scale, slide, fly } from 'svelte/transition'
	import MoreMenu from '$lib/post/MoreMenu.svelte'
	import { expoOut } from 'svelte/easing'
	import NewReply from '$lib/NewReply.svelte'
    import { onOutsideClick } from '../actions/onOutsideClick'
	import type Attachment from '../post/Attachment'
	import AttachmentPreviewer from '$lib/AttachmentPreviewer.svelte'
	import { goto } from '$app/navigation'
	import PostAuthorHeaderLine from '$lib/post/PostAuthorHeaderLine.svelte'
    import { flip } from 'svelte/animate'
    import OverflowMenuHorizontal from '$lib/icons/overflow-menu--horizontal.svelte'
	import PostReply from '$lib/post/PostReply.svelte'
	import PostTag from '$lib/PostTag.svelte'
	import { parseHashtags, TextContentEntryType } from '$lib/post/TextContentEntry'

	let {
		post,
		onRemoval,
		localUserId,
		localUserHandle,
		localUserName,
	}: {
		post: Post,
		onRemoval?: () => void,
		localUserId?: string,
		localUserHandle?: string,
		localUserName?: string,
	} = $props()

	let readableRelativeTime = $derived(TimeFormatUtils.createTimeAgo(post.time))

	let textContentParts = $derived(parseHashtags(post.content))

    let showReplies = $state(false)

	function toggleRepliesSection() {
		showReplies = !showReplies
	}

	let awaitingForLikeResponse = $state(false)

	async function onLikeChangeRequest() {
		if(!localUserId) {
			await goto('/signin')

			return
        }

		if (post.hasBeenLikedLocally) {
			/** Marks the post as an already disliked locally. */
			post.hasBeenLikedLocally = false
			post.likes--

			fetch(`/api/posts/${post.id}/like`, {
				method: 'DELETE',
				signal: AbortSignal.timeout(2000),
			}).catch(() => {
				post.hasBeenLikedLocally = true
				post.likes++
			}).finally(() => {
				awaitingForLikeResponse = false
			})

			awaitingForLikeResponse = true
		} else {
			/** Marks the post as an already liked locally. */
			post.hasBeenLikedLocally = true
			post.likes++

			fetch(`/api/posts/${post.id}/like`, {
				method: 'POST',
				signal: AbortSignal.timeout(2000),
			}).then((response) => {
				if (!response.ok) {
					post.hasBeenLikedLocally = false
					post.likes--
				}
			}).catch(() => {
				post.hasBeenLikedLocally = false
				post.likes--
			}).finally(() => {
				awaitingForLikeResponse = false
			})

			awaitingForLikeResponse = true
		}
	}

	async function onShareRequest() {
		if(!localUserId) {
			await goto('/signin')

			return
        }

		fetch(`/api/posts/${post.id}/share`, {
			method: 'POST',
			signal: AbortSignal.timeout(2000),
		}).catch(() => {
			/** TODO */
		})
	}

	async function onPostRemovalRequest() {
		showMoreMenu = false

		const response = await fetch(`/api/posts/${post.id}`, {
			method: 'DELETE',
		})

		if (response.ok) {
			onRemoval?.()
		}
	}

    let isEditing = $state(false)
	let showMoreMenu = $state(false)

	function toggleMoreMenu() {
		showMoreMenu = !showMoreMenu
	}

	let currentlyPreviewedAttachment: Attachment | undefined = $state()
</script>

<div class="flex flex-col text-xs backdrop-blur-xs rounded-3xl bg-[#fefefe]/90"
     style="box-shadow: 0px 2px 10px rgba(0,0,0,0.03);"
>
    <div class="flex flex-col w-full rounded-3xl pb-2.5 p-4 border-b border-b-zinc-100 space-y-5">
        <div class="flex flex-row space-x-5">
            <div class="size-11 aspect-square rounded-full border overflow-clip">
                <a class="flex flex-row space-x-2" href="/@{post.author.handle}">
                    <img class="" alt="" src="{post.author.pictureURL}">
                </a>
            </div>
            <div class="flex flex-col space-y-1.5 flex-1">
                <div class="flex flex-row justify-between">
                    <PostAuthorHeaderLine
                        handle={post.author.handle}
                        name={post.author.name}
                    />
                    <div class="relative flex">
                        <div class="flex items-center space-x-3">
                            <p class="text-[#B1B1B1] text-[11px] font-extralight"
                               title={new Date(post.time).toLocaleString()}
                            >{readableRelativeTime.value}</p>
                            <div class="w-8 h-0">
                                <button
                                    title="More"
                                    onclick={toggleMoreMenu}
                                    class="cursor-pointer -translate-y-1/2 size-8 p-2 drop-shadow-lg/3 self-end text-[#373737] hover:text-[#A7A7A7] transition-colors duration-200 aspect-square hover:bg-zinc-100 active:scale-95 rounded-full"
                                >
                                    <OverflowMenuHorizontal/>
                                </button>
                            </div>
                        </div>
                        {#if showMoreMenu}
                            <MoreMenu
                                bind:show={showMoreMenu}
                                ownsPost={localUserHandle === post.author.handle}
                                onPostRemovalRequest={onPostRemovalRequest}
                            />
                        {/if}
                    </div>
                </div>
                {#if post.content.length > 0}
                    {#if isEditing}
                        <textarea
                            transition:fly
                            class="placeholder:text-[#B1B1B1] text-[#818181] text-[11px] font-light flex resize-none
                             outline-none"
                            bind:value={post.content}
                            use:onOutsideClick="{() => { isEditing = false }}"
                        >{post.content}</textarea>
                    {:else}
                        <p role="article" ondblclick={() => { isEditing = true }} class="text-[#575757] text-[11px]
                            whitespace-pre-line wrap-anywhere mr-8 *:py-0.75 fit-content"
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
                    {/if}
                {/if}
            </div>
        </div>
        {#key post.attachments}
            {#if post.attachments.length > 0}
                <div in:scale|global={{ duration: 400, easing: expoOut }} out:scale={{ duration: 0 }}
                     class="flex space-x-5 self-center mx-14"
                >
                    {#each post.attachments as attachment}
                        {#if attachment.type === AttachmentType.IMAGE}
                            <button class="overflow-clip self-center max-h-44 cursor-pointer rounded-xl mb-4
                                drop-shadow-xl/5 hover:drop-shadow-xl/10 transition-all"
                                    style="box-shadow: 0px 2px 5px rgba(0,0,0,0.05);"
                                    onclick={() => {
                                        currentlyPreviewedAttachment = attachment
                                    }}>
                                <img src={attachment.source} alt=""
                                     class="object-cover max-h-44 will-change-transform active:scale-95 hover:scale-105
                                        hover:brightness-80 transition-all duration-300 rounded-xl"
                                >
                            </button>
                        {/if}
                    {/each}
                </div>
            {/if}
        {/key}
        <div class="flex justify-between mx-15 select-none">
            <div class="active:scale-90 duration-200 transition-transform will-change-transform">
                <button title="Like" onclick={onLikeChangeRequest} disabled={awaitingForLikeResponse}
                        class="flex place-content-center cursor-pointer place-items-center {post.hasBeenLikedLocally ?
                            'bg-red-50 text-red-300' : 'text-zinc-600 hover:bg-red-50 hover:text-red-300'}
                            transition-colors rounded-lg p-2 box-border duration-400"
                >
                    <span class="flex size-4 mr-2 place-content-center">
                        {#if post.hasBeenLikedLocally}
                            <span class="flex" in:scale out:slide={{ axis: 'x' }}>
                                <FavoriteFilledIcon/>
                            </span>
                        {:else}
                            <span class="flex" in:scale out:slide={{ axis: 'x' }}>
                                <FavoriteIcon/>
                            </span>
                        {/if}
                    </span>
                    <span>{post.likes}</span>
                </button>
            </div>
            <div class="active:scale-90 duration-200 transition-transform will-change-transform">
                <button title="Comments" onclick={toggleRepliesSection}
                        class="flex place-content-center cursor-pointer place-items-center hover:bg-sky-50
                            hover:text-blue-300 text-zinc-600 transition-colors rounded-lg p-2 box-border
                            duration-400"
                >
                    <span class="flex size-4 mr-2 place-content-center">
                        <AddCommentIcon/>
                    </span>
                    <span>{post.repliesCount}</span>
                </button>
            </div>
            <div class="active:scale-90 duration-200 transition-transform will-change-transform">
                <button title="Share" onclick={onShareRequest}
                        class="flex place-content-center cursor-pointer place-items-center {post.hasBeenSharedLocally ? 'bg-orange-50 text-orange-300' : 'text-zinc-600 hover:bg-orange-50 hover:text-orange-300'} transition-colors rounded-lg p-2 box-border duration-400">
                    <span class="flex size-4 mr-2 place-content-center">
                        {#if post.hasBeenSharedLocally}
                            <ShareIcon/>
                        {:else}
                            <ShareIcon/>
                        {/if}
                    </span>
                    <span>{post.shares}</span>
                </button>
            </div>
        </div>
    </div>
    {#if showReplies}
        <div transition:slide={{ duration: 500, }} class="flex flex-col p-2 items-center will-change-transform">
            <p class="font-light text-[10px] py-2 select-none text-[#868686]">Comments</p>
            <NewReply
                replyingToPost={post}
                localUserId={localUserId}
                localUserHandle={localUserHandle}
                localUserName={localUserName}
                onPostSuccess={(reply) => {
                    post.replies.unshift(reply)
                    post.repliesCount++
                }}
            />
            <div class="replies min-h-2 w-full space-y-3 p-3">
                {#each post.replies as reply(reply.id)}
                    <div
                        animate:flip={{ duration: 800 }}
                        transition:slide={{ duration: 500 }}
                    >
                        <PostReply
                            post={post}
                            reply={reply}
                            localUserHandle={localUserHandle}
                            localUserId={localUserId}
                            onRemoval={() => {
								const index = post.replies.findIndex(item => item.id === reply.id)

                                if (index !== -1) {
                                    post.replies.splice(index, 1)

                                    post.repliesCount--
                                }
                            }}
                        />
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

{#if currentlyPreviewedAttachment}
    <AttachmentPreviewer bind:attachment={currentlyPreviewedAttachment} />
{/if}
