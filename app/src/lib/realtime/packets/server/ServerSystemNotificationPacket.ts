import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ServerSystemNotificationPacket extends ServerRealtimePacket {
	id: string | unknown
	title: string | unknown
	content: string | unknown
	time: number | unknown

	constructor(id: string, title: string, content: string, time: number) {
		super(ServerRealtimePacketType.NOTIFICATION_SYSTEM)

		this.id = id
		this.title = title
		this.content = content
		this.time = time
	}
}
