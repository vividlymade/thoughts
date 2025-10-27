import { error, json } from '@sveltejs/kit'
import globals from '$lib/server/globals'
import  DBPost from '../../../../../db/entities/Post'
import DBTableName from '../../../../../db/TableName'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import HTTPCode from '../../../../../HTTPCode'
import AppConsts from '../../../../../AppConsts'
import sharp from 'sharp'
import ImageUtils from '../../../../(app)/welcome/ImageUtils'
import PostImageAttachment from '../../../../../db/entities/PostImageAttachment'
import Post from '../../../../../db/entities/Post'
import TableName from '../../../../../db/TableName'
import User from '../../../../../db/entities/User'
import { randomUUID } from 'crypto'
import PostImageAttachmentService from '$lib/server/services/PostImageAttachmentService.server'
import DBPostUtils from '$lib/server/services/PostService.server'
import type { NewPostResponse } from '../../+server'

/** TODO: Implement getting the replies of the specific post. */
export async function GET() {
	const posts = await globals.db.manager.connection.getRepository<DBPost>(DBTableName.POSTS)
		.createQueryBuilder()
		.select()
		.getRawAndEntities()

	return json({})
}

export interface NewReplyResponse {
	replyId: string
	replyTime: number
	attachments: string[]
}

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const postId = event.params.id

	const postsRepository = globals.db.manager.connection.getRepository<Post>(TableName.POSTS)

	const post = await postsRepository.findOneBy({
		id: postId,
	})

	if(!post) {
		throw error(HTTPCode.NOT_FOUND)
	}

	const formData = await event.request.formData()

	const content = formData.get('content')

	if(typeof content !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const attachments = formData.getAll('attachment')

	const hasAttachments = attachments.length > 0
	const hasTextContent = content.length > 0

	const hasAnythingToPost = hasTextContent || hasAttachments

	if (!hasAnythingToPost) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(hasTextContent) {
		if(content.length < AppConsts.MIN_ALLOWED_POST_LENGTH ||
			content.length > AppConsts.MAX_ALLOWED_POST_LENGTH
		) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}
	}

	if(attachments.length > AppConsts.MAX_ALLOWED_POST_ATTACHMENTS) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const validatedAttachments: sharp.Sharp[] = []

	for (const attachment of attachments) {
		if(!(attachment instanceof File)) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		if(attachment.size > AppConsts.MAX_ALLOWED_POST_ATTACHMENT_SIZE) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		const imageBuffer = await attachment.arrayBuffer()

		const validatedImage = await ImageUtils.validateUserImageFormatFromBuffer(imageBuffer, true)
		const isValid = validatedImage instanceof sharp

		if(!isValid) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		validatedAttachments.push(validatedImage)
	}

	const processedAttachments: Buffer[] = []

	for(const attachment of validatedAttachments) {
		ImageUtils.applyExifRotation(attachment)

		processedAttachments.push(
			await ImageUtils.convertAndCompressImageIntoNormalizedFormat(attachment)
		)
	}

	let newReplyPostId: string
	let newReplyPostTime: Date
	const uploadedAttachments: PostImageAttachment[] = []

	await globals.db.manager.connection.transaction(async (entityManager) => {
		const postsRepository = entityManager.getRepository<Post>(TableName.POSTS)
		const usersRepository = entityManager.getRepository<User>(TableName.USERS)
		const postingUser = await usersRepository.findOneBy({
			id: session.userId,
		})

		if(!postingUser) {
			throw error(HTTPCode.INTERNAL_SERVER_ERROR)
		}

		const newPost = new Post()

		newReplyPostId = randomUUID()
		newReplyPostTime = new Date()

		newPost.id = newReplyPostId
		newPost.content = content
		newPost.timestamp = newReplyPostTime
		newPost.author = postingUser
		newPost.replyingToPostId = postId

		await postsRepository.save(newPost)

		await postsRepository.increment({
			id: postId,
		}, 'repliesCount', 1)

		for(let i = 0; i < processedAttachments.length; i++) {
			const attachment = processedAttachments[i]
			const order = i

			uploadedAttachments.push(
				await PostImageAttachmentService.uploadImageAttachment(
				entityManager, newPost, attachment, order
				)
			)
		}
	})

	const uploadedAttachmentsIds = DBPostUtils.getImageAttachmentIds(uploadedAttachments)

	return json({
		replyId: newReplyPostId!,
		replyTime: newReplyPostTime!.getTime(),
		attachments: uploadedAttachmentsIds,
	} satisfies NewReplyResponse, {
		status: HTTPCode.CREATED,
	})
}
