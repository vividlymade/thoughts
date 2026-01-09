<script lang="ts">
    import { onMount } from 'svelte'
	import PostElement from '$lib/Post.svelte'
	import type { PostsResponse } from '../../../api/posts/+server'
	import Post from '../../../../post/Post.svelte.js'
	import Profile from '../../../../Profile'
	import ImageAttachment from '../../../../post/ImageAttachment'
    import { flip } from 'svelte/animate'
    import { fly, scale } from 'svelte/transition'
	import NewPost from '$lib/NewPost.svelte'

	let { data } = $props()

	let loadedPosts: Post[] = $state([])
    let hasMorePostsToLoad = $state(false)

    let isLocalUserProfile = $derived(data.localUserId == data.profile.id)

    onMount(() => {
        loadMorePosts()
    })

    function loadMorePosts() {
		if(awaitingForResponse) {
			return
        }

		fetch(`/api/users/${data.profile.handle}/posts`, {
			method: 'GET',
        }).then(async (response) => {
			if (!response.ok) {
				return
            }

			const postsResponse = await response.json() as PostsResponse

            for(const post of postsResponse.posts) {
                const attachments: ImageAttachment[] = []

                for(const attachmentId of post.attachments) {
					attachments.push(new ImageAttachment(`/api/posts/attachment/${attachmentId}`))
                }

				const hasBeenLikedLocally = post.hasBeenLikedByUser !== undefined

				loadedPosts.push(
					new Post(
                        post.id,
                        new Profile('', `/api/users/${data.profile.id}/avatar`, post.authorHandle, post.authorName),
                        post.content,
                        attachments,
                        post.timestamp,
						post.repliesCount,
						/** TODO: Handle loading of the replies on posts loaded by the profile page as well. */
                        [],
                        post.likes,
						/** TODO: Implement proper sharing implementation. */
                        0,
                        hasBeenLikedLocally,
                    )
                )
            }

			hasMorePostsToLoad = postsResponse.hasMore
		}).finally(() => {
		    awaitingForResponse = false
		})

        awaitingForResponse = true
    }

    let awaitingForResponse = $state(false)
</script>

<div class="flex flex-col space-y-8">
    {#if data.profile.id === data.localUserId}
        <div class="z-1 relative">
            <NewPost
                localUserId={data.localUserId}
                localUserHandle={data.localUserHandle}
                localUserName={data.localUserName}
                onPostSuccess={(post) => {
                    loadedPosts.unshift(post)
                }}
            />
        </div>
    {/if}

    <div class="space-y-3" style="view-transition-name: posts;">
        {#each loadedPosts as post(post.id)}
            <div animate:flip={{ duration: 800 }}
                 transition:fly={{ y: -200, duration: 1000 }}>
                <div transition:scale={{ duration: 800 }}>
                    <PostElement
                        post={post}
                        localUserId={data.localUserId}
                        localUserHandle={data.localUserHandle}
                        localUserName={data.localUserName}
                        onRemoval={() => {
                            const index = loadedPosts.findIndex(item => item.id === post.id)

                            if (index !== -1) {
                                loadedPosts.splice(index, 1)
                            }
                        }}
                    />
                </div>
            </div>
        {/each}
    </div>
</div>
<div in:scale class="flex text-xs font-extralight text-[#B1B1B1] select-none items-center content-center place-content-center self-center mt-10">
    {#if loadedPosts.length === 0}
        {#if isLocalUserProfile}
            You haven't posted anything, you can start even now!
        {:else}
            Seems like there is nothing to see here...
        {/if}
    {:else}
        {#if hasMorePostsToLoad}
            <button
                onclick={loadMorePosts}
                class="text-[11px] font-light text-[#BDBDBD] p-3 bg-white w-fit self-center rounded-2xl active:scale-90 transition-all cursor-pointer"
                style="box-shadow: 0px 2px 15px rgba(0,0,0,0.04);"
            >Show more</button>
        {:else}
            There is nothing more to see here...
        {/if}
    {/if}
</div>
