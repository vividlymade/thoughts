import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ServerChatMessagePacket extends ServerRealtimePacket {
	channel: string
	authorId: string
	authorHandle: string
	authorName: string
	message: string
	time: number

	constructor(channel: string, authorId: string, authorHandle: string, authorName: string, message: string, time: number) {
		super(ServerRealtimePacketType.CHAT_MESSAGE)

		this.channel = channel
		this.authorId = authorId
		this.authorHandle = authorHandle
		this.authorName = authorName
		this.message = message
		this.time = time
	}
}
