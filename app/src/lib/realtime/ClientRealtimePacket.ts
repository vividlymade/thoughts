import type ClientRealtimePacketType from './ClientRealtimePacketType'

/** The base packet class for all outgoing client packets.
 * All new realtime client packet structures must extend this class. */
export default abstract class ClientRealtimePacket {
	type: ClientRealtimePacketType
	protected constructor(type: ClientRealtimePacketType) {
		this.type = type
	}
}
