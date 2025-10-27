import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import globals from '$lib/server/globals'
import TableName from '../../../db/TableName'
import type Message from '../../../db/entities/Message'
import * as UUIDUtils from '../../../utils/UUIDUtils'
import type MessageConversation from '../../../db/entities/MessageConversation'

export async function DELETE(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const formData = await event.request.formData()

	const messageId = formData.get('id')

	if(typeof messageId !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(!UUIDUtils.isUUIDv4Valid(messageId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	await globals.db.manager.connection.transaction(async (entityManager) => {
		const messageConversationsRepository = entityManager.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)
		const messagesRepository = entityManager.getRepository<Message>(TableName.MESSAGES)

		const conversation = await messageConversationsRepository.findOneBy({
			messages: {
				id: messageId,
			}
		})

		if(!conversation) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const removalResult = await messagesRepository.delete({
			id: messageId,
			authorId: session.userId,
		})

		const hasSuccessfullyDeleted = removalResult.affected === 1

		if(!hasSuccessfullyDeleted) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const normalizedMessageId = messageId.toLowerCase()

		const wasLatestMessage = conversation.latestMessageId === normalizedMessageId

		if(wasLatestMessage) {
			const newLatestMessage = await messagesRepository.findOne({
				where: {
					conversationId: conversation.id,
				},
				order: {
					time: 'DESC',
				},
			})

			if (newLatestMessage) {
				await messageConversationsRepository.update({
					id: conversation.id,
				}, {
					latestMessageId: newLatestMessage.id,
					latestMessageContent: newLatestMessage.content,
					latestMessageAuthorId: newLatestMessage.authorId,
					latestMessageTime: newLatestMessage.time,
				})
			}
		}
	})

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
