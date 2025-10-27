import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error, redirect } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import MessageConversation from '../../../db/entities/MessageConversation'
import ConversationService from '$lib/server/services/ConversationService.server'
import { randomUUID } from 'crypto'
import globals from '$lib/server/globals'
import TableName from '../../../db/TableName'
import MessageConversationParticipation from '../../../db/entities/MessageConversationParticipation'
import * as UUIDUtils from '../../../utils/UUIDUtils'
import { MessageConversationType } from '../../../db/entities/MessageConversationType'

export interface ResponseConversation {
	id: string
}

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const formData = await event.request.formData()

	const requestedConversationUserId = formData.get('user')

	if(typeof requestedConversationUserId !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(!UUIDUtils.isUUIDv4Valid(requestedConversationUserId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const requestingConversationUserId = session.userId

	const conversation = await ConversationService.findDirectMessageConversationByUsers(requestingConversationUserId, requestedConversationUserId)

	if(conversation) {
		throw redirect(303, `/messages/${conversation.id}`)
	}

	const newConversation = new MessageConversation()

	newConversation.type = MessageConversationType.DIRECT_MESSAGE
	newConversation.creationTime = new Date()

	const newConversationId = randomUUID()

	newConversation.id = newConversationId

	const creatingConversationWithThemselves = requestingConversationUserId === requestingConversationUserId

	const newConversationParticipationA = new MessageConversationParticipation()

	newConversationParticipationA.conversationId = newConversationId
	newConversationParticipationA.userId = requestingConversationUserId

	newConversationParticipationA.joinTime = newConversation.creationTime

	let newConversationParticipationB: MessageConversationParticipation

	if(!creatingConversationWithThemselves) {
		newConversationParticipationB = new MessageConversationParticipation()

		newConversationParticipationB.conversationId = newConversationId
		newConversationParticipationB.userId = requestedConversationUserId

		newConversationParticipationB.joinTime = newConversation.creationTime
	}

	await globals.db.manager.connection.transaction(async (entityManager) => {
		const conversationsRepository = entityManager.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)
		const conversationParticipationsRepository = entityManager.getRepository<MessageConversationParticipation>(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)

		await conversationsRepository.save(newConversation)

		if(!creatingConversationWithThemselves) {
			await conversationParticipationsRepository.save([
				newConversationParticipationA,
				newConversationParticipationB
			])
		} else {
			await conversationParticipationsRepository.save(newConversationParticipationA)
		}
	})

	throw redirect(303, `/messages/${newConversationId}`)
}
