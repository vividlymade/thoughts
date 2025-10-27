import type ServerRealtimePacketType from './ServerRealtimePacketType'

export default abstract class ServerRealtimePacket {
	type: ServerRealtimePacketType
	protected constructor(type: ServerRealtimePacketType) {
		this.type = type
	}
}
