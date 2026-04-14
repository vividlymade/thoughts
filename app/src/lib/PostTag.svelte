<script lang="ts">
    let {
		value,
    }: {
		value: string,
    } = $props()
</script>

<a href="/search?q={encodeURIComponent('#') + value}" class="font-medium cursor-pointer px-0.75 text-[#5381ED] transition-all rounded-md hover:bg-zinc-200">#{value}</a>
