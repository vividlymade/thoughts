import ClientRealtimePacket from '$lib/realtime/ClientRealtimePacket'
import ClientRealtimePacketType from '$lib/realtime/ClientRealtimePacketType'

export default class ClientChatMessageSimpleReplyPacket extends ClientRealtimePacket {
	id: string | unknown
	conversation: string | unknown
	parentMessage: string | unknown
	message: string | unknown

	constructor(id: string, conversation: string, parentMessage: string, message: string) {
		super(ClientRealtimePacketType.CHAT_MESSAGE_SIMPLE_REPLY)

		this.id = id
		this.conversation = conversation
		this.parentMessage = parentMessage
		this.message = message
	}
}
