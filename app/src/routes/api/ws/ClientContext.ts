import type { Peer } from '@sveltejs/kit'
import type ServerRealtimePacket from '$lib/realtime/ServerRealtimePacket'

export default class ClientContext {
	peer!: Peer
	userId: string
	constructor(userId: string) {
		this.userId = userId
	}

	send(packet: ServerRealtimePacket) {
		this.peer.send(JSON.stringify(packet))
	}
}