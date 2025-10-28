import { error, type Socket } from '@sveltejs/kit'
import globals from '$lib/server/globals'
import type ClientRealtimePacket from '$lib/realtime/ClientRealtimePacket'
import type ClientChatSimpleMessagePacket from '$lib/realtime/packets/client/ClientChatSimpleMessagePacket'
import ClientRealtimePacketType from '$lib/realtime/ClientRealtimePacketType'
import ClientContext from './ClientContext'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import HTTPCode from '../../../HTTPCode'
import WSClosureErrorCode from '$lib/realtime/WSClosureErrorCode'
import type ClientChatMessageSimpleReplyPacket from '$lib/realtime/packets/client/ClientChatMessageSimpleReplyPacket'
import * as UUIDUtils from '../../../utils/UUIDUtils'
import AppConsts from '../../../AppConsts'
import Message from '../../../db/entities/Message'
import { randomUUID } from 'crypto'
import TableName from '../../../db/TableName'
import type MessageConversation from '../../../db/entities/MessageConversation'
import ServerChatMessageAcknowledgementPacket from '$lib/realtime/packets/server/ServerChatMessageAcknowledgementPacket'
import type MessageConversationParticipation from '../../../db/entities/MessageConversationParticipation'
import { Not } from 'typeorm'
import ServerChatMessagePacket from '$lib/realtime/packets/server/ServerChatMessagePacket'
import type User from '../../../db/entities/User'

const enum ContextProperty {
	CLIENT_CONTEXT,
}

