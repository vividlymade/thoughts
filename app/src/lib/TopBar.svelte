<script lang="ts">
import logoSrc from '$lib/images/logo.svg'
import OverflowMenuHorizontalIcon from '$lib/icons/overflow-menu--horizontal.svelte'
import ChatIcon from '$lib/icons/chat.svelte'
import UserSettingsIcon from '$lib/icons/user--settings.svelte'
import LogoutIcon from '$lib/icons/logout.svelte'
import { page } from '$app/state'
import { flip } from 'svelte/animate'
import { slide, scale } from 'svelte/transition'
import Search from '$lib/topBar/Search.svelte'
import { onOutsideClick } from '../actions/onOutsideClick'
import NotificationsButton from '$lib/topBar/NotificationsButton.svelte'
import AppConsts from '../AppConsts'

let {
	localUserId,
    localUserHandle,
    localUserName,
}: {
	localUserId?: string,
	localUserHandle?: string,
	localUserName?: string,
} = $props()

let localUserAvatarSrc = $derived(`/api/users/${localUserId}/avatar`)

let showProfileMenu = $state(false)

$effect(() => {
	showAnimated = true
})

let showAnimated = $state(false)

const isLoggedIn = $derived(localUserId !== undefined)

function toggleProfileMenu() {
	showProfileMenu = !showProfileMenu
}
</script>

<div style="view-transition-name: top-bar;" class="sticky top-0 flex z-1000 h-14 items-center justify-between bg-white drop-shadow-sm/5 border border-[#EFEFEF]">
    <div class="flex-2 flex flex-row items-center space-x-5">
        <a href="{isLoggedIn ? '/home' : '/#'}" class="flex w-fit h-fit ml-8 active:scale-95 transition-all drop-shadow-md/4">
            <img src={logoSrc} class="w-34" alt={AppConsts.PROJECT_NAME} draggable="false">
        </a>
        <Search/>
    </div>
    <div class="flex-1 h-full p-0!">
        <div class="flex-1 h-full flex justify-center items-center p-0!">
            <div class="flex flex-1 box-content px-5 max-w-fit min-h-full justify-self-center select-none border-b-2 border-[#4DB2FF] text-[#B1B1B1] text-xs space-x-2 items-center">
                {#if showAnimated}
                    <span transition:scale={{ duration: 500 }} class="block size-5">{@render page.data.main.headerIcon?.()}</span>
                {/if}
                <p>{page.data.main.headerText}</p>
            </div>
        </div>
    </div>

    <!-- Menu bar. -->
    <div class="flex-2">
        {#if !page.url.pathname.startsWith('/welcome') && isLoggedIn}
            <div class="justify-end mr-10 flex items-center space-x-5">
                {#if !page.url.pathname.startsWith('/messages')}
                    <a
                       href="/messages"
                       draggable="false"
                       class="size-6 button drop-shadow-xs text-[#A8A8A8] hover:text-[#686868] active:scale-90 transition-all"
                    >
                        <ChatIcon/>
                    </a>
                {/if}
                <NotificationsButton/>
                <div>
                    <button onclick={toggleProfileMenu} class="rounded-full">
                        <span class="block active:scale-90 transition-all will-change-transform">
                            <img src={localUserAvatarSrc} alt="Avatar" draggable="false" class="size-9 rounded-full aspect-square cursor-pointer" style="box-shadow: 0px 2px 5px rgba(0,0,0,0.1);">
                        </span>
                    </button>
                    {#if showProfileMenu}
                        <div
                            use:onOutsideClick={() => showProfileMenu = false}
                            transition:scale
                            class="mt-3 absolute min-w-56 rounded-2xl shadow-lg/2 -translate-x-4/5 bg-white text-xs"
                        >
                            <a href="/@{localUserHandle}" onclick={() => showProfileMenu = false} class="flex py-4 px-8 space-x-2 hover:bg-zinc-50 active:scale-90 rounded-2xl transition-all will-change-transform items-center">
                                <img alt="" src={localUserAvatarSrc} draggable="false" class="rounded-full size-10">
                                <div class="flex flex-col">
                                    <p class="text-[#373737] font-bold">{localUserName}</p>
                                    <p class="text-[#B1B1B1] font-light">@{localUserHandle}</p>
                                </div>
                            </a>
                            <hr class="mx-5 text-[#E8E8E8]">
                            <div class="px-4 py-4 font-light">
                                {#snippet entry(label, icon, path)}
                                    <a onclick={() => showProfileMenu = false} href={path} class="flex space-x-2.5 px-12 py-3 hover:bg-zinc-50 active:scale-90 transition-all will-change-transform rounded-xl text-[#B1B1B1] items-center">
                                        <div class="size-5">
                                            {@render icon()}
                                        </div>
                                        <p>{label}</p>
                                    </a>
                                {/snippet}

                                {@render entry("Settings", UserSettingsIcon, '/settings')}
                                {@render entry("Logout", LogoutIcon, '/logout')}
                            </div>
                        </div>
                    {/if}
                </div>
<!--                <div class="active:scale-90 transition-all will-change-transform">-->
<!--                    <button class="cursor-pointer flex bg-white size-10 rounded-xl drop-shadow-xl/2 place-items-center place-content-center text-[#5C5C5C] flex-col">-->
<!--                        <span class="size-4 block"><OverflowMenuHorizontalIcon/></span>-->
<!--                    </button>-->
<!--                </div>-->
            </div>
        {/if}
    </div>
</div>
