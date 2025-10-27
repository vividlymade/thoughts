import ChatIcon from '$lib/icons/chat.svelte'

export const _title = "Direct Messages"

export async function load(event) {
    return {
        ...event.data,
        main: {
            headerIcon: ChatIcon,
            headerText: _title,
        },
    }
}
