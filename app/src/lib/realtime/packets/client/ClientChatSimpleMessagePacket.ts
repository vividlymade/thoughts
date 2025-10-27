import ClientRealtimePacket from '$lib/realtime/ClientRealtimePacket'
import ClientRealtimePacketType from '$lib/realtime/ClientRealtimePacketType'

export default class ClientChatSimpleMessagePacket extends ClientRealtimePacket {
	id: string | unknown
	conversation: string | unknown
	content: string | unknown

	constructor(id: string, conversation: string, message: string) {
		super(ClientRealtimePacketType.CHAT_SIMPLE_MESSAGE)

		this.id = id
		this.conversation = conversation
		this.content = message
	}
}
