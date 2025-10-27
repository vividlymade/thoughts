import HomeIcon from '$lib/icons/home.svelte'

export function load() {
    return {
        main: {
            headerIcon: HomeIcon,
            headerText: "Welcome",
        },
    }
}
