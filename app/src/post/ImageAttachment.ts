import Attachment from './Attachment'
import AttachmentType from './AttachmentType'

export default class extends Attachment {
	source: string
	constructor(source: string) {
		super(AttachmentType.IMAGE)

		this.source = source
	}
}
