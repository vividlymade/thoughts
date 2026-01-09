import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import AppConsts from '../../../../AppConsts'
import globals from '$lib/server/globals'
import TableName from '../../../../db/TableName'
import type MessageConversation from '../../../../db/entities/MessageConversation'

export async function GET(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

    const searchTerm = event.url.searchParams.get('q')

    const messageConversationsRepository = globals.db.manager.connection.getRepository<MessageConversation>(TableName.USERS)

	/** TODO: Implement proper conversation search query. */
	const conversations = await messageConversationsRepository
        .createQueryBuilder('conversation')
        // .select([
        //     'user.id',
        //     'user.handle',
        //     'user.name',
        // ])
        // .where('user.name ILIKE :pattern OR user.handle ILIKE :pattern', { pattern: `${searchTerm}%` })
        // .orderBy('user.', 'DESC')
		// .addOrderBy('CASE ' +
        //         'WHEN user.handle ILIKE :pattern THEN 1 ' +
        //         'ELSE 2 ' +
        //     'END', 'ASC')
        .take(AppConsts.MAX_SEARCH_USER_RESULTS + 1)
        .getMany()

	/** TODO: Implement DTO object creation and prepare response with those. */

	throw error(HTTPCode.INTERNAL_SERVER_ERROR)
}
