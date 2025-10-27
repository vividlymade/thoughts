const enum ServerRealtimePacketType {
	NOTIFICATION_SYSTEM = 'notification.system',
	NOTIFICATION_MENTION = 'notification.mention',
	NOTIFICATION_LIKE = 'notification.like',
	NOTIFICATION_REPLY = 'notification.reply',
	NOTIFICATION_NEW_FOLLOWER = 'notification.new_follower',

	CHAT_MESSAGE = 'chat.message',
	CHAT_MESSAGE_REPLY = 'chat.message_reply',
	CHAT_MESSAGE_ACKNOWLEDGEMENT = 'chat.message.acknowledgement',
	// CHAT_MESSAGE_REACTION = 'chat.message_reaction',
}

export default ServerRealtimePacketType
