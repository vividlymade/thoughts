<script lang="ts">
    import NextIcon from '$lib/icons/next--filled.svelte'
    import LoadingIcon from '$lib/icons/loading.svelte'

    let {
		onClick,
		isLoading,
        value,
        name,
    }: {
		onClick?: ((event: MouseEvent) => void),
		isLoading?: boolean,
        value?: string,
        name?: string,
    } = $props()
</script>

<div class="flex place-items-center justify-center self-end content-center size-12 text-[#4071E4]">
    <div class="flex absolute size-10 transition-all duration-500 {isLoading ? 'opacity-100 visible' : 'opacity-0'}">
        <LoadingIcon/>
    </div>
    <button aria-label="Next" name={name} value={value} onclick={onClick} disabled={isLoading} class="button size-12 {isLoading ? 'opacity-0 cursor-default!' : ''}">
        <NextIcon/>
    </button>
</div>
<style lang="postcss">
    @import '../shared.pcss';
</style>
