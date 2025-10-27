import ContentView from '$lib/icons/content-view.svelte'

export function load() {
    return {
        settingsHeader: {
            icon: ContentView,
            text: "Content Preferences",
        },
    }
}
