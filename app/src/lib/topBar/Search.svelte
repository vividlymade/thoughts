<script lang="ts">
    import SearchIcon from '$lib/icons/search.svelte'
	import { onDestroy } from 'svelte'
	import Profile from '../../Profile'
    import { scale, fade } from 'svelte/transition'
	import type { SearchSuggestionsResponse } from '../../routes/api/search/suggestions/+server'
    import LoadingIcon from '$lib/icons/loading.svelte'
    import { onOutsideClick } from '../../actions/onOutsideClick'
	import AppConsts from '../../AppConsts'

	const DEBOUNCE_TIME = 150

    let searchPhrase = $state("")

    let debounceTimer: ReturnType<typeof setTimeout> | undefined = $state()

    let suggestions: Profile[] = $state([])

    const compactNumberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact' })

    function onInput() {
		/** Clears the suggestions. */
		if(suggestions.length > 0) {
			suggestions = []
		}

        clearTimeout(debounceTimer)

        debounceTimer = setTimeout(() => {
            if(searchPhrase.length === 0) {
                return
            }

            let url = '/api/search/suggestions'

            const queryString = new URLSearchParams({
                q: searchPhrase,
            }).toString()

            url += '?' + queryString

            fetch(url, {
                method: 'GET',
            }).then(async (response) => {
                const newSuggestions = await response.json() as SearchSuggestionsResponse

                /** TODO: Debug suggestion duplications. */
                // console.log(newSuggestions)

                for(const suggestion of newSuggestions) {
                    const profile = new Profile(
						'',
						`/api/users/${suggestion.id}/avatar`,
                        suggestion.handle,
                        suggestion.name
                    )

                    profile.followersCount = suggestion.followers

                    suggestions.push(
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

    let isFocused = $state(false)
    let showSuggestionResults = $derived(isFocused && searchPhrase.length > 0)
    let pendingLoad = $derived(!!debounceTimer)
</script>

<div class="flex-1 flex flex-col justify-center">
    <form
        action="/search"
    >
        <div class="flex border border-[#eeeeee]/70 rounded-3xl bg-white [box-shadow:0px_0px_0px_1px_#F1F1F1]
            focus-within:shadow-[0px_0px_3px_#4DB2FF] focus-within:scale-104 will-change-auto
            items-center max-w-56 focus-within:max-w-64 transition-all duration-500"
        >
            <label class="flex-1 flex pl-2.5 select-none box-content items-center">
                <span class="flex size-5"><SearchIcon/></span>
                    <input
                           onclick={(e) => e.stopPropagation()}
                           onfocus={(e) => { isFocused = true } }
                           placeholder="Search {AppConsts.PROJECT_NAME}..." oninput={onInput} bind:value={searchPhrase} type="search" name="q" autocomplete="off" pattern=".*\S.*" required
                           class="outline-none text-[11px] p-2.5 flex-1 placeholder:text-[#B1B1B1] text-[#414141] font-extralight
                           [&::-webkit-search-cancel-button]:cursor-pointer"
                    >
            </label>
        </div>
        {#if showSuggestionResults}
            <div
                transition:scale
                class="flex flex-col absolute w-92 top-16 bg-white/98 rounded-2xl shadow-xl text-xs overflow-clip will-change-transform min-h-32"
                use:onOutsideClick="{() => isFocused = false}"
            >
                <div class="flex-1 flex flex-col items-center">
                    {#each suggestions as result}
                        <a
                           onclick={() => { isFocused = false }}
                           aria-label={result.handle}
                           class="flex items-center justify-between text-[11px] p-5 hover:bg-zinc-100 active:scale-90 rounded-2xl transition-all w-full"
                           href="/@{result.handle}"
                        >
                            <div class="flex space-x-3 items-center">
                                <img alt="{result.handle}" class="size-10 rounded-full" src={result.pictureURL} />
                                <div class="flex flex-col space-x-1.5">
                                    <p class="text-[#373737] font-bold">{result.name}</p>
                                    <p class="text-[#BDBDBD]">@{result.handle}</p>
                                </div>
                            </div>
                            <p class="text-[#BDBDBD]">{compactNumberFormatter.format(result.followersCount)} followers</p>
                        </a>
                    {:else}
                        {#if pendingLoad}
                            <div class="flex-1 text-[#9D9D9D] font-light select-none items-center place-content-center size-8"><LoadingIcon/></div>
                        {:else}
                            <div class="flex-1 flex flex-col select-none self-center justify-center text-[#8D8D8D] font-light my-5 space-y-2">
                                <p class="text-center mx-8 wrap-anywhere font-extralight">Unfortunately no results were found</p>
                            </div>
                        {/if}
                    {/each}
                </div>
                {#if !pendingLoad}
                    <button
                        onclick={() => isFocused = false}
                        class="p-2.5 text-[#BDBDBD] cursor-pointer hover:bg-zinc-50 transition-all active:scale-95 rounded-2xl font-light text-xs"
                    >
                        Show more
                    </button>
                {/if}
            </div>
        {/if}
    </form>
</div>
