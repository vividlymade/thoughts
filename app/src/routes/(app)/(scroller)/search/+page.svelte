<script lang="ts">
	import UserFollowButton from '$lib/UserFollowButton.svelte'
    import { scale } from 'svelte/transition'
    import PostElement from '$lib/Post.svelte'

	let { data } = $props()

    let users = $derived([...data.search.users])
    let posts = $derived([...data.search.posts])

    let hasMoreUsers = $derived(data.search.hasMoreUsers)
    let hasMorePosts = $derived(data.search.hasMorePosts)

    const compactNumberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

    let showAnimated = $state(false)

    $effect(() => {
		showAnimated = true
    })

    // const queryString = new URLSearchParams({
    //     q: page.url.searchParams.get('q')!,
    // }).toString()

    // if(nextCursor) {
    //     const queryString = new URLSearchParams({
    //         afterTime: nextCursor.afterTime.toString(),
    //         postId: nextCursor.postId,
    //         order: nextCursor.order.toString(),
    //     }).toString()
    //
    //     url += '?' + queryString
    // }
</script>
{#if users.length > 0}
    <p class="text-[11px] font-light ml-4 select-none text-[#BDBDBD]">Profiles</p>
    <div class="flex flex-col">
        {#each users as user}
            <a aria-label={user.handle}
               class="flex-1 flex items-center justify-between text-[11px] px-5 py-5 bg-white hover:bg-zinc-50 active:scale-95 rounded-2xl transition-all"
               href="/@{user.handle}"
               style="box-shadow: 0px 2px 18px rgba(0,0,0,0.04);"
            >
                <div class="flex space-x-4 items-center">
                    <img alt="{user.handle}" class="size-12 rounded-full" src={user.pictureURL} />
                    <div class="flex flex-col space-x-1.5">
                        <p class="text-[#373737] font-bold">{user.name}</p>
                        <p class="text-[#BDBDBD]">@{user.handle}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-5">
                    <p class="text-[#BDBDBD]">{compactNumberFormatter.format(user.followersCount)} followers</p>
                    <UserFollowButton userId={user.id} locallyLoggedIn={!!data.localUserId} followersCount={user.followersCount} />
                </div>
            </a>
        {/each}
    </div>
    {#if hasMoreUsers}
        <button
            class="text-[11px] font-light text-[#BDBDBD] p-3 bg-white w-fit self-center rounded-2xl active:scale-90 transition-all cursor-pointer"
            style="box-shadow: 0px 2px 15px rgba(0,0,0,0.04);"
        >Show more</button>
    {/if}
{/if}

{#if posts.length > 0}
    <p class="text-[11px] font-light ml-4 select-none text-[#BDBDBD]">Posts</p>
    <div class="flex flex-col space-y-4">
        {#each posts as post}
            <PostElement
                localUserId={data.localUserId}
                localUserHandle={data.localUserHandle}
                localUserName={data.localUserName}
                post={post}
            />
        {/each}
    </div>
    {#if hasMorePosts}
        <button
            class="text-[11px] font-light text-[#BDBDBD] p-3 bg-white w-fit self-center rounded-2xl active:scale-90 transition-all cursor-pointer"
            style="box-shadow: 0px 2px 15px rgba(0,0,0,0.04);"
        >Show more</button>
    {/if}
{/if}

{#if users.length === 0 && posts.length === 0}
    {#if showAnimated}
        <p
            transition:scale={{ duration: 800 }}
            class="text-sm font-extralight text-[#BDBDBD] self-center select-none mt-32 justify-self-center"
        >
            Whoops... Seems like we couldn't find anything you were looking for :(
        </p>
    {/if}
{/if}