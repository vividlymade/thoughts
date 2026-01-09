import type ServerRealtimePacketType from './ServerRealtimePacketType'

/** The base packet class for all outgoing server packets.
 * All new realtime server packet structures must extend this class. */
export default abstract class ServerRealtimePacket {
	type: ServerRealtimePacketType
	protected constructor(type: ServerRealtimePacketType) {
		this.type = type
	}
}
