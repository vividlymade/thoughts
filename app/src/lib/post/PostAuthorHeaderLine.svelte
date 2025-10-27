<script lang="ts">
    let {
		handle,
        name,
    }: {
		handle: string,
        name: string,
    } = $props()
</script>

<a class="flex flex-row space-x-1.5 text-[11px] items-center" href="/@{handle}">
    <p class="text-[#373737] font-bold">{name}</p>
    <span class="text-[#BDBDBD]">·</span>
    <p class="text-[#BDBDBD]">@{handle}</p>
</a>
