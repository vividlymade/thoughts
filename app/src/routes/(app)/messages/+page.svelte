<script lang="ts">
    import PostElement from '$lib/Post.svelte'
    import Post from '../../../post/Post.svelte'
    import Profile from '../../../Profile'
    import PostType from '../../../post/PostType'
    import logoSrc from '$lib/images/logo.svg'
    import MoreIcon from '$lib/icons/more.svelte'
    import avatar1Src from '$lib/images/start/examples/avatars/avatar_1.jpg'
    import avatar2Src from '$lib/images/start/examples/avatars/avatar_2.jpg'
    import avatar3Src from '$lib/images/start/examples/avatars/avatar_3.png'
    import avatar4Src from '$lib/images/start/examples/avatars/avatar_4.png'
    import attachmentImage1Src from '$lib/images/start/examples/attachments/images/image_1.jpg'
    import attachmentImage2Src from '$lib/images/start/examples/attachments/images/image_2.jpg'
	import ImageAttachment from '../../../post/ImageAttachment'
	import SearchIcon from '$lib/icons/search.svelte'
    import NotificationNewIcon from '$lib/icons/notification--new.svelte'
    import NotificationIcon from '$lib/icons/notification.svelte'
    import OverflowMenuHorizontalIcon from '$lib/icons/overflow-menu--horizontal.svelte'
    import ImageIcon from '$lib/icons/image.svelte'
    import EmojiIcon from '$lib/icons/face--satisfied.svelte'
    import GIFIcon from '$lib/icons/GIF.svelte'
    import SendIcon from '$lib/icons/send.svelte'
	import type Attachment from '../../../post/Attachment'
    import iconSrc from '$lib/images/icon.svg'
    import { slide, scale } from 'svelte/transition'
	import AddNewConversationPortal from './AddNewConversationPortal.svelte'
    import UserFollowIcon from '$lib/icons/user--follow.svelte'

    let show = $state(false)

    let showAddNewConversationModal = $state(false)

    $effect(() => {
		show = true
    })
</script>

{#if show}
    <div transition:slide={{ duration: 800 }}
         class="flex flex-col h-full select-none will-change-transform"
    >
        <!-- Animation wrapper. -->
        <div transition:scale={{ duration: 1000 }}
             class="place-content-center items-center justify-items-center flex flex-col space-y-12 w-full h-full"
        >
            <img
                src={iconSrc} alt="Icon" draggable="false"
                class="h-9 drop-shadow-sm/15 hover:scale-115 transition-all duration-500"
            >
            <p class="text-[#373737] text-lg font-extralight drop-shadow-sm/15">
                Hey, it looks like you haven't texted anyone yet!
            </p>
            <p class="text-[#979797] text-sm font-extralight drop-shadow-sm/15">
                You can start at any moment...
            </p>
            <button
                onclick={() => showAddNewConversationModal = true}
                class="flex p-3 px-5 text-xs items-center space-x-3 bg-[#4C86FF] rounded-2xl font-extralight cursor-pointer hover:bg-[#5C96FF] active:scale-90 will-change-transform transition-all duration-200"
            >
                <span class="flex size-4"><UserFollowIcon/></span>
                <span>Start texting now!</span>
            </button>
        </div>
    </div>
{/if}

{#if showAddNewConversationModal}
    <AddNewConversationPortal bind:open={showAddNewConversationModal} />
{/if}

