import { redirect } from '@sveltejs/kit'
import globals from '$lib/server/globals'
import TableName from '../../../db/TableName'
import type MessageConversation from '../../../db/entities/MessageConversation'
import AppConsts from '../../../AppConsts'
import type MessageConversationParticipation from '../../../db/entities/MessageConversationParticipation'
import HTTPCode from '../../../HTTPCode'

export interface Response {
    entries: {
		id: string

		userId?: string
		userName?: string
		userHandle?: string

		latestMessageAuthorId?: string
		latestMessageAuthorName?: string
		latestMessageAuthorHandle?: string
		latestMessageTime?: number
		latestMessageContent?: string

		isUnread?: boolean
	}[]
    hasMoreToLoad?: boolean
}

export async function load(event) {
	await event.parent()

    const session = event.locals.session

    if(!session) {
        throw redirect(HTTPCode.TEMPORARY_REDIRECT, '/signin')
    }

    const conversationParticipationsRepository = globals.db.manager.connection.getRepository<MessageConversationParticipation>(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)

    const participations = await conversationParticipationsRepository
        .createQueryBuilder('participation')
            .leftJoinAndSelect('participation.conversation', 'conversation')
				.leftJoinAndSelect('conversation.participants', 'conversationParticipation')
				.leftJoinAndSelect('conversation.latestMessageAuthor', 'conversationLatestMessageAuthor')
					.leftJoinAndSelect('conversationParticipation.user', 'conversationParticipationUser')
		.where('participation."userId" = :id', { id: session.userId, })
		.orderBy('conversation.latestMessageTime', 'DESC')
		.addOrderBy('conversation.creationTime', 'DESC')
		/** Gets the max allowed conversations per load along with the extra one for checking whether there is more results. */
		.take(AppConsts.MAX_CONVERSATIONS_PER_LOAD + 1)
		.getMany()

	const response: Response = {
        entries: []
	}

	for(const participation of participations) {
		const conversation = participation.conversation
		const otherUser = participation.conversation.participants.find(
			(participation) => participation.userId !== session.userId
		)

		const responseConversation: Response['entries'][number] = {
			id: participation.conversationId,
		}

		if(otherUser) {
			responseConversation.userId = participation.userId
			responseConversation.userName = participation.user.name
			responseConversation.userHandle = participation.user.handle
		}

		if(conversation.latestMessageAuthor) {
			responseConversation.latestMessageAuthorId = conversation.latestMessageAuthor.id

			responseConversation.latestMessageTime = conversation.latestMessageTime!.getTime()
			responseConversation.latestMessageContent = conversation.latestMessageContent
		}

		const isUnread = conversation.latestMessageId !== participation.lastReadMessageId

		if(isUnread) {
			responseConversation.isUnread = true
		}

		response.entries.push(responseConversation)
	}

	const hasMoreConversationsToLoad = participations.length > AppConsts.MAX_CONVERSATIONS_PER_LOAD

	if(hasMoreConversationsToLoad) {
		response.hasMoreToLoad = true
	}

    return {
		conversations: response,
    }
}
