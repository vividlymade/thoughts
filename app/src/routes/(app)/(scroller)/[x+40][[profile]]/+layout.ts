import UserIcon from '$lib/icons/user.svelte'

export function load(event) {
    return {
        ...event.data,
        main: {
            headerIcon: UserIcon,
            headerText: '@' + event.params.profile,
        }
    }
}
