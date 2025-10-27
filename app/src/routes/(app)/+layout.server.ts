import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error, redirect } from '@sveltejs/kit'
import globals from '$lib/server/globals'
import type User from '../../db/entities/User'
import TableName from '../../db/TableName'
import HTTPCode from '../../HTTPCode'
import type UserSession from '../../db/entities/UserSession'
import type Notification from '../../db/entities/Notification'
import AppConsts from '../../AppConsts'
import { NotificationStatus } from '../../db/entities/NotificationStatus'

export interface Response {
	session?: UserSession

	localUserId?: string
	localUserHandle?: string
	localUserName?: string

	notifications?: {
		id: string
		title: string
		content: string
		time: number
		isRead: boolean
	}[]

	enabledNotificationSounds?: boolean
}

export async function load(event) {
	await event.parent()

	const session = await UserSessionService.getAndProcessSession(event.cookies)

	const userRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)

	const response: Response = {}

	if (session) {
		const user = await userRepository.findOneBy({
			id: session.userId,
		})

		if (!user) {
			throw error(HTTPCode.INTERNAL_SERVER_ERROR)
		}

		event.locals.session = session

		response.localUserId = user.id
		response.localUserHandle = user.handle
		response.localUserName = user.name

		if (!user.hasVisitedWelcomePage) {
			const expectedPath = '/welcome'

			if (event.url.pathname !== expectedPath) {
				throw redirect(HTTPCode.FOUND, expectedPath)
			}
		}

		const isInitialRequest = !event.isDataRequest

		if(isInitialRequest) {
			const notificationsRepository = globals.db.manager.connection.getRepository<Notification>(TableName.NOTIFICATIONS)
			const initialNotifications = await notificationsRepository.find({
				where: {
					recipient: user,
				},
				order: {
					time: 'DESC',
				},
				take: AppConsts.MAX_NOTIFICATIONS_PER_LOAD,
			})

			if (initialNotifications.length > 0) {
				const responseInitialNotifications: Response['notifications'] = []

				for (const notification of initialNotifications) {
					responseInitialNotifications.push({
						id: notification.id,
						title: notification.title,
						content: notification.content,
						time: notification.time.getTime(),
						isRead: notification.status === NotificationStatus.READ,
					})
				}

				response.notifications = responseInitialNotifications
			}

			if(user.enabledNotificationSounds) {
				response.enabledNotificationSounds = true
			}
		}
	}

	return response
}
