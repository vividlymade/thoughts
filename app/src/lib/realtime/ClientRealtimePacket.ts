import type ClientRealtimePacketType from './ClientRealtimePacketType'

export default abstract class ClientRealtimePacket {
	type: ClientRealtimePacketType
	protected constructor(type: ClientRealtimePacketType) {
		this.type = type
	}
}
