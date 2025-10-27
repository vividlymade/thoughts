<script lang="ts">
    import UserFollowIcon from '$lib/icons/user--follow.svelte'
    import SubtractAlt from './icons/subtract--alt.svelte'
    import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	let {
		userId,
        isLocalUserFollowing = $bindable(),
        followersCount = $bindable(),
        locallyLoggedIn,
    }: {
		userId: string,
        isLocalUserFollowing: boolean,
        followersCount: number,
        locallyLoggedIn: boolean,
    } = $props()

    async function onClick(e: MouseEvent) {
		e.preventDefault()

		if(!locallyLoggedIn) {
            await goto('/signin')

            return
        }

		if(awaitingForResponse) {
			return
        }

		if(isLocalUserFollowing) {
			fetch(`/api/users/${userId}/follow`, {
				method: 'DELETE',
			}).then((response) => {
				if (!response.ok) {
					isLocalUserFollowing = true

                    followersCount++
				}
			}).finally(() => {
				awaitingForResponse = false
			})

            followersCount--
		} else {
			fetch(`/api/users/${userId}/follow`, {
				method: 'POST',
			}).then((response) => {
				if (!response.ok) {
					isLocalUserFollowing = false

                    followersCount--
				}
			}).finally(() => {
				awaitingForResponse = false
			})

            followersCount++
		}

		awaitingForResponse = true

        isLocalUserFollowing = !isLocalUserFollowing
    }

	let awaitingForResponse = $state(false)
</script>

<button
    onclick={onClick}
    class="{isLocalUserFollowing ? 'bg-white text-[#BABABA]' : 'bg-[#3c76ff] text-white'}  px-4 rounded-3xl active:scale-90 transition-all text-[10px] cursor-pointer flex items-center space-x-2.5 h-8"
    style="box-shadow: 0px 2px 4px rgba(0,0,0,0.1);"
>
    <span class="size-4 flex">
        {#if isLocalUserFollowing}
            <span class="flex" transition:slide={{ axis: 'x' }}>
                <SubtractAlt/>
            </span>
        {:else}
            <span class="flex" transition:slide={{ axis: 'x' }}>
                <UserFollowIcon/>
            </span>
        {/if}
    </span>
    <span class="flex">
        {#if isLocalUserFollowing}
            <span class="flex" transition:slide={{ axis: 'x' }}>
                Unfollow
            </span>
        {:else}
            <span class="flex" transition:slide={{ axis: 'x' }}>
                Follow
            </span>
        {/if}
    </span>
</button>
