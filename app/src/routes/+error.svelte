<script lang="ts">
    import { page } from '$app/state'
</script>
<div style="display: flex; justify-content: center; align-items: center; height: 100vh; color: #dbdbdb;">
    <p>{page.error?.message}</p>
</div>
