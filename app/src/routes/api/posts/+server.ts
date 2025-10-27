import { error, json, redirect } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import AppConsts from '../../../AppConsts'
import globals from '$lib/server/globals'
import DBPost from '../../../db/entities/Post'
import DBTableName from '../../../db/TableName'
import type UserFollow from '../../../db/entities/UserFollow'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import ImageUtils from '../../(app)/welcome/ImageUtils'
import sharp from 'sharp'
import Post from '../../../db/entities/Post'
import { randomUUID } from 'crypto'
import PostImageAttachment from '../../../db/entities/PostImageAttachment'
import User from '../../../db/entities/User'
import TableName from '../../../db/TableName'
import PostImageAttachmentService from '$lib/server/services/PostImageAttachmentService.server'
import type PostType from '../../../post/PostType'
import type PostLike from '../../../db/entities/PostLike'
import DBPostUtils from '$lib/server/services/PostService.server'
import { IsNull } from 'typeorm'

// async function getHomeFeed(userId: string, page: number = 1, limit: number = 20) {
// 	const followRepository = await Global.db.manager.connection.getRepository<UserFollow>(DBTableName.USER_FOLLOWS)
//
// 	const followingQuery = followRepository
// 		.createQueryBuilder('follow')
// 		.select('follow.followed_id')
// 		.where('follow.follower_id = :userId', { userId: userId })
//
// 	const postRepository = await Global.db.manager.connection.getRepository<DBPost>(DBTableName.POSTS)
//
// 	const posts = await postRepository
// 		.createQueryBuilder('post')
// 		.leftJoinAndSelect('post.author', 'author')
// 		.leftJoinAndSelect('post.likes', 'like')
// 		.leftJoinAndSelect('post.reposts', 'repost')
// 		.where('post.author_id IN (' + followingQuery.getQuery() + ')')
// 		.orWhere('repost.user_id IN (' + followingQuery.getQuery() + ')')
// 		.setParameters({ userId: userId })
// 		.orderBy('post.createdAt', 'DESC')
// 		.addOrderBy('repost.createdAt', 'DESC')
// 		.skip((page - 1) * limit)
// 		.take(limit)
// 		.getMany()
//
// 	return posts
// }

export interface ResponsePost {
	id: string

	authorId: string
	authorHandle: string
	authorName: string

	timestamp: number
	content: string
	attachments: string[]
	repliesCount: number
	/** Initially loaded replies. The list can be incomplete. */
	replies: ResponsePost[]
	likes: number

	hasBeenLikedByUser?: boolean
}

export interface PostReplyResponse extends ResponsePost {
	replyingTo: string
}

export interface PostsResponse {
	posts: ResponsePost[]
	hasMore: boolean
}

export async function GET(event) {
	// const formData = await event.request.formData()

	// let rawCursor = formData.get('cursor')
	//
	// if(typeof rawCursor !== 'string') {
	// 	throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	// }
	//
	// const cursor = Number(rawCursor)

	const postRepository = globals.db.manager.connection.getRepository<DBPost>(DBTableName.POSTS)
	const postLikesRepository = globals.db.manager.connection.getRepository<PostLike>(DBTableName.POST_LIKES)

	const posts = await postRepository.find({
		/** Loads `author` and `attachments` relations. TODO: Get rid of un-paginated replies. */
		relations: {
			author: true,
			attachments: true,
			replies: {
				author: true,
			}
		},
		order: {
			timestamp: 'DESC',
		},
		where: {
			replyingToPost: IsNull(),
		},
	})

	const responsePosts: ResponsePost[] = []

	const session = await UserSessionService.getAndProcessSession(event.cookies)
	const isLoggedIn = !!session

	for(const post of posts) {
		const postResponse = await DBPostUtils.createPostDtoFromEntity(postLikesRepository, post)

		if(isLoggedIn) {
			const hasBeenLikedByUser = await DBPostUtils.isPostLikedByUser(postLikesRepository, post.id, session!.userId)

			if(hasBeenLikedByUser) {
				postResponse.hasBeenLikedByUser = true
			}

			for(const reply of postResponse.replies) {
				const hasBeenLikedByUser = await DBPostUtils.isPostLikedByUser(postLikesRepository, reply.id, session!.userId)

				if(hasBeenLikedByUser) {
					reply.hasBeenLikedByUser = true
				}
			}
		}

		responsePosts.push(postResponse)
	}

	return json({
		posts: responsePosts,
		hasMore: false
	} satisfies PostsResponse)
}

export interface NewPostResponse {
	postId: string
	postTime: number
	attachments: string[]
}

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
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

	let newPostId: string
	let postTime: Date
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

		newPostId = randomUUID()
		postTime = new Date()

		newPost.id = newPostId
		newPost.content = content
		newPost.timestamp = postTime
		newPost.author = postingUser

		await postsRepository.save(newPost)

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
		postId: newPostId!,
		postTime: postTime!.getTime(),
		attachments: uploadedAttachmentsIds,
	} satisfies NewPostResponse, {
		status: HTTPCode.CREATED,
	})
}
