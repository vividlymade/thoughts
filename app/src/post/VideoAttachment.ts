import Attachment from './Attachment'
import AttachmentType from './AttachmentType'

export default class VideoAttachment extends Attachment {
	source: string
	constructor(source: string) {
		super(AttachmentType.VIDEO)

		this.source = source
	}
}
