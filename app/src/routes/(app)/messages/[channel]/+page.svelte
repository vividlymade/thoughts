<script lang="ts">
    import type { PageProps } from './$types'
	import { page } from '$app/state'
    import avatar2Src from '$lib/images/start/examples/avatars/avatar_2.jpg'
	import ChannelType from '../../../../chat/ChannelType'
	import { MessageConversationType } from '../../../../db/entities/MessageConversationType'
    import EmojiIcon from '$lib/icons/face--satisfied.svelte'
	import GIFIcon from '$lib/icons/GIF.svelte'
	import ImageIcon from '$lib/icons/image.svelte'
    import SendIcon from '$lib/icons/send.svelte'
    import ReplyIcon from '$lib/icons/reply.svelte'
    import Checkmark from '$lib/icons/checkmark.svelte'
    import EmojiPicker from '$lib/EmojiPicker.svelte'
    import OverflowMenuHorizontalIcon from '$lib/icons/overflow-menu--horizontal.svelte'
	import type ImageAttachment from '../../../../post/ImageAttachment'
	import { onMount, tick } from 'svelte'
    import { flip } from 'svelte/animate'
    import { slide } from 'svelte/transition'
	import type { MixedMessageAcknowledgementResponse } from '../../../api/messages/mixed/+server'
	import MessageElement from './Message.svelte'
    import CloseIcon from '$lib/icons/close.svelte'
	import Message from './Message.svelte.ts'
	import realtimeClient from '$lib/realtime/realtimeClient'
	import ClientChatSimpleMessagePacket from '$lib/realtime/packets/client/ClientChatSimpleMessagePacket'
	import ClientChatMessageSimpleReplyPacket from '$lib/realtime/packets/client/ClientChatMessageSimpleReplyPacket'
	import chat from '$lib/chat.svelte'
    import UnavailableFeatureModal from '$lib/UnavailableFeatureModal.svelte'
    import UserFollowIcon from '$lib/icons/user--follow.svelte'

	let { data, params } = $props()

    const userId = $derived(data.channel.user?.id || data.localUserId)
    const avatarSrc = $derived(`/api/users/${userId}/avatar`)

    const handle = $derived(data.channel.user?.handle || data.localUserHandle)
    const name = $derived(data.channel.user?.name || data.localUserName)

    let loadedMessages = $state((() => {
		const messages: Message[] = []

		/** Loads initial messages. */
        if(data.channel.messages) {
            for (const message of data.channel.messages) {
                const newLoadedMessage = new Message()

                newLoadedMessage.id = message.id
                newLoadedMessage.authorId = message.authorId || data.localUserId!
                newLoadedMessage.authorName = message.authorName
                newLoadedMessage.authorHandle = message.authorHandle
                newLoadedMessage.time = new Date(message.time)
                newLoadedMessage.content = message.content
                newLoadedMessage.attachments = message.attachmentsIds || []

                if(message.replyingTo) {
                    newLoadedMessage.replyingTo = {
                        content: message.replyingTo.content,
                    }
                }

                messages.push(newLoadedMessage)
            }
        }

        return messages
    })())

    let messagesContainer: HTMLElement

	onMount(() => {
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight })
    })

    let showEmojiPicker = $state(false)
    let showStickerPicker = $state(false)

	let awaitingForAcknowledgementResponse = $state(false)
	let content = $state("")
    let replyingToMessageId: string | undefined = $state()
    const replyingToMessage: typeof loadedMessages[number] | undefined = $derived(
		loadedMessages.find((message) => message.id === replyingToMessageId)
    )

    class InputAttachment {
		static idCounter = 0

        id: number
        file: File
        constructor(file: File) {
            this.id = InputAttachment.idCounter++
            this.file = file
        }
    }

    let attachments: InputAttachment[] = $state([])

    function checkIfAtMessagesContainerBottom() {
		const MAX_OFFSET = 10
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer

        return scrollHeight - scrollTop - clientHeight < MAX_OFFSET
    }

    async function handleNewMessage(message: typeof loadedMessages[number]) {
		const wasAtBottom = checkIfAtMessagesContainerBottom()

        loadedMessages.push(message)

        await tick()

        if (wasAtBottom) {
            messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' })
        }
    }

	async function onMessageSendButtonClick() {
        if(awaitingForAcknowledgementResponse) {
            return
        }

        if(content.length === 0 && attachments.length === 0) {
            return
        }

        const isMixedMessage = attachments.length > 0

        if(isMixedMessage) {
            const formData = new FormData()

            formData.set('conversation', params.channel)
            formData.set('content', content)

            if(replyingToMessageId) {
				formData.set('replyingTo', replyingToMessageId)
            }

            for(const attachment of attachments) {
                formData.append('attachment', attachment.file)
            }

			fetch('/api/messages/mixed', {
				method: 'POST',
                body: formData,
            }).then(async (response) => {
				if(!response.ok) {
					return
                }

				const responseData = await response.json() as MixedMessageAcknowledgementResponse

                const newMessage = new Message()

                newMessage.id = responseData.id
                newMessage.authorId = data.localUserId!
                newMessage.authorName = data.localUserName!
                newMessage.authorHandle = data.localUserHandle!
                newMessage.time = new Date(responseData.time)
                newMessage.content = content
                /** TODO: Implement attachment feature in the DMs. */
                newMessage.attachments = []

				content = ""
				attachments = []

                if(replyingToMessageId) {
					newMessage.replyingTo = {
						content: replyingToMessage!.content!
					}

					replyingToMessageId = undefined
                }

				await handleNewMessage(newMessage)
            }).finally(() => {
				awaitingForAcknowledgementResponse = false
            })

            awaitingForAcknowledgementResponse = true
		} else {
			const temporaryId = crypto.randomUUID()

            const newMessage = new Message()

            newMessage.id = temporaryId
            newMessage.authorId = data.localUserId!
            newMessage.authorName = data.localUserName!
            newMessage.authorHandle = data.localUserHandle!
            newMessage.time = new Date()
            newMessage.content = content
            newMessage.attachments = []

			if(!replyingToMessageId) {
				realtimeClient.send(
					new ClientChatSimpleMessagePacket(newMessage.id, params.channel, content)
                )
			} else {
				newMessage.replyingTo = {
				    content: loadedMessages.find((message) => message.id === replyingToMessageId)!.content!
                }

				realtimeClient.send(
					new ClientChatMessageSimpleReplyPacket(newMessage.id, params.channel, replyingToMessageId, content)
                )

                replyingToMessageId = undefined
			}

			const context = chat.contexts.find((entry) => entry.channel.id === params.channel)!

            context.channel.latestMessage = content
            context.channel.latestMessageTime = newMessage.time.getTime()
            context.channel.isUnread = false

			chat.messagesAwaitingForAcknowledgement.set(temporaryId, newMessage)

			content = ""

            await handleNewMessage(newMessage)
        }
    }

	const latestMessage = $derived(loadedMessages[loadedMessages.length - 1])
    const localUserId = $derived(data.localUserId)!
    let hasMoreMessagesToLoad = $state(false)

    let isSendButtonHold = $state(false)
