import type { ChannelContext } from '../routes/(app)/messages/Channel.svelte'
import type Message from '../routes/(app)/messages/[channel]/Message.svelte.ts'

export default new class {
	hasBeenInitialized = false
	contexts: ChannelContext[] = $state([])

	/** The map storing all the local messages awaiting the server acknowledgement.
	 * Those are mapped by locally assigned temporary IDs. */
	messagesAwaitingForAcknowledgement = new Map<string, Message>()
}
