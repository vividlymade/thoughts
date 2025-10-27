import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ServerChatMessageReplyPacket extends ServerRealtimePacket {
	channel: string
	parentMessageId: BigInt
	parentMessageContent: string
	author: BigInt
	message: string

	constructor(
		channel: string,
		parentMessageId: BigInt,
		parentMessageContent: string,
		author: BigInt,
		message: string
	) {
		super(ServerRealtimePacketType.CHAT_MESSAGE_REPLY)

		this.channel = channel
		this.parentMessageId = parentMessageId
		this.parentMessageContent = parentMessageContent
		this.author = author
		this.message = message
	}
}