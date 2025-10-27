import type Notification from '../../../db/entities/Notification'
import globals from '$lib/server/globals'
import ServerSystemNotificationPacket from '$lib/realtime/packets/server/ServerSystemNotificationPacket'
import TableName from '../../../db/TableName'

export default {
	async sendNotification(userId: string, notification: Notification) {
		const notificationsRepository = globals.db.manager.connection.getRepository<Notification>(TableName.NOTIFICATIONS)

		await notificationsRepository.save(notification)

		for(const client of globals.connectedWebSocketClients) {
			if(client.userId === userId) {
				client.send(
					new ServerSystemNotificationPacket(
						notification.id,
						notification.title,
						notification.content,
						notification.time.getTime(),
					)
				)

				break
			}
		}
	}
}
