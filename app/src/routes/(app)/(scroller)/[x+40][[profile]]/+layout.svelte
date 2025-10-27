<script lang="ts">
    import { page } from '$app/state'
    import exampleBackground from '$lib/images/sample/profile/example-background.webp'
    import SendIcon from '$lib/icons/send.svelte'
    import OverflowMenuHorizontalIcon from '$lib/icons/overflow-menu--horizontal.svelte'
    import CalendarAddIcon from '$lib/icons/calendar--add.svelte'
    import BlogIcon from '$lib/icons/blog.svelte'
    import MediaLibraryIcon from '$lib/icons/media--library.svelte'
    import type { PageProps } from './$types'
	import type { Snippet } from 'svelte'
	import UserFollowButton from '$lib/UserFollowButton.svelte'
	import { goto } from '$app/navigation'
	import type { ResponseConversation } from '../../../api/conversation/+server'
    import LoadingIcon from '$lib/icons/loading.svelte'
	import TrashCanIcon from '$lib/icons/trash-can.svelte'
    import { onOutsideClick } from '../../../../actions/onOutsideClick'
    import { scale, fly } from 'svelte/transition'
    import BlockIcon from '$lib/icons/error.svelte'
    import { portal } from 'svelte-portal'
    import { documentScrollLock } from '../../../../actions/documentScrollLock'
	import Cropper from 'svelte-easy-crop'
    import AppConsts from '../../../../AppConsts'

	let { data, children }: PageProps & { children: Snippet } = $props()

    let id = $derived(data.profile?.id)!
    let name = $derived(data.profile?.name)
    let handle = $derived(data.profile?.handle)
    let joinTimestamp = $derived(data.profile?.joinDate)

    let isLocalUserFollowing = $derived(data.profile?.isFollowing)!

    let followers = $derived(data.profile?.followers!)
    let following = $derived(data.profile?.following!)

    let joinDate = $derived(new Date(joinTimestamp!))

    const compactNumberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

    let isBlocked = $derived(data.profile?.isBlocked)

    let isFollowedByLocalUser = $state(false)

    let isLocalUserProfile = $derived(data.localUserHandle === data.profile?.handle)

    let avatarUrl = $derived(`/api/users/${id}/avatar`)

    let description = $derived(data.profile?.description)
    let date = $derived(`Since ${joinDate.toLocaleDateString('default', { year: 'numeric', month: 'short' })}`)

    let showMoreMenu = $state(false)

    let awaitingForMessageRequest = $state(false)

    function onMessageRequest() {
		if(awaitingForMessageRequest) {
			return
        }

        const formData = new FormData()

        formData.set('user', id!)

        fetch('/api/conversation', {
            method: 'POST',
            body: formData,
        }).then(async (response) => {
			if(!response.ok) {
				return
            }

			if(response.redirected) {
				await goto(response.url)
			}
        }).finally(() => {
			awaitingForMessageRequest = false
        })

        awaitingForMessageRequest = true
    }

	let awaitingForBlockRequest = $state(false)

	function onBlockSwitchRequest() {
		if(awaitingForBlockRequest) {
			return
        }

		if(isBlocked) {
			fetch(`/api/users/${id}/block`, {
				method: 'DELETE',
			}).then(async (response) => {
				if (!response.ok) {
					return
				}

				isBlocked = false
			}).finally(() => {
				awaitingForBlockRequest = false
			})
		} else {
			fetch(`/api/users/${id}/block`, {
				method: 'POST',
			}).then(async (response) => {
				if (!response.ok) {
					return
				}

                isBlocked = true
			}).finally(() => {
				awaitingForBlockRequest = false
			})
		}

        awaitingForBlockRequest = true
    }

	let showBackgroundEditor = $state(false)

    function onBackgroundImageFileChange() {}
</script>

<svelte:head>
    <title>{AppConsts.PROJECT_NAME} – {name} (@{handle})</title>
</svelte:head>

<div class="bg-white/65 rounded-4xl overflow-clip" style="box-shadow: 0px 2px 15px rgba(0,0,0,0.05);
  backdrop-filter: blur(2.5px);
