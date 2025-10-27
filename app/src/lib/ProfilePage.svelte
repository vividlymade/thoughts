<script lang="ts">
    import PostType from '../post/PostType'
    import type Post from '../post/Post.svelte'

    let posts = [] as Post[]

    let newPostContentInput: HTMLInputElement

    function tryToSendNewPost() {
        if(newPostContentInput.value.length === 0) {
            return
        }

        let request = new XMLHttpRequest()

        request.open('POST', 'post/new')

        request.setRequestHeader('Content-type', 'application/json')

        request.send(JSON.stringify({
            content: newPostContentInput.value
        }))
    }
</script>
<div>
    <div class="background-picture"></div>
    <div class="picture"></div>
    <div class="new-post">
        <input class="content" bind:this={newPostContentInput} />
        <button onclick={tryToSendNewPost}>Send</button>
    </div>
    <div class="posts">
        {#each posts as post}
            <div class="post">
                {#if post.type === PostType.ROOT_POST}
                {post.author}
                {/if}
                <!--{:else if post.type === PostType.POST_RESPONSE}-->
                <!--{:else if post.type === PostType.SHARED_POST}-->
                <!--{/if}-->
            </div>
        {/each}
    </div>
</div>