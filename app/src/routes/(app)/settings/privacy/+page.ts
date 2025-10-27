import UserProfileAlt from '$lib/icons/user-profile--alt.svelte'

export async function load(event) {
    return {
        ...event.data,
        settingsHeader: {
            icon: UserProfileAlt,
            text: "Privacy Controls",
        },
    }
}