// @ts-ignore It uses the experimental SvelteKit WebSocket support which hasn't been merged yet into the upstream.
export const socket: Socket = {
	async upgrade(req) {
		const session = await UserSessionService.getAndProcessSession(req.cookies)

		if(!session) {
			throw error(HTTPCode.UNAUTHORIZED)
		}

		const newClientContext = new ClientContext(session!.userId)

		req.context[ContextProperty.CLIENT_CONTEXT] = newClientContext
	},

	open(peer) {
		const clientContext = peer.context[ContextProperty.CLIENT_CONTEXT] as ClientContext

		clientContext.peer = peer

		const userClients = globals.connectedWebSocketClientsByUserIdMap.get(clientContext.userId)

		if(!userClients) {
			globals.connectedWebSocketClientsByUserIdMap.set(clientContext.userId, [
				clientContext,
			])
		} else {
			userClients.push(clientContext)
		}

		globals.connectedWebSocketClients.push(clientContext)
	},

	async message(peer, rawMessage) {
		const rawStringMessage = rawMessage.toString()

		try {
			const packet = JSON.parse(rawStringMessage) as ClientRealtimePacket
			const clientContext = peer.context[ContextProperty.CLIENT_CONTEXT] as ClientContext

			switch (packet.type) {
				case ClientRealtimePacketType.CHAT_SIMPLE_MESSAGE: {
					const chatMessagePacket = packet as ClientChatSimpleMessagePacket

					const userId = clientContext.userId

					const conversationId = chatMessagePacket.conversation
					const content = chatMessagePacket.content
					const clientTemporaryMessageId = chatMessagePacket.id

					if(
						typeof conversationId !== 'string' ||
						typeof content !== 'string' ||
						typeof clientTemporaryMessageId !== 'string'
					) {
						peer.close(WSClosureErrorCode.POLICY_VIOLATION)

						return
					}

					if(!UUIDUtils.isUUIDv4Valid(conversationId) || !UUIDUtils.isUUIDv4Valid(clientTemporaryMessageId)) {
						peer.close(WSClosureErrorCode.POLICY_VIOLATION)

						return
					}

					if(content.length === 0 || content.length > AppConsts.MAX_ALLOWED_MESSAGE_LENGTH) {
						peer.close(WSClosureErrorCode.POLICY_VIOLATION)

						return
					}

					const messageConversationsRepository = globals.db.manager.connection.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)

					const conversation = await messageConversationsRepository.findOneBy({
						id: conversationId,
						participants: {
							userId: userId,
						}
					})

					if(!conversation) {
						return
					}

					const newMessage = new Message()

					const serverAssignedMessageId = randomUUID()

					newMessage.id = serverAssignedMessageId
					newMessage.conversationId = conversationId
					newMessage.content = content
					newMessage.time = new Date()
					newMessage.authorId = userId

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

					const conversationParticipationsRepository = globals.db.manager.connection.getRepository<MessageConversationParticipation>(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)

					const otherParticipants = await conversationParticipationsRepository.findBy({
						conversationId: conversationId,
						userId: Not(userId),
					})

					clientContext.send(new ServerChatMessageAcknowledgementPacket(
						clientTemporaryMessageId,
						serverAssignedMessageId,
					))

					const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
					const user = await usersRepository.findOneBy({
						id: userId,
					})

					if(!user) {
						return
					}

					for(const participant of otherParticipants) {
						const participantClients = globals.connectedWebSocketClientsByUserIdMap.get(participant.userId)

						if(participantClients) {
							for(const participantClient of participantClients) {
								participantClient.send(new ServerChatMessagePacket(
									conversationId,
									userId,
									user.handle,
									user.name,
									content,
									newMessage.time.getTime(),
								))
							}
						}
					}

					break
				}
				case ClientRealtimePacketType.CHAT_MESSAGE_SIMPLE_REPLY: {
					const chatReplyPacket = packet as ClientChatMessageSimpleReplyPacket

					const userId = clientContext.userId


					const conversationId = chatReplyPacket.conversation
					const content = chatReplyPacket.message
					const parentMessageId = chatReplyPacket.parentMessage
					const clientTemporaryMessageId = chatReplyPacket.id

					if(
						typeof conversationId !== 'string' ||
						typeof parentMessageId !== 'string' ||
						typeof content !== 'string' ||
						typeof clientTemporaryMessageId !== 'string'
					) {
						peer.close(WSClosureErrorCode.POLICY_VIOLATION)

						return
					}

					if(content.length === 0 || content.length > AppConsts.MAX_ALLOWED_MESSAGE_LENGTH) {
						peer.close(WSClosureErrorCode.POLICY_VIOLATION)

						return
					}

					const messageConversationsRepository = globals.db.manager.connection.getRepository<MessageConversation>(TableName.MESSAGE_CONVERSATIONS)

					const conversation = await messageConversationsRepository.findOneBy({
						id: conversationId,
						participants: {
							userId: userId,
						}
					})

					if(!conversation) {
						return
					}

					const messagesRepository = globals.db.manager.connection.getRepository<Message>(TableName.MESSAGES)

					const parentMessage = messagesRepository.existsBy({
						conversationId: conversationId,
						id: parentMessageId,
					})

					if(!parentMessage) {
						return
					}

					const newMessage = new Message()

					const serverAssignedMessageId = randomUUID()

					newMessage.id = serverAssignedMessageId
					newMessage.replyingToId = parentMessageId
					newMessage.conversationId = conversationId
					newMessage.content = content
					newMessage.time = new Date()
					newMessage.authorId = userId

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

					const conversationParticipationsRepository = globals.db.manager.connection.getRepository<MessageConversationParticipation>(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)

					const otherParticipants = await conversationParticipationsRepository.findBy({
						conversationId: conversationId,
						userId: Not(userId),
					})

					clientContext.send(new ServerChatMessageAcknowledgementPacket(
						clientTemporaryMessageId,
						serverAssignedMessageId,
					))

					const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
					const user = await usersRepository.findOneBy({
						id: userId,
					})

					if(!user) {
						return
					}

					for(const participant of otherParticipants) {
						const participantClients = globals.connectedWebSocketClientsByUserIdMap.get(participant.userId)

						if(participantClients) {
							for(const participantClient of participantClients) {
								participantClient.send(new ServerChatMessagePacket(
									conversationId,
									userId,
									user.handle,
									user.name,
									content,
									newMessage.time.getTime(),
								))
							}
						}
					}

					break
				}
				default: {
					console.error("Unsupported message")
				}
			}
		} catch (e) {
			console.error(e)
		}
	},

	close(peer, event) {
		const clientContext = peer.context[ContextProperty.CLIENT_CONTEXT] as ClientContext

		/** Removes the stored client from the list. */
		for(let i = globals.connectedWebSocketClients.length - 1; i >= 0; i--) {
			const connectedClient = globals.connectedWebSocketClients[i]

			if(connectedClient.peer === peer) {
				globals.connectedWebSocketClients.splice(i, 1)

				break
			}
		}

		const userClients = globals.connectedWebSocketClientsByUserIdMap.get(clientContext.userId)!

		for(let i = userClients.length - 1; i >= 0; i--) {
			const connectedUserClient = userClients[i]

			if(connectedUserClient.peer === peer) {
				userClients.splice(i, 1)
			}
		}
	},

	error(peer, error) {
		console.error(error)
	}
}