</script>

<div class="flex w-full bg-[#fdfdfd] p-5 items-center justify-between border-b border-[#dedede] drop-shadow-sm/1 rounded-t-3xl">
    <div class="flex items-center space-x-4">
        <img src={avatarSrc} draggable="false" class="rounded-full size-10" alt="">
        <div class="flex space-x-2 text-[12.5px]">
            <p class="font-semibold text-[#373737] cursor-default">{name}</p>
            {#if data.channel.type === MessageConversationType.DIRECT_MESSAGE}
                <span class="text-[#BDBDBD]">·</span>
                <a class="font-light text-[#B1B1B1]"
                   href="/@{handle}"
                >@{handle}</a>
                <!--{#if currentChannelContext.channel.isFollowing}-->
                <!--    <span>·</span>-->
                <!--    <span>following you</span>-->
                <!--{/if}-->
            {:else if data.channel.type === MessageConversationType.GROUP_CHAT}
                <!-- TODO: Implement group chats in the future. -->
            {/if}
        </div>
    </div>
    <div class="flex items-center space-x-4">
        <button onclick={() => {}}
            class="flex space-x-2 items-center bg-[#3C76FF] hover:bg-[#4C86FF] text-[11px] rounded-[14px] px-4 py-2 cursor-pointer active:scale-90 transition-all will-change-transform"
        >
            <span class="size-3.5">
                <UserFollowIcon/>
            </span>
            <span>Follow back</span>
        </button>
        <button class="size-8 text-zinc-500 cursor-pointer hover:bg-zinc-50 active:scale-80 transition-all p-2 rounded-full">
            <OverflowMenuHorizontalIcon/>
        </button>
    </div>
</div>
<div
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto basis-0 pt-10 @container-[scroll-state] @[scroll-state(scrollable:y)]:bg-blue-100"
>
    <div class="flex-1 flex flex-col font-light px-5 justify-end space-y-3 text-[11px]">
        {#if !hasMoreMessagesToLoad}
            <div class="self-center flex flex-col items-center space-y-3">
                <div class="flex flex-col items-center space-y-2">
                    <img src={avatarSrc} class="rounded-full size-20" style="box-shadow: 0px 2px 8px rgba(0,0,0,0.08);" alt="">
                    <div class="flex space-x-1.5 items-center">
                        <p class="text-sm font-semibold text-[#373737]">{name}</p>
                        <p class="text-sm text-[#B1B1B1]">(@{handle})</p>
                    </div>
                </div>
                <p class="text-xs text-[#CDCDCD] select-none">This is where everything begins!</p>
            </div>
        {/if}
        <div class="flex flex-col space-y-0.5">
            {#each loadedMessages as message(message.id)}
                <div animate:flip={{ duration: 200 }}>
                    <MessageElement
                        bind:id={message.id}
                        authorId={message.authorId}
                        authorHandle={message.authorHandle}
                        time={message.time}
                        content={message.content}
                        onReplyButtonClick={async () => {
							const wasAtBottom = checkIfAtMessagesContainerBottom()

							replyingToMessageId = message.id

							await tick()

							if(wasAtBottom) {
								const ANIMATION_DELAY = 300

								setTimeout(() => {
                                    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' })

								}, ANIMATION_DELAY)
							}
						}}
                        replyingToMessageContent={message.replyingTo?.content}
                        onRemoval={() => {
                            const index = loadedMessages.findIndex(item => item.id === message.id)

                            if (index !== -1) {
                                loadedMessages.splice(index, 1)
                            }

							const newCurrentMessage = loadedMessages[loadedMessages.length - 1]
							const currentContext = chat.contexts.find((entry) => entry.channel.id === params.channel)

							if(currentContext && newCurrentMessage) {
							    currentContext.channel.latestMessage = newCurrentMessage.content
							    currentContext.channel.latestMessageTime = newCurrentMessage.time.getTime()
							}
                        }}

                        localUserId={localUserId}
                    />
                </div>
            {/each}
        </div>
    </div>
    {#if latestMessage?.authorId === data.localUserId}
        <div class="flex items-center text-[#b1b1b1] self-end text-[11px] mx-7 my-1.5 select-none justify-end h-4">
            {#key latestMessage}
                <div in:slide class="flex items-center space-x-1">
                    <p in:slide={{ axis: 'x' }}>Sent</p>
                    <div class="size-4"><Checkmark/></div>
                </div>
            {/key}
        </div>
    {/if}
</div>
<div class="m-5">
    {#if replyingToMessage}
        <div class="relative">
            <div transition:slide
                class="flex flex-col text-xs border border-zinc-100 border-b-0 drop-shadow-lg/4 bg-white text-[#A8A8A8] p-4
                        rounded-tl-2xl rounded-tr-2xl"
            >
                <div class="flex justify-between items-center">
                    <p class="font-light">Replying to <b class="text-[#373737]">{replyingToMessage.authorName}</b> (@{replyingToMessage.authorHandle})</p>
                    <button onclick={() => replyingToMessageId = undefined}
                            class="flex size-5 cursor-pointer"
                    ><CloseIcon/></button>
                </div>
                <p>{replyingToMessage.content}</p>
            </div>
        </div>
    {/if}
    <div class="focus-within:scale-101 transition-all duration-500 relative flex bg-white {!replyingToMessage ? 'rounded-2xl' : 'rounded-bl-2xl rounded-br-2xl'}" style="box-shadow: 0px 2px 8px rgba(0,0,0,0.1)">
        <div class="flex text-[#A8A8A8] space-x-3 items-center ml-5">
            <input type="file" id="attachment" accept="image/*,image/*" multiple class="hidden" />
            <label for="attachment">
                <span class="block active:scale-90 transition-all w-5.5 cursor-pointer"><ImageIcon/></span>
            </label>
            <div class="grid">
                <button onclick={() => showEmojiPicker = true}>
                    <span class="block active:scale-90 transition-all w-5.5 cursor-pointer"><EmojiIcon/></span>
                </button>
                {#if showEmojiPicker}
                    <div class="absolute -translate-y-full">
                        <EmojiPicker
                            bind:open={showEmojiPicker}
                            onEmojiSelect={(emoji) => content += emoji.native}
                        />
                    </div>
                {/if}
            </div>
            <div class="flex">
                <button onclick={() => showStickerPicker = true}>
                    <span class="block active:scale-90 transition-all w-5.5 cursor-pointer"><GIFIcon/></span>
                </button>
                {#if showStickerPicker}
                    <div class="relative self-end flex">
                        <UnavailableFeatureModal bind:show={showStickerPicker} />
                    </div>
                {/if}
            </div>
        </div>
        <input
            onkeydown={(event) => {
				switch (event.key) {
                    case 'Enter': {
						isSendButtonHold = true

                        break
                    }
                }
            }}
            onkeyup={(event) => {
				switch (event.key) {
                    case 'Enter': {
                        onMessageSendButtonClick()

				        isSendButtonHold = false
                    }
                }
			}}
            placeholder="What would you like to say?"
            spellcheck="false"
            class="flex outline-none placeholder:text-[#d5d5d5] text-xs font-light flex-1 p-5 placeholder:select-none text-[#373737]"
            bind:value={content}
        >
        <div class="flex">
            <button onclick={onMessageSendButtonClick}
                class="active:scale-90 {isSendButtonHold ? 'scale-90' : ''} bg-[#3C76FF] hover:bg-[#4C86FF] w-10 p-3 cursor-pointer text-white rounded-full size-fit mr-3 place-self-center transition-all"
            >
                <span class="box-content size-full flex aspect-square">
                    <SendIcon/>
                </span>
            </button>
        </div>
    </div>
</div>
