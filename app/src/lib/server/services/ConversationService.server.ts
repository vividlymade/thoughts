import globals from '$lib/server/globals'
import TableName from '../../../db/TableName'
import MessageConversation from '../../../db/entities/MessageConversation'
import { MessageConversationType } from '../../../db/entities/MessageConversationType'

export default {
	async findDirectMessageConversationByUsers(userAId: string, userBId: string) {
		return globals.db.manager.connection
			.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)
			.createQueryBuilder('conversation')
				.innerJoinAndSelect('conversation.participants', 'participation')
				.innerJoinAndSelect('participation.user', 'user')
			.where('conversation.type = :type', { type: MessageConversationType.DIRECT_MESSAGE })
			.andWhere('participation."userId" IN (:userAId, :userBId)', {
				userAId: userAId,
				userBId: userBId,
			})
			.getOne()
	}
}
