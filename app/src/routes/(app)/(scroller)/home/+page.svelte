<script lang="ts">
    import PostElement from '$lib/Post.svelte'
    import Post from '../../../../post/Post.svelte.js'
    import Profile from '../../../../Profile'
	import ImageAttachment from '../../../../post/ImageAttachment'
    import NewPost from '$lib/NewPost.svelte'
	import type Attachment from '../../../../post/Attachment'
	import { onMount } from 'svelte'
	import type { ResponsePost, PostsResponse } from '../../../api/posts/+server'
    import { scale, fly } from 'svelte/transition'
    import { flip } from 'svelte/animate'
	import AppConsts from '../../../../AppConsts'

	let { data } = $props()

    let loadedPosts: Post[] = $state([])

    async function loadPosts() {
		const response = await fetch('/api/posts')

        if(!response.ok) {
			return
        }

        const jsonResponse = await response.json() as PostsResponse

        const posts = jsonResponse.posts

        for(const post of posts) {
            const attachments: ImageAttachment[] = []

            for(const attachmentId of post.attachments) {
				attachments.push(new ImageAttachment(`/api/posts/attachment/${attachmentId}`))
            }

			const hasBeenLikedByLocalUser = post.hasBeenLikedByUser !== undefined
            const hasAnyReplies = post.replies !== undefined

            const replies: Post[] = []

            if(hasAnyReplies) {
				for(const reply of post.replies) {
					const attachments: ImageAttachment[] = []

                    for(const attachmentId of reply.attachments) {
						attachments.push(new ImageAttachment(`/api/posts/attachment/${attachmentId}`))
                    }

					const hasBeenLikedLocally = reply.hasBeenLikedByUser !== undefined

					replies.push(
						new Post(
							reply.id,
                            new Profile('', `/api/users/${reply.authorId}/avatar`, reply.authorHandle, reply.authorName),
                            reply.content,
							attachments,
                            reply.timestamp,
							reply.repliesCount,
							/** Replies of the replies are loaded later when the user wants to open them. */
                            [],
                            reply.likes,
							/** TODO */
                            0,
                            hasBeenLikedLocally,
                        )
                    )
                }
            }

			loadedPosts.push(
				new Post(
					post.id,
                    new Profile('', `/api/users/${post.authorId}/avatar`, post.authorHandle, post.authorName),
                    post.content,
                    attachments,
                    post.timestamp,
					post.repliesCount,
                    replies,
                    post.likes,
                    0,
                    hasBeenLikedByLocalUser,
                )
            )
		}
    }

	onMount(() => {
		loadPosts().then()
    })

    function onPostRequest(text: string, attachment: Attachment) {

    }
</script>

<svelte:head>
    <title>{AppConsts.PROJECT_NAME} – discover what others talk about and share your own thoughts!</title>
</svelte:head>

<div class="flex flex-col space-y-8 items-center">
    {#if data.localUserId}
        <div class="z-1 relative w-full">
            <NewPost
                localUserId={data.localUserId}
                localUserHandle={data.localUserHandle!}
                localUserName={data.localUserName!}
                onPostSuccess={(post) => {
                    loadedPosts.unshift(post)
                }}
            />
        </div>
    {/if}

    <div class="space-y-4 w-full" style="view-transition-name: posts;">
        {#each loadedPosts as post(post.id)}
            <!--{#key post}-->
            <div animate:flip={{ duration: 800 }}
                 transition:fly={{ y: -200, duration: 1000 }}>
                <div transition:scale={{ duration: 800 }}>
                    <PostElement
                        post={post}
                        onRemoval={() => {
                            const index = loadedPosts.findIndex(item => item.id === post.id)

                            if (index !== -1) {
                                loadedPosts.splice(index, 1)
                            }
                        }}
                        localUserId={data.localUserId}
                        localUserHandle={data.localUserHandle}
                        localUserName={data.localUserName}
                    />
                </div>
            </div>
        {/each}
    </div>
</div>

<div class="text-xs text-zinc-300 font-light self-center py-10 select-none">You have reached the end!</div>

<style>
    @import '../../../../shared.pcss';
</style>
