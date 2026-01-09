<script lang="ts">
import WarningIcon from '$lib/icons/warning--alt--filled.svelte'
import { portal } from 'svelte-portal'
import { fly, scale, slide, blur } from 'svelte/transition'
import { onMount } from 'svelte'
import BlogIcon from '$lib/icons/blog.svelte'
import AddCommentIcon from '$lib/icons/add-comment.svelte'
import UserFollowIcon from '$lib/icons/user--follow.svelte'
import { goto } from '$app/navigation'
import { onGlobalKeyDown } from '../../../../../actions/onGlobalKeyDown'
import AppConsts from '../../../../../AppConsts'

let {
	open = $bindable(),
    localUserId,
    // accountRemovalSafetyInterval
}: {
	open: boolean,
    localUserId: string,
    // accountRemovalSafetyInterval: ReturnType<typeof setInterval>
} = $props()

let removalSafetyTimer: ReturnType<typeof setInterval> | undefined = $state()
let removalSafetyCounter: number = $state(0)
let awaitingForResponse = $state(false)

const confirmAbortController = new AbortController()

function onAcceptButtonClick() {
    fetch('/api/settings/account/removal/confirm', {
		method: 'DELETE',
        signal: confirmAbortController.signal,
    }).then(async (response) => {
		if(!response.ok) {
			return
        }

        if(response.redirected) {
            await goto(response.url)
        }
    }).finally(() => {
		awaitingForResponse = false
    })

    awaitingForResponse = true
}

function onCancelButtonClick() {
    open = false

    if(!confirmAbortController.signal.aborted) {
		confirmAbortController.abort()

        fetch('/api/settings/account/removal/request', {
            method: 'POST',
        }).finally(() => {
			awaitingForResponse = false
        })
    }

    clearInterval(removalSafetyTimer)
}

onMount(() => {
    removalSafetyCounter = AppConsts.ACCOUNT_REMOVAL_GRACE_PERIOD / 1000

    fetch('/api/settings/account/removal/request', {
		method: 'DELETE',
    }).then((response) => {
		if(!response.ok) {
			/** TODO: Handle invalid responses. */

			return
        }

		removalSafetyTimer = setInterval(() => {
            if(removalSafetyCounter-- === 0) {
                clearInterval(removalSafetyCounter)
            }
        }, 1000)
    }).finally(() => {
		/** TODO: Add loading animation. */
    })
})
</script>

<div
    use:portal
    use:onGlobalKeyDown={(e) => {
		if(e.key === 'Escape') {
            open = false
        }
    }}
    in:fly={{ duration: 800 }} out:fly
    class="fixed top-0 left-0 right-0 bottom-0 bg-black/45 backdrop-blur-[1.5px] flex items-center justify-center"
>
    <div in:slide={{ duration: 500 }} out:scale
        class="flex flex-col bg-white w-md rounded-3xl p-8 text-xs text-zinc-600 select-none items-center space-y-6 will-change-transform"
    >
        <div class="flex flex-col space-y-3 w-full">
            <div class="flex flex-col space-y-2 self-center items-center">
                <div class="size-6 text-red-400">
                    <WarningIcon/>
                </div>
                <p class="font-semibold text-sm text-black">Are you sure?</p>
            </div>
            <div class="space-y-2.5">
                <p class="font-light">All of your data is going to be erased from the platform.</p>
                <p class="font-light">This includes but is not limited to:</p>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    {#snippet entry(icon, text)}
                        <li>
                            <div class="inline-flex align-middle items-center space-x-3">
                                <div class="size-6">{@render icon()}</div>
                                <p>{text}</p>
                            </div>
                        </li>
                    {/snippet}
                    {@render entry(BlogIcon, "Posts you have posted.")}
                    {@render entry(AddCommentIcon, "Replies you have posted under posts.")}
                    {@render entry(UserFollowIcon, "Profiles you have been following.")}
                </ul>
            </div>
        </div>

        <img
            src="/api/users/{localUserId}/avatar"
            draggable="false"
            class="rounded-full size-20 self-center shadow-lg border-4 border-white"
            alt=""
        >

        <div class="space-x-3.5 font-normal text-[11px]
                *:p-4 *:rounded-full *:shadow-lg *:not-disabled:cursor-pointer *:min-w-16 *:transition-all *:not-disabled:active:scale-95 *:will-change-transform"
        >
            <button
                onclick={onCancelButtonClick}
                class="bg-white hover:bg-zinc-200 "
                disabled={awaitingForResponse}
            >
                No, take me back
            </button>
            <button
                onclick={onAcceptButtonClick}
                class="bg-red-300 hover:bg-red-400 disabled:bg-zinc-300 text-white"
                disabled={removalSafetyCounter > 0 || awaitingForResponse}
            >
                Yes, I'm sure {removalSafetyCounter > 0 ? `(${removalSafetyCounter})` : ''}
            </button>
        </div>
    </div>
</div>
