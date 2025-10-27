import globals from '$lib/server/globals'
import DBPost from '../../../../../db/entities/Post'
import DBTableName from '../../../../../db/TableName'
import AppConsts from '../../../../../AppConsts'
import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../../../HTTPCode'
import type PostImageAttachment from '../../../../../db/entities/PostImageAttachment'

// export interface MediaResponseEntry {
//
// }

export interface MediaResponse {
	media: string[]
	cursor?: {
		postId: string
		afterTime: number
		order: number
	}
}

export async function GET(event) {
	const profileId = event.params.id

	const url = event.url

	const afterTimeCursor = url.searchParams.get('after')
	const lastReceivedAttachmentPostCursor = url.searchParams.get('last')
	/** It is used to track the order of the previously received attachment entries. */
	const lastReceivedAttachmentOrderCursor = url.searchParams.get('lastOrder')

	const hasCursors = !!afterTimeCursor && !!lastReceivedAttachmentPostCursor && !!lastReceivedAttachmentOrderCursor
	const hasNoCursors = !afterTimeCursor && !lastReceivedAttachmentPostCursor && !lastReceivedAttachmentOrderCursor

	const isValidRequest = hasCursors || hasNoCursors

	if(!isValidRequest) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const attachmentRepository = globals.db.manager.connection.getRepository<PostImageAttachment>(DBTableName.POST_IMAGE_ATTACHMENTS)

	const queryBuilder = attachmentRepository
		.createQueryBuilder('attachment')
		.innerJoinAndSelect('attachment.post', 'post')
			.innerJoinAndSelect('post.author', 'user')
		.where('user.id = :userId', { userId: profileId })
		.orderBy('post.timestamp', 'DESC')
		.addOrderBy('post.id', 'DESC')
		.addOrderBy('attachment.order', 'DESC')
		/** Loads one more to check later whether there is more entries. */
		.take(AppConsts.MAX_MEDIA_ATTACHMENTS_PER_LOAD + 1)

	if(hasCursors) {
		queryBuilder
			/** Fetches records matching one of three conditions. */
			.andWhere(
				/** The post is older than the cursor's timestamp. */
			'(post.timestamp < :afterTimeCursor)' +
				/** The post shares the cursor's timestamp, but contains remaining attachments not yet fetched. */
				'OR (post.timestamp = :afterTimeCursor AND post.id = :postId AND attachment.order < :orderCursor)' +
				/** The post shares the cursor's timestamp, but has a lower ID (tie-breaker for identical timestamps). */
				'OR (post.timestamp = :afterTimeCursor AND post.id < :postId)',
			{
					afterTimeCursor: afterTimeCursor,
					postIdCursor: lastReceivedAttachmentPostCursor,
					orderCursor: lastReceivedAttachmentOrderCursor,
				}
			)
	}

	const queryResult = await queryBuilder.getMany()

	const mediaIds: string[] = []

	for(const attachment of queryResult) {
		mediaIds.push(attachment.id)
	}

	const hasMore = queryResult.length > AppConsts.MAX_MEDIA_ATTACHMENTS_PER_LOAD

	const mediaResponse: MediaResponse = {
		media: mediaIds,
	}

	if(hasMore) {
		const lastPaginatedEntry = queryResult[queryResult.length - 1]

		mediaResponse.cursor = {
			afterTime: lastPaginatedEntry.post.timestamp.getTime(),
			postId: lastPaginatedEntry.post.id,
			order: lastPaginatedEntry.order,
		}
	}

	return json(mediaResponse)
}
