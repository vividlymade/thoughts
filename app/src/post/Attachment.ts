import type AttachmentType from './AttachmentType'

export default abstract class Attachment {
	type: AttachmentType
	protected constructor(type: AttachmentType) {
		this.type = type
	}
}
