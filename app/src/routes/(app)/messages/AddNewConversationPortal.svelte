<script lang="ts">
	import { portal } from 'svelte-portal'
	import { fly, scale, slide, blur } from 'svelte/transition'
	import { onOutsideClick } from '../../../actions/onOutsideClick'
	import FormTextInput from '$lib/modals/FormTextInput.svelte'
    import SearchIcon from '$lib/icons/search.svelte'
    import SendIcon from '$lib/icons/send.svelte'
    import { onGlobalKeyDown } from '../../../actions/onGlobalKeyDown'
	import { onDestroy } from 'svelte'
	import Profile from '../../../Profile'
    import LoadingIcon from '$lib/icons/loading.svelte'
	import type { UsersSearchResponse } from '../../api/search/users/+server'
    import { flip } from 'svelte/animate'
	import { goto } from '$app/navigation'

	const DEBOUNCE_TIME = 150

	let {
		open = $bindable()
	}: {
		open: boolean
	} = $props()

    let searchValue = $state("")
    let awaitingForResponse = $state(false)

    let searchResults: Profile[] = $state([])

    let debounceTimer: ReturnType<typeof setTimeout> | undefined = $state()

    function onInput() {
		/** Clears the current search. */
		if(searchResults.length > 0) {
			searchResults = []
		}

        clearTimeout(debounceTimer)

        debounceTimer = setTimeout(() => {
            if(searchValue.length === 0) {
                return
            }

            let url = '/api/search/users'

            const queryString = new URLSearchParams({
                q: searchValue,
            }).toString()

            url += '?' + queryString

            fetch(url, {
                method: 'GET',
            }).then(async (response) => {
                const newResults = await response.json() as UsersSearchResponse

                for(const entry of newResults.users) {
                    const profile = new Profile(
						entry.id,
                        `/api/users/${entry.id}/avatar`,
                        entry.handle,
                        entry.name,
                    )

                    profile.followersCount = entry.followers

                    searchResults.push(
                        profile
                    )
                }
            }).finally(() => {

            })

            debounceTimer = undefined
        }, DEBOUNCE_TIME)
    }

	onDestroy(() => {
		clearTimeout(debounceTimer)
    })

    let pendingLoad = $derived(!!debounceTimer)

    const compactNumberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })
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
    <div in:scale={{ duration: 500 }}
         out:scale={{ duration: 250 }}
         use:onOutsideClick={() => open = false}
         class="flex flex-col bg-white w-md rounded-3xl p-8 text-xs text-zinc-600 select-none items-center space-y-6 will-change-transform h-112"
    >
        <h1 class="text-sm font-semibold flex space-x-3 self-start">
            <span class="flex size-5">
                <SendIcon/>
            </span>
            <span>Creating a new conversation</span>
        </h1>
        <FormTextInput
            icon={SearchIcon}
            placeholder="Search for people you want to message..."
            label=""
            bind:value={searchValue}
            isRequired={true}
            onInput={onInput}
        />
        <div class="flex flex-col flex-1 w-full">
            {#each searchResults as result(result.id)}
                <div animate:flip>
                    <button
                        aria-label={result.handle}
                        onclick={() => {
							const formData = new FormData()

                            formData.set('user', result.id)

							fetch('/api/conversation', {
								method: 'POST',
								body: formData,
							}).then(async (response) => {
								if(!response.ok) {
                                    return
								}

								if(response.redirected) {
									open = false
								    await goto(response.url)
								}
							})
                        }}
                        transition:slide
                        class="flex items-center justify-between text-[11px] p-5 hover:bg-zinc-100 active:scale-95 cursor-pointer rounded-2xl transition-all w-full will-change-transform"
                    >
                        <span class="flex space-x-3 items-center">
                            <img alt="{result.handle}" class="block size-10 rounded-full" src={result.pictureURL} />
                            <span class="flex flex-col space-x-1.5">
                                <span class="block text-[#373737] font-bold">{result.name}</span>
                                <span class="block text-[#BDBDBD]">@{result.handle}</span>
                            </span>
                        </span>
                        <span class="flex text-[#BDBDBD]">{compactNumberFormatter.format(result.followersCount)} followers</span>
                    </button>
                </div>
            {:else}
                {#if awaitingForResponse}
                    <div class="h-full self-center place-content-center">
                        <div class="flex size-8">
                            <LoadingIcon/>
                        </div>
                    </div>
                {:else}
                    <p class="text-zinc-300 my-5 font-light self-center mx-12 text-center flex flex-col">
                        {#if searchValue.length > 0}
                            <span transition:slide>Whoops... Nothing was found :(</span>
                        {:else}
                            <span transition:slide>Let's start searching!</span>
                        {/if}
                    </p>
                {/if}
            {/each}
        </div>
    </div>
</div>
