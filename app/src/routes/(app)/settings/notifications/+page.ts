import NotificationIcon from '$lib/icons/notification.svelte'

export function load(event) {
    return {
        ...event.data,
        settingsHeader: {
            icon: NotificationIcon,
            text: "Notifications",
        },
    }
}
