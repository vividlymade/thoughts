<script lang="ts">
    import '../app.css'
	import Background from '$lib/Background.svelte'
    import { onNavigate } from '$app/navigation'
    import favIcon from '$lib/images/icon.svg'

    let { children } = $props()

    onNavigate((navigation) => {
        if (!document.startViewTransition) return

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve()

                await navigation.complete
            })
        })
    })
</script>

<svelte:head>
    <link rel="icon" href={favIcon} />
</svelte:head>

<Background/>

<div class="content">
    {@render children()}
</div>

<style type="text/css">
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
        animation:
            90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
            300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
    }

    :root::view-transition-new(content) {
        animation:
            210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
            300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
    }

    .content {
        display: flex;
        flex-direction: column;
        view-transition-name: content;
        min-height: 100vh;
    }
</style>
