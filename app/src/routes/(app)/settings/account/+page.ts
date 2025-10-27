import UserIcon from '$lib/icons/user.svelte'

export function load() {
    return {
        settingsHeader: {
            icon: UserIcon,
            text: "Account & Security",
        },
    }
}
