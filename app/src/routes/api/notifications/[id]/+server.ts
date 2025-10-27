import * as UUIDUtils from '../../../../utils/UUIDUtils'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import type Notification from '../../../../db/entities/Notification'
import TableName from '../../../../db/TableName'
import globals from '$lib/server/globals'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import { NotificationStatus } from '../../../../db/entities/NotificationStatus'

export async function PATCH(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const notificationId = event.params.id

	if(!UUIDUtils.isUUIDv4Valid(notificationId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const notificationsRepository = globals.db.manager.connection.getRepository<Notification>(TableName.NOTIFICATIONS)
	const notification = await notificationsRepository.findOneBy({
		recipientId: session.userId,
		id: notificationId,
	})

	if(!notification) {
		throw error(HTTPCode.NOT_FOUND)
	}

	await notificationsRepository.update(notification, {
		status: NotificationStatus.READ,
	})

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
