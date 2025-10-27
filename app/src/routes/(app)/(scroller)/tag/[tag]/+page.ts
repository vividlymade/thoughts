import HashtagIcon from '$lib/icons/hashtag.svelte'

export function load(event) {
    return {
        main: {
            headerIcon: HashtagIcon,
            headerText: event.params.tag.toLowerCase(),
        }
    }
}
