import ChannelType from './ChannelType'

export class Channel {
	id: string
	type: ChannelType
	picture: string
	/** The name of this channel. Can be undefined for group chats, where names can be derived from the participants list. */
	name: string | undefined
	latestMessageTime: number | undefined
	latestMessage: string | undefined
	isUnread: boolean

	constructor(
		id: string,
		type: ChannelType,
		picture: string,
		name: string | undefined,
		latestMessageTime: number | undefined,
		latestMessage: string | undefined,
		isUnread: boolean,
	) {
		this.id = id
		this.type = type
		this.picture = $state(picture)
		this.name = $state(name)
		this.latestMessageTime = $state(latestMessageTime)
		this.latestMessage = $state(latestMessage)
		this.isUnread = $state(isUnread)
	}
}

export class DirectChannel extends Channel {
	handle: string
	isFollowing: boolean
	isFollowed: boolean

	constructor(
		id: string,
		picture: string,
		handle: string,
		name: string | undefined,
		latestMessageTime: number | undefined,
		latestMessage: string | undefined,
		isUnread: boolean,
		isFollowing: boolean,
		isFollowed: boolean,
	) {
		super(
			id,
			ChannelType.DIRECT,
			picture,
			name,
			latestMessageTime,
			latestMessage,
			isUnread,
		)

		this.handle = handle
		this.isFollowing = isFollowing
		this.isFollowed = isFollowed
	}
}

export class GroupChannel extends Channel {
	previewMembers: string[]
	membersCount: number

	constructor(
		id: string,
		picture: string,
		name: string | undefined,
		previewMembers: string[],
		membersCount: number,
		latestMessageTime: number,
		latestMessage: string,
		isUnread: boolean,
	) {
		super(
			id,
			ChannelType.GROUP,
			picture,
			name,
			latestMessageTime,
			latestMessage,
			isUnread,
		)

		this.previewMembers = previewMembers
		this.membersCount = membersCount
	}
}

export class ChannelContext {
	channel: Channel
	currentMessage: string
	constructor(channel: Channel) {
		this.channel = channel
		this.currentMessage = $state("")
	}
}
