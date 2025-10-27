import HomeIcon from '$lib/icons/home.svelte'

export function load(event) {
    return {
        ...event.data,
        main: {
            headerIcon: HomeIcon,
            headerText: "Home & Feed",
        },
    }
}
