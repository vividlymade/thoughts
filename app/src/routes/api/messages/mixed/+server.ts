import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import AppConsts from '../../../../AppConsts'
import sharp from 'sharp'
import ImageUtils from '../../../(app)/welcome/ImageUtils'
import globals from '$lib/server/globals'
import Post from '../../../../db/entities/Post'
import TableName from '../../../../db/TableName'
import Message from '../../../../db/entities/Message'
import MessageConversation from '../../../../db/entities/MessageConversation'
import * as UUIDUtils from '../../../../utils/UUIDUtils'
import { randomUUID } from 'crypto'

export interface MixedMessageAcknowledgementResponse {
	status: HTTPCode
	time: number
	id: string
}

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const formData = await event.request.formData()

	const content = formData.get('content')

	if(typeof content !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const conversationId = formData.get('conversation')

	if(typeof conversationId !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(!UUIDUtils.isUUIDv4Valid(conversationId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const replyingToMessageId = formData.get('replyingTo')

	if(replyingToMessageId && typeof replyingToMessageId !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const attachments = formData.getAll('attachment')

	const hasAttachments = attachments.length > 0
	const hasTextContent = content.length > 0

	if(!hasAttachments) {
		/** Throws an error as a mixed message requires at least one attachment. */
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(hasTextContent) {
		if(content.length === 0 ||
			content.length > AppConsts.MAX_ALLOWED_MESSAGE_LENGTH
		) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}
	}

	if(attachments.length > AppConsts.MAX_ALLOWED_MESSAGE_ATTACHMENTS) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const validatedAttachments: sharp.Sharp[] = []

	for (const attachment of attachments) {
		if(!(attachment instanceof File)) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		if(attachment.size > AppConsts.MAX_ALLOWED_MESSAGE_ATTACHMENT_SIZE) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		const imageBuffer = await attachment.arrayBuffer()

		const validatedImage = await ImageUtils.validateUserImageFormatFromBuffer(imageBuffer, true)
		const isValid = validatedImage instanceof sharp

		if(!isValid) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		validatedAttachments.push(validatedImage)
	}

	const messageConversationsRepository = globals.db.manager.connection.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)

	const conversation = await messageConversationsRepository.findOneBy({
		id: conversationId,
		participants: {
			userId: session.userId,
		}
	})

	if(!conversation) {
		throw error(HTTPCode.NOT_FOUND)
	}

	const messagesRepository = globals.db.manager.connection.getRepository<Message>(TableName.MESSAGES)

	if(replyingToMessageId) {
		const replyingToMessageExists = messagesRepository.existsBy({
			id: replyingToMessageId,
			conversationId: conversationId,
		})

		if(!replyingToMessageExists) {
			throw error(HTTPCode.NOT_FOUND)
		}
	}

	const processedAttachments: Buffer[] = []

	for(const attachment of validatedAttachments) {
		ImageUtils.applyExifRotation(attachment)

		processedAttachments.push(
			await ImageUtils.convertAndCompressImageIntoNormalizedFormat(attachment)
		)
	}

	/** TODO: Handle `processedAttachments`, store in the database and attach those to the DTO `Message` objects. */

	const newMessage = new Message()

	newMessage.id = randomUUID()
	newMessage.conversationId = conversationId
	newMessage.content = content
	newMessage.time = new Date()
	newMessage.authorId = session.userId

	if(replyingToMessageId) {
		newMessage.replyingToId = replyingToMessageId
	}

	/** TODO: Inform others about the message over the realtime WebSocket channel. */

	await globals.db.manager.connection.transaction(async (entityManager) => {
		const messageConversationsRepository = entityManager.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)
		const messagesRepository = entityManager.getRepository<Message>(TableName.MESSAGES)

		await messagesRepository.save(newMessage)
		await messageConversationsRepository.update({
			id: conversationId,
		}, {
			latestMessageId: newMessage.id,
			latestMessageTime: newMessage.time,
			latestMessageAuthorId: newMessage.authorId,
			latestMessageContent: newMessage.content,
		})
	})

	return json({
		status: HTTPCode.CREATED,
		id: newMessage.id,
		time: newMessage.time.getTime(),
	} satisfies MixedMessageAcknowledgementResponse)
}
