import HTTPCode from '../../../../../HTTPCode'
import { error } from '@sveltejs/kit'
import PostImageAttachmentService from '$lib/server/services/PostImageAttachmentService.server'

export async function GET(event) {
	const attachmentId = event.params.id
	const attachmentBuffer = await PostImageAttachmentService.downloadImageAttachment(attachmentId)

	if(!attachmentBuffer) {
		throw error(HTTPCode.NOT_FOUND)
	}

	return new Response(attachmentBuffer as any, {
		status: HTTPCode.SUCCESS,
	})
}
