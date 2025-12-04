<script lang="ts">
    import PostElement from '$lib/Post.svelte'
    import Post from '../../post/Post.svelte'
    import Profile from '../../Profile'
    import logoSrc from '$lib/images/logo.svg'
    import MoreIcon from '$lib/icons/more.svelte'
    import avatar1Src from '$lib/images/start/examples/avatars/avatar_1.jpg'
    import avatar2Src from '$lib/images/start/examples/avatars/avatar_2.jpg'
    import avatar3Src from '$lib/images/start/examples/avatars/avatar_3.png'
    import attachmentImage1Src from '$lib/images/start/examples/attachments/images/image_1.jpg'
    import attachmentImage2Src from '$lib/images/start/examples/attachments/images/image_2.jpg'
	import ImageAttachment from '../../post/ImageAttachment'
	import AppConsts from '../../AppConsts'
</script>

<svelte:head>
    <title>{AppConsts.PROJECT_NAME} – discover what others talk about and share your own thoughts!</title>
</svelte:head>

<!-- Dummy background posts. -->
<div class="-z-15 select-none pointer-events-none">
    <!-- Main post wrapper. -->
    <div class="absolute left-2/19 top-3/10 floating scale-80 origin-left will-change-transform">
        <!-- Rotation wrapper. -->
        <div class="-rotate-7">
            <PostElement post={
                new Post(
					'0',
                    new Profile('', avatar1Src, "artsy_", "Emily =D"),
                    `
    I made this last night after telling myself I was “just going to clean the desk”.
    Acrylic + coffee + bad lighting. still like how it turned out #art
                    `.trim(),
                    [new ImageAttachment(attachmentImage1Src)],
					Date.now() - 500000,
					0,
					[],
                    207,
                    10,
                    true,
                )
            } />
        </div>
    </div>

    <!-- Main post wrapper. -->
    <div class="absolute right-3/24 top-3/16 floating scale-85 origin-right will-change-transform blur-[0.8px] w-lg drop-shadow-2xl/5">
        <!-- Rotation wrapper. -->
        <div class="rotate-5">
            <PostElement post={
                new Post(
					'1',
                    new Profile('', avatar2Src, "fl4mingo", "Duhhhh"),
                    `wait is this the app where we yell at each other?`.trim(),
                    [],
					Date.now() - 900000,
					0,
					[],
                    15,
                    1,
                    false,
                )
            } />
        </div>
    </div>

    <!-- Main post wrapper. -->
    <div class="absolute right-1/16 top-5/11 floating scale-80 origin-right will-change-transform drop-shadow-2xl/5">
        <!-- Rotation wrapper. -->
        <div class="rotate-4">
            <PostElement post={
                new Post(
					'2',
                    new Profile('', avatar3Src, "garlic_bread01", "Emily Ross"),
                    `i don’t know much about plants but i like checking on these two every morning #plants`.trim(),
                    [new ImageAttachment(attachmentImage2Src)],
					Date.now() - 15000000,
					0,
					[],
                    40,
                    3,
                    false,
                )
            } />
        </div>
    </div>
</div>

<!-- Main menu. -->
<div class="flex space-x-4 p-7 place-content-end z-10 h-fit">
    <button class="button w-9 h-9 bg-white rounded-full transition-transform active:scale-90 place-items-center mr-10 select-none p-3 text-neutral-400"><MoreIcon/></button>
    <a href="/signin" class="button transition-transform rounded-2xl bg-white text-neutral-400 px-6 text-[10px] active:scale-90 w-fit content-center">Sign in</a>
    <a href="/signin" class="button transition-transform rounded-2xl bg-[#4071E4] px-6 text-[10px] active:scale-90 w-fit content-center">Sign up</a>
</div>

<div class="flex flex-col content-center place-items-center self-center space-y-28 mt-6 relative">
    <div class="flex flex-col items-center place-items-center space-y-3">
        <a href="/">
            <img src={logoSrc} width="256" class="ml-12 drop-shadow-xs" alt="Logo" draggable="false">
        </a>
        <h2 class="font-extralight text-md text-[#535353]">Sign in, type in and share – easy as that!</h2>
    </div>

    <div class="flex flex-col space-y-22 items-center">
        <div class="p-6.5 px-10 bg-white/80 rounded-4xl backdrop-blur-xs" style="box-shadow: 0px 4px 50px rgba(0,0,0,0.11);">
            <h2 class="font-extralight text-[#535353] text-[16px]">
                Discover what others talk about and share your own <span class="text-[#5081D4] font-light">thoughts!</span>
            </h2>
        </div>

        <a href="/signin" class="button will-change-transform rounded-[21px] bg-[#4071E4] hover:bg-[#5081D4] p-4 px-12 text-xs active:scale-90 w-fit">Start now!</a>
    </div>
</div>

<style>
    @import '../../shared.pcss';

    .floating:nth-child(1) { animation-delay: 0s; }
    .floating:nth-child(2) { animation-delay: -0.5s; }
    /*.floating:nth-child(3) { animation-delay: -2s; }*/
    /*.floating:nth-child(4) { animation-delay: -3s; }*/
    /*.floating:nth-child(5) { animation-delay: -3.5s; }*/

    .floating {
      display: inline-block;
      animation: float 5s ease-in-out infinite;
    }

    @keyframes float {
      0%   { transform: translateY(0); }
      50%  { transform: translateY(-8px); }
      100% { transform: translateY(0); }
    }
</style>
