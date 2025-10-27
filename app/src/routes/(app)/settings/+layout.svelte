<script>
	import { page } from '$app/state'
	import AccountTab from './account/+page.svelte'
	import UserIcon from '$lib/icons/user.svelte'
	import NotificationIcon from '$lib/icons/notification.svelte'
	import UserProfileAlt from '$lib/icons/user-profile--alt.svelte'
	import ContentView from '$lib/icons/content-view.svelte'
	// import { load as loadAccountPageMetaData } from './account/+page'
	// import { load as loadNotificationsPageMetaData } from './notifications/+page'
	// import { load as loadContentPageMetaData } from './content/+page'
	// import { load as loadPrivacyPageMetaData } from './privacy/+page'

	let { children } = $props()

	/** TODO: Find a more optimal way to keep the code DRY and not repeat the icon and header references in multiple places. */
	// let menuEntries = [
	//     loadAccountPageMetaData(),
	//     loadNotificationsPageMetaData(),
	//     loadContentPageMetaData(),
	//     loadPrivacyPageMetaData(),
	// ]
</script>

<svelte:head>
    <title>Settings – {page.data.settingsHeader.text}</title>
</svelte:head>

<div
        style="view-transition-name: settings;"
        class="flex flex-col mt-10 text-[#373737] items-center"
>
    <div class="flex-1 w-full max-w-300 flex">
        <div class="flex-2 flex justify-center">
            <nav
                class="flex flex-col bg-white flex-1 mr-12 max-w-72 rounded-2xl p-4 space-y-1 text-[11px] h-fit"
                style="box-shadow: 0px 2px 11px rgba(0,0,0,0.04);"
            >
                {#snippet entry(url, icon, text)}
                    <a href={url}
                       class="flex p-3.5 items-center duration-250 hover:rounded-xl active:scale-95 transition-all font-light
                        {page.url.pathname.startsWith(url) ? 'bg-zinc-100 rounded-xl' : 'hover:bg-black/3 rounded-lg'}"
                    >
                        <span class="size-5.5 flex mr-4">{@render icon()}</span> {text}
                    </a>
                {/snippet}
                {@render entry('/settings/account', UserIcon, "Account & Security")}
                {@render entry('/settings/notifications', NotificationIcon, "Notifications")}
                {@render entry('/settings/privacy', UserProfileAlt, "Privacy Controls")}
                <!--{@render entry('/settings/content', ContentView, "Content Preferences")}-->
            </nav>
        </div>

        <div class="flex-3 flex flex-col select-none bg-white rounded-4xl p-8 space-y-5 content" style="box-shadow: 0px 2px 11px rgba(0,0,0,0.04);">
            <div class="flex items-center space-x-3">
                <div class="size-5">{@render page.data.settingsHeader.icon()}</div>
                <p class="font-normal text-sm">{page.data.settingsHeader.text}</p>
            </div>
            <div class="ml-5 flex flex-col h-full">
                {@render children()}
            </div>
        </div>
        <!-- Dummy filler. -->
        <div class="flex-[0.75] hidden lg:block"></div>
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
        }
    }

    @keyframes fade-out {
        to {
            opacity: 0;
        }
    }

    @keyframes slide-from-right {
        from {
            transform: translateX(30px);
        }
    }

    @keyframes slide-to-left {
        to {
            transform: translateX(-30px);
        }
    }

    :root {
        animation: 400ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in;
    }

    :root::view-transition-old(content) {
        animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
        300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
    }

    :root::view-transition-new(content) {
        animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
        300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
    }
</style>