">
    <div class="flex flex-col w-full min-h-34 bg-cover bg-center place-content-end">
        <label>
            {#if isLocalUserProfile}
                <input
                    type="file"
                    accept="image/*"
                    onchange={onBackgroundImageFileChange}
                    class="hidden"
                >
            {/if}
            <img alt="" src={exampleBackground} class="absolute -translate-y-1/3 transition-all rounded-2xl scale-115 {isLocalUserProfile ? 'cursor-pointer active:scale-110' : ''}">
        </label>
        {#if !isLocalUserProfile}
            <div class="justify-end pt-4 pr-4 flex space-x-2 text-[10px] text-[#BABABA]
                [&_button]:active:scale-90 [&_button]:transition-all [&_button]:rounded-3xl [&_button]:will-change-transform
                [&_button]:cursor-pointer [&_button]:flex [&_button]:items-center [&_button]:space-x-2.5 [&_button]:h-8"
            >
                <!-- Note: Use form in the future if one would want to support nojs environments. -->
<!--                <form class="flex" method="post" action="/api/conversation">-->
<!--                    <input type="hidden" name="user" value={id}>-->
                    <button
                        onclick={onMessageRequest}
                        class="bg-white px-4 contents"
                        style="box-shadow: 0px 2px 4px rgba(0,0,0,0.1);"
                    >
                        <span class="size-4">
                            {#if awaitingForMessageRequest}
                                <LoadingIcon/>
                            {:else}
                                <SendIcon/>
                            {/if}
                        </span>
                        <span>Message</span>
                    </button>
<!--                </form>-->
                <UserFollowButton
                    bind:isLocalUserFollowing={isLocalUserFollowing}
                    bind:followersCount={followers}
                    userId={id}
                    locallyLoggedIn={!!data.localUserId}
                />
                <div class="relative">
                    <button
                        onclick={() => showMoreMenu = true}
                        class="bg-white shrink-0 p-0! aspect-square! text-black rounded-full! flex items-center justify-center"
                        style="box-shadow: 0px 2px 4px rgba(0,0,0,0.12);">
                        <span class="w-1/3">
                            <OverflowMenuHorizontalIcon/>
                        </span>
                    </button>
                    {#if showMoreMenu}
                        <div
                            use:onOutsideClick={() => showMoreMenu = false}
                            transition:scale
                            class="absolute select-none overflow-clip flex flex-col top-full mt-1 right-0 w-24 text-zinc-400 text-[11px] bg-white shadow-lg rounded-xl z-100 will-change-transform"
                        >
                            <button onclick={onBlockSwitchRequest} class="{!isBlocked ? 'text-red-300' : 'text-zinc-400'} rounded-lg! items-center flex space-x-2 justify-center font-normal p-5 cursor-pointer hover:bg-zinc-100 active:scale-95 transition-all will-change-transform">
                                <span class="size-4 flex self-center"><BlockIcon/></span>
                                <span>{!isBlocked ? "Block" : "Unblock"}</span>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
        <div class="size-28 pb-6 pl-6 pt-3">
            <div style="background-image: url({avatarUrl});"
                    class="cursor-pointer hover:scale-105 active:scale-90 will-change-transform transition-all bg-contain rounded-full border-3 border-white aspect-square! p-0! shrink-0 flex items-center justify-center"
            ></div>
        </div>
    </div>
    <div class="relative border-t-5 border-[#4db2ff] flex justify-between px-4 py-3 text-sm bg-white">
        <div>
            <p class="text-[#131313] font-bold">{name}</p>
            <p class="text-[#B1B1B1] font-light">@{handle}</p>
            <div class="flex space-x-2 my-2 text-[#C6C6C6] items-center select-none">
                <div class="w-5"><CalendarAddIcon/></div>
                <p class="font-normal text-xs">{date}</p>
            </div>
            <p class="text-[#B1B1B1] font-extralight text-sm ml-4">{description}</p>
        </div>
        <div class="flex flex-col items-end font-normal space-y-1">
            <p class="text-[#B1B1B1] text-xs font-light">{compactNumberFormatter.format(followers)} followers</p>
            <p class="text-[#BBB] text-xs font-extralight">following {compactNumberFormatter.format(following)}</p>
        </div>
    </div>
</div>
<div class="flex text-[#B1B1B1] bg-white p-1.5 rounded-2xl justify-center font-light text-xs" style="box-shadow: 0px 2px 10px rgba(0,0,0,0.08);">
    {#snippet entry(subPath, icon, label)}
        {@const segments = page.url.pathname.split('/').filter(Boolean)}
        {@const isCurrentPathActive =
            segments.length === 2 && segments.at(-1) === subPath ||
            (segments.length === 1 && subPath === '')
        }
        <a href="/@{handle}/{subPath}" class="flex-1 flex justify-center py-1.5 px-3 rounded-lg transition-all hover:bg-zinc-100">
            <div class="flex w-fit py-1 px-3 items-center space-x-1.5 {isCurrentPathActive ? 'border-b border-[#4db2ff]' : ''}">
                <div class="size-5">{@render icon()}</div>
                <p>{label}</p>
            </div>
        </a>
    {/snippet}
    {@render entry('', BlogIcon, "Posts")}
    <!--{@render entry('shares', "Shares")}-->
    {@render entry('media', MediaLibraryIcon, "Media")}
</div>
<div class="mb-64">
    {@render children()}
</div>

<!--{#if showBackgroundEditor}-->

<!--{/if}-->
