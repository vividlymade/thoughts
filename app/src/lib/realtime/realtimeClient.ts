import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import type ServerSystemNotificationPacket from '$lib/realtime/packets/server/ServerSystemNotificationPacket'
import type ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'
import notifications, { Notification } from '$lib/notifications.svelte'
import type ClientRealtimePacket from '$lib/realtime/ClientRealtimePacket'
import type ServerChatMessagePacket from '$lib/realtime/packets/server/ServerChatMessagePacket'
import chat from '$lib/chat.svelte'
import type ServerChatMessageAcknowledgementPacket from '$lib/realtime/packets/server/ServerChatMessageAcknowledgementPacket'

export default {
	ws: <WebSocket | undefined>undefined,
	connect() {
		const ws = new WebSocket(`ws://${window.location.host}/api/ws`)

		this.ws = ws

		ws.onopen = (e) => {
			console.info("Connected with the server!")
		}

		ws.onmessage = (e) => {
			const packet = JSON.parse(e.data) as ServerRealtimePacket

			switch(packet.type) {
				case ServerRealtimePacketType.NOTIFICATION_SYSTEM: {
					const notificationPacket = packet as ServerSystemNotificationPacket

					notifications.pushNew(
						new Notification(
							notificationPacket.id as string,
							notificationPacket.title as string,
						notificationPacket.content as string,
								notificationPacket.time as number,
							false,
							)
					)

					break
				}
				case ServerRealtimePacketType.CHAT_MESSAGE_ACKNOWLEDGEMENT: {
					const chatMessageAcknowledgmentPacket = packet as ServerChatMessageAcknowledgementPacket

					const clientMessageId = chatMessageAcknowledgmentPacket.clientMessageId as string
					const assignedMessageId = chatMessageAcknowledgmentPacket.assignedMessageId as string

					const message = chat.messagesAwaitingForAcknowledgement.get(clientMessageId)!

					message.id = assignedMessageId

					chat.messagesAwaitingForAcknowledgement.delete(clientMessageId)

					break
				}
				case ServerRealtimePacketType.CHAT_MESSAGE: {
					const chatMessagePacket = packet as ServerChatMessagePacket

					/** TODO: Implement handling chat messages. */
					// const existingContext = chat.contexts.find((context) => {
					// 	return context.channel.id === chatMessagePacket.channel
					// })
					// chat.contexts

					break
				}
				case ServerRealtimePacketType.CHAT_MESSAGE_REPLY: {
					/** TODO: Implement handling chat message replies. */

					break
				}
			}
		}

		ws.onclose = (e) => {
			console.info("Closed connection with the server!")
		}

		ws.onerror = (e) => {
			console.error("Connection error:", e)
		}
	},

	send(packet: ClientRealtimePacket) {
		this.ws!.send(JSON.stringify(packet))
	}
}
