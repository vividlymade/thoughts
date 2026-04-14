import globals from '../globals'
import { LargeObjectManager } from 'pg-large-object'
import TableName from '../../../db/TableName'
import PostImageAttachment from '../../../db/entities/PostImageAttachment'
import PGLargeObjectUtils from '$lib/server/PGLargeObjectUtils'
import type Post from '../../../db/entities/Post'
import { randomUUID } from 'crypto'
import { EntityManager } from 'typeorm'

export default {
	async downloadImageAttachment(attachmentId: string) {
		const imageAttachmentsRepository = globals.db.manager.connection.getRepository<PostImageAttachment>(TableName.POST_IMAGE_ATTACHMENTS)
		const attachment = await imageAttachmentsRepository.findOneBy({
			id: attachmentId,
		})

		if(!attachment) {
			return null
		}

		return await globals.db.manager.connection.transaction(async (manager) => {
			const largeObjectManager = new LargeObjectManager({ pg: manager })

			return PGLargeObjectUtils.readAsBuffer(largeObjectManager, attachment.contentOid)
		})
	},
	async uploadImageAttachment(entityManager: EntityManager, post: Post, image: Buffer, order: number) {
		return entityManager.transaction(async (entityManager) => {
			const imageAttachmentsRepository = entityManager.getRepository<PostImageAttachment>(TableName.POST_IMAGE_ATTACHMENTS)
			const loManager = new LargeObjectManager({ pg: entityManager })

			const imageOid = await loManager.createAsync()

			await PGLargeObjectUtils.writeFromBuffer(loManager, imageOid, image)

			const newImageAttachment = new PostImageAttachment()

			newImageAttachment.id = randomUUID()
			newImageAttachment.contentOid = imageOid
			newImageAttachment.post = post
			newImageAttachment.order = order

			await imageAttachmentsRepository.save(newImageAttachment)

			return newImageAttachment
		})
	},

	async removeImageAttachment(attachmentId: string) {
		return await globals.db.manager.connection.transaction(async (manager) => {
			const imageAttachmentRepository = manager.getRepository<PostImageAttachment>(TableName.POST_IMAGE_ATTACHMENTS)
			const largeObjectManager = new LargeObjectManager({ client: manager })

			const attachment = await imageAttachmentRepository.findOneBy({
				id: attachmentId,
			})

			if (!attachment) {
				return
			}

			/** Deletes the image Large Object. */
			await largeObjectManager.unlinkAsync(attachment.contentOid)
		})
	}
}
