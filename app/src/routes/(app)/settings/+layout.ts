import UserSettingsIcon from '$lib/icons/user--settings.svelte'

export const _title = "Settings"

export async function load(event) {
    return {
        ...await event.parent(),
        main: {
            headerIcon: UserSettingsIcon,
            headerText: _title,
        },
    }
}
