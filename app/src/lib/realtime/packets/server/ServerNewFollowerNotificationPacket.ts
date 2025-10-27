import ServerRealtimePacketType from '$lib/realtime/ServerRealtimePacketType'
import ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ServerNewFollowerNotificationPacket extends ServerRealtimePacket {
	follower: string

	constructor(follower: string) {
		super(ServerRealtimePacketType.NOTIFICATION_NEW_FOLLOWER)

		this.follower = follower
	}
}
