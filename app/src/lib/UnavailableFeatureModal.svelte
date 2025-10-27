<script lang="ts">
    import { scale } from 'svelte/transition'
    import { onOutsideClick } from '../actions/onOutsideClick'

    let {
		show = $bindable(),
	}: {
		show: boolean,
    } = $props()
</script>

<button
    use:onOutsideClick={() => show = false}
    onclick={() => show = false}
    transition:scale
    class="absolute py-3 px-4 w-max rounded-2xl bg-white text-[11px] font-thin z-100 shadow-2xl bottom-0 translate-y-1/1"
    style="box-shadow: 0px 2px 15px rgba(0,0,0,0.08);"
>
    Unfortunately this feature is currently unavailable!
</button>
