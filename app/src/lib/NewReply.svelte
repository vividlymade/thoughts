<script lang="ts">
    import SendIcon from './icons/send.svelte'
	import Post from '../post/Post.svelte'
	import Profile from '../Profile'
	import type { NewReplyResponse } from '../routes/api/posts/[id]/replies/+server'
	import ImageAttachment from '../post/ImageAttachment'
    import { onGlobalKeyUp } from '../actions/onGlobalKeyUp'

    let {
		localUserId,
        localUserName,
        localUserHandle,
		replyingToPost,
        onPostSuccess,
	}: {
		localUserId?: string,
        localUserName?: string,
        localUserHandle?: string,
		replyingToPost: Post,
        onPostSuccess: (post: Post) => void,
    } = $props()

    let content = $state("")

    let localUserAvatarSrc = $derived(`/api/users/${localUserId}/avatar`)

    function onReplySendRequest(e: Event) {
        if(awaitingForResponse) {
			return
		}

		const formData = new FormData()

        formData.set('content', content)

        /** TODO: Implement attachment support in the future. */

        // for(const attachment of attachments) {
        //     formData.append('attachment', attachment.file)
        // }

        fetch(`/api/posts/${replyingToPost.id}/replies`, {
			method: 'POST',
            body: formData,
        }).then(async (response) => {
			const result = await response.json() as NewReplyResponse

            const attachments: ImageAttachment[] = []

            const attachmentsIds = result.attachments

            for(const id of attachmentsIds) {
				attachments.push(new ImageAttachment(`/api/posts/attachment/${id}`))
            }

            onPostSuccess(
				new Post(
                    result.replyId,
                    new Profile('', `/api/users/${localUserId}/avatar`, localUserHandle, localUserName),
                    content,
                    attachments,
                    result.replyTime,
                    0,
                    [],
                    0,
                    0,
                    false,
                )
            )

            content = ""

            const target = e.target as HTMLInputElement

            target.blur()
        }).finally(() => {
			awaitingForResponse = false
        })

        awaitingForResponse = true
    }

	let isSendButtonHold = $state(false)
	let awaitingForResponse = $state(false)
</script>

<div class="flex w-full justify-between p-2 items-center space-x-5">
    <img class="size-8 ml-1 mr-3 rounded-full aspect-square border select-none" style="box-shadow: 0px 2px 5px rgba(0,0,0,0.08);" src={localUserAvatarSrc} alt="Avatar" draggable="false">
    <input
        onkeydown={(e) => {
            if(e.ctrlKey && e.key === 'Enter') {
                isSendButtonHold = true
            }
        }}
        use:onGlobalKeyUp={(e) => {
            if(e.key === 'Enter') {
                e.preventDefault()

                if(isSendButtonHold) {
                    isSendButtonHold = false

                    onReplySendRequest(e)
                }
            }
        }}
        bind:value={content}
        class="focus:scale-[1.015] duration-300 transition-all flex-1 outline-none border border-zinc-100 rounded-2xl p-2.5 px-3 font-light placeholder:text-[#B1B1B1] text-zinc-600 text-[11px]"
        placeholder="Write your comment here..." type="text" />
    <button
        onclick={onReplySendRequest}
        disabled={awaitingForResponse}
        class="active:scale-90 {isSendButtonHold ? 'scale-90' : ''} size-7.5 p-2 rounded-full bg-[#3C76FF] cursor-pointer active:scale-90 transition-all"
    >
        <SendIcon/>
    </button>
</div>
