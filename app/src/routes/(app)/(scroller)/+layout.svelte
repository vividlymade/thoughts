<script>
    let { children } = $props()
</script>
<div class="flex flex-col self-center w-lg space-y-5 mt-5 flex-1">
    {@render children()}
</div>
