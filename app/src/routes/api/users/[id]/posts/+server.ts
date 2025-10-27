import globals from '$lib/server/globals'
import DBPost from '../../../../../db/entities/Post'
import DBTableName from '../../../../../db/TableName'
import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../../../HTTPCode'
import type { ResponsePost, PostsResponse } from '../../../posts/+server'
import DBPostUtils from '$lib/server/services/PostService.server'
import type User from '../../../../../db/entities/User'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import Post from '../../../../../db/entities/Post'
import AppConsts from '../../../../../AppConsts'

export interface DBDedicatedUserPostResponse extends Post {
	isLiked: boolean
}

export async function GET(event) {
	const profileHandle = event.params.id

	const url = event.url

	const afterTimeCursor = url.searchParams.get('after')
	/** The last post (ID) cursor is used to differentiate entities posted at the same time. */
	const lastPostCursor = url.searchParams.get('last')

	const hasCursors = !!afterTimeCursor && !!lastPostCursor
	const hasNoCursors = !afterTimeCursor && !lastPostCursor

	const isValidRequest = hasCursors || hasNoCursors

	if(!isValidRequest) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const userRepository = globals.db.manager.connection.getRepository<User>(DBTableName.USERS)
	const user = await userRepository.findOneBy({
		handle: profileHandle,
	})

	if(!user) {
		throw error(HTTPCode.NOT_FOUND)
	}

	const postRepository = globals.db.manager.connection.getRepository<DBPost>(DBTableName.POSTS)

	const postQueryBuilder = postRepository
		.createQueryBuilder('post')
		.leftJoinAndSelect('post.author', 'author')
		.leftJoinAndSelect('post.attachments', 'attachments')
		.where('post."authorId" = :id', { id: user.id, })
		.orderBy('post.timestamp', 'DESC')
		.addOrderBy('post.id', 'DESC')
		/** Gets the max allowed posts per load along with the extra one for checking whether there is more results. */
		.take(AppConsts.MAX_POSTS_PER_LOAD + 1)

	const session = await UserSessionService.getAndProcessSession(event.cookies)
	const isLoggedIn = !!session

	if(isLoggedIn) {
		/** Queries additional virtual columns for logged user. */
		postQueryBuilder
			.addSelect(
	`EXISTS(
				SELECT 1 FROM post_likes post_like
				WHERE post_like."postId" = post.id
				AND post_like."userId" = :userId)`,
				'isLiked'
			  )
			  .setParameter('userId', session!.userId)
	}

	if(hasCursors) {
		postQueryBuilder.andWhere(
		`(post.timestamp < :afterTimeCursor OR 
		(post.timestamp = :afterTimeCursor AND post.id < :lastPostCursor))`,
		{ afterTimeCursor: afterTimeCursor, lastPostCursor: lastPostCursor }
		)
	}

	const queryResponse = await postQueryBuilder.getRawAndEntities()

	const responsePosts: ResponsePost[] = []

	const posts = queryResponse.entities

	const rawPostsByPostId = new Map<string, any>()

	for(const post of posts) {
		rawPostsByPostId.set(post.id, queryResponse.raw.find((entry) => entry['post_id'] === post.id))
	}

	const postIds: string[] = posts.map(post => post.id)

	/** TODO: Implement post reply previews. */
	// const previewRepliesResult = await postRepository.manager
	// 	.createQueryBuilder()
	// 	.select('replies.id', 'id')
	// 	.from((subQuery) => {
	// 		return subQuery
	// 			.select('reply.id', 'id')
	// 			.addSelect(
	// 				`ROW_NUMBER() OVER (
	// 					PARTITION BY reply.replyingToPostId
	// 					ORDER BY
	// 						reply.timestamp DESC,
	// 						reply.id DESC
	// 				) as rowCount`
	// 			)
	// 			.from(TableName.POSTS, 'reply')
	// 			.where('reply.replyingToPostId IN (:...ids)', { ids: postIds })
	// 			.andWhere('reply.replyingToPostId IS NOT NULL')
	// 	}, 'replies')
	// 	.where('replies.rowCount <= :limit', { limit: AppConsts.MAX_REPLIES_PER_LOAD + 1 })
	// 	.getRawMany<Post[]>()
	//
	// const postRepliesByPostId = new Map<string, Post[]>()

	/** TODO */
	// for(const postReplies of previewRepliesResult) {
	// 	postRepliesByPostId.set(postReplies., postReplies)
	// }

	const hasMore = posts.length > AppConsts.MAX_POSTS_PER_LOAD

	if (hasMore) {
		posts.pop()
	}

	for(const post of posts) {
		const attachmentsIds = DBPostUtils.getImageAttachmentIds(post.attachments)
		const replies: ResponsePost[] = []

		// for(const reply of post.replies) {
		// 	// const replyResponsePost = {}
		// 	const attachmentsIds = DBPostUtils.getImageAttachmentsIdsFromAttachments(reply.attachments)
		//
		// 	replies.push({
		// 		id: reply.id,
		//
		// 		authorId: reply.authorId,
		// 		authorHandle: reply.author.handle,
		// 		authorName: reply.author.name,
		//
		// 		attachments: attachmentsIds,
		// 		content: reply.content,
		// 		likes: Number(reply.likeCount),
		// 		repliesCount: Number(reply.repliesCount),
		// 		/** TODO */
		// 		replies: [],
		// 		timestamp: reply.timestamp.getTime()
		// 	})
		// }

		const responsePost: ResponsePost = {
			attachments: attachmentsIds,
			/** TODO: Make these three optional in class (likely make a base object for the post so it can be reused by entities with already known and unknown authors when received).
			 * Those can be included outside the posts as the author is already known. */
			authorHandle: post.author.handle,
			authorId: profileHandle,
			authorName: post.author.name,

			id: post.id,
			content: post.content,
			/** We can safely assume it is highly unlikely for an overflow to happen. */
			likes: Number(post.likeCount),
			repliesCount: Number(post.repliesCount),
			replies: replies,
			timestamp: post.timestamp.getTime(),
		}

		if(isLoggedIn) {
			const rawPost = rawPostsByPostId.get(post.id)!

			if(rawPost['isLiked']) {
				responsePost.hasBeenLikedByUser = true
			}
		}

		responsePosts.push(responsePost)
	}

	return json({
		posts: responsePosts,
		hasMore: hasMore,
	} satisfies PostsResponse, {
		status: HTTPCode.SUCCESS,
	})
}
