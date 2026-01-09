import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import AppConsts from '../../../AppConsts'
import globals from '$lib/server/globals'
import type Notification from '../../../db/entities/Notification'
import TableName from '../../../db/TableName'

export async function GET(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const url = event.url

	const afterTimeCursor = url.searchParams.get('after')
	const lastNotificationCursor = url.searchParams.get('last')

	const hasCursors = !!afterTimeCursor && !!lastNotificationCursor
	const hasNoCursors = !afterTimeCursor && !lastNotificationCursor

	const isValidRequest = hasCursors || hasNoCursors

	if(!isValidRequest) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const notificationsRepository = globals.db.manager.connection.getRepository<Notification>(TableName.NOTIFICATIONS)

	/** TODO: Add `afterTimeCursor` and `lastNotificationCursor` to the query as an option. */
	notificationsRepository
		.createQueryBuilder('notification')
			.leftJoinAndSelect('post.author', 'author')
			.leftJoinAndSelect('post.attachments', 'attachments')
			.leftJoinAndSelect('post.replies', 'replies')
				.leftJoinAndSelect('replies.author', 'replyAuthor')
				.leftJoinAndSelect('replies.attachments', 'replyAttachments')
		.where('post."authorId" = :id', { id: session!.userId, })
		.orderBy('post.timestamp', 'DESC')
		.addOrderBy('post.id', 'DESC')
		/** Gets the maximum allowed notifications per load along with the extra one for checking whether there is more results. */
		.take(AppConsts.MAX_NOTIFICATIONS_PER_LOAD + 1)

	throw error(HTTPCode.INTERNAL_SERVER_ERROR)
}
