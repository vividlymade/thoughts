import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ServerMentionNotificationPacket extends ServerRealtimePacket {
	post: string

	constructor(post: string) {
		super(ServerRealtimePacketType.NOTIFICATION_LIKE)

		this.post = post
	}
}