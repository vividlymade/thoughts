export default class Message {
	id: string = $state('')
	authorId!: string
	authorName?: string
	authorHandle?: string
	replyingTo?: {
		content: string,
	}
	time!: Date
	content?: string
	attachments!: string[]
}