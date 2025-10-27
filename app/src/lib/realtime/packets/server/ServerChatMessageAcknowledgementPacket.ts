import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ServerChatMessageAcknowledgementPacket extends ServerRealtimePacket {
	clientMessageId: string | unknown
	assignedMessageId: string | unknown

	constructor(clientMessageId: string, assignedMessageId: string) {
		super(ServerRealtimePacketType.CHAT_MESSAGE_ACKNOWLEDGEMENT)

		this.clientMessageId = clientMessageId
		this.assignedMessageId = assignedMessageId
	}
}
