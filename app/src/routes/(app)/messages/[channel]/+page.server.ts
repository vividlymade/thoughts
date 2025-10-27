import globals from '$lib/server/globals'
import type User from '../../../../db/entities/User'
import TableName from '../../../../db/TableName'
import { error } from '@sveltejs/kit'
import * as UUIDUtils from '../../../../utils/UUIDUtils'
import HTTPCode from '../../../../HTTPCode'
import MessageConversation from '../../../../db/entities/MessageConversation'
import type MessageConversationParticipation from '../../../../db/entities/MessageConversationParticipation'
import { Not } from 'typeorm'
import { MessageConversationType } from '../../../../db/entities/MessageConversationType'
import AppConsts from '../../../../AppConsts'
import type Message from '../../../../db/entities/Message'

interface ResponseChannel {
	type: MessageConversationType
}

interface ResponseDirectMessageChannelMessage {
	id: string
	authorId?: string
	authorName?: string
	authorHandle?: string
	content?: string
	replyingTo?: {
		content: string
	}
	time: number
	attachmentsIds?: string[]
}

interface ResponseDirectMessageChannel extends ResponseChannel {
	user?: {
		id: string
		handle: string
		name: string

		followers: number
	}

	messages?: ResponseDirectMessageChannelMessage[]
}

export async function load(event) {
	const data = await event.parent()
	const session = event.locals.session!

	const conversationId = event.params.channel

	if(!UUIDUtils.isUUIDv4Valid(conversationId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const conversationsRepository = globals.db.manager.connection.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)

	const conversation = await conversationsRepository.findOneBy({
		id: conversationId,
		participants: {
			userId: session.userId
		},
	})

	if(!conversation) {
		throw error(HTTPCode.NOT_FOUND)
	}

	const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)

	await usersRepository
		.update({
			id: session.userId,
		}, {
			lastActiveConversationId: conversationId,
		})

	const responseChannel: ResponseDirectMessageChannel = {
		type: conversation.type
	}

	const conversationParticipantsRepository = globals.db.manager.connection
		.getRepository<MessageConversationParticipation>(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)

	const otherParticipant = await conversationParticipantsRepository.findOne({
		where: {
			conversationId: conversationId,
			userId: Not(session.userId),
		},
		relations: {
			user: true,
		}
	})

	const messagesRepository = globals.db.manager.connection
		.getRepository<Message>(TableName.MESSAGES)

	const initialMessages = await messagesRepository
		.createQueryBuilder('message')
			.leftJoinAndSelect('message.attachments', 'attachments')
			.leftJoinAndSelect('message.replyingTo', 'replyingTo')
		.innerJoinAndSelect('message.author', 'author')
		.innerJoin('message.conversation', 'conversation')
		.orderBy('message.time', 'DESC')
		.take(AppConsts.MAX_CONVERSATION_MESSAGES_PER_LOAD)
		.getMany()

	if(initialMessages.length > 0) {
		responseChannel.messages = []

		for(let i = initialMessages.length - 1; i >= 0; i--) {
			const message = initialMessages[i]

			const attachmentsIds: string[] = []

			for(const attachment of message.attachments) {
				attachmentsIds.push(attachment.id)
			}

			const responseChannelMessage: ResponseDirectMessageChannelMessage = {
				id: message.id,
				time: message.time.getTime(),
				authorId: message.authorId,
				authorName: message.author.name,
				authorHandle: message.author.handle,
				content: message.content,
				attachmentsIds: attachmentsIds,
			}

			if(message.replyingTo) {
				responseChannelMessage.replyingTo = {
					content: message.replyingTo.content,
				}
			}

			responseChannel.messages.push(responseChannelMessage)
		}

		const lastMessage = initialMessages[0]

		await conversationParticipantsRepository.update({
			conversationId: conversationId,
			userId: session.userId,
		}, {
			lastReadMessageId: lastMessage.id,
		})
	}

	if(otherParticipant) {
		responseChannel.user = {
			id: otherParticipant.userId,
			handle: otherParticipant.user.handle,
			name: otherParticipant.user.name,

			followers: Number(otherParticipant.user.followersCount),
		}
	}

	return {
		...data,

		channel: responseChannel,
	}
}
