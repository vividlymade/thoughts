<script lang="ts">
    import LoginIcon from '$lib/icons/login.svelte'
    import EmailIcon from '$lib/icons/email.svelte'
	import logoSrc from '$lib/images/logo.svg'
	import MethodButton from './MethodButton.svelte'
</script>

<svelte:head>
    <title>Thoughts – Sign in or Sign up</title>
</svelte:head>

<div class="flex-1 flex flex-col justify-center w-full h-full space-y-20">
    <a href="/#" class="absolute place-self-center z-10 inset-x-0 top-0 bottom-1/2 mx-auto">
        <img src={logoSrc} width="164" class="ml-5 drop-shadow-lg/1" alt="Logo" draggable="false">
    </a>
    <div class="relative w-110 h-fit flex flex-col content-center place-items-center place-self-center bg-white/90 rounded-2xl py-10 px-15 justify-self-center space-y-10" style="box-shadow: 0px 2px 50px rgba(0,0,0,0.05); backdrop-filter: blur(2.5px);">
        <h1 class="font-light text-[#0a0a0a] text-xl flex items-center">
            <span class="w-4.5 -ml-8 absolute"><LoginIcon/></span>
            Sign in or Sign up
        </h1>
        <div class="flex flex-col text-[#B1B1B1] w-64 font-extralight">
            <h2 class="font-extralight text-[#6B6B6B] place-self-center mb-2">Use one of the available methods</h2>

            <MethodButton text="Use an e-mail" href="/signin/email">
                {#snippet icon()}
                    <span class="flex size-5 mr-5"><EmailIcon/></span>
                {/snippet}
            </MethodButton>

            <hr class="text-[#E4E4E4] mx-10 my-2">

<!-- Note: This was left for 3rd party API signing-in integration. -->
<!--            <MethodButton text="Sign in with..." href="/signin/#">-->
<!--                {#snippet icon()}-->
<!--                    <img class="w-4 mr-3" alt="..." draggable="false">-->
<!--                {/snippet}-->
<!--            </MethodButton>-->
        </div>
    </div>
</div>
