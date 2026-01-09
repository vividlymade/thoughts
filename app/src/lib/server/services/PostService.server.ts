import type PostImageAttachment from '../../../db/entities/PostImageAttachment'
import type Post from '../../../db/entities/Post'
import type { PostReplyResponse, ResponsePost } from '../../../routes/api/posts/+server'
import type { Repository } from 'typeorm'
import type PostLike from '../../../db/entities/PostLike'

export default {
	getImageAttachmentIds(attachments: PostImageAttachment[]) {
		const attachmentsIds: string[] = []

		for(const attachment of attachments) {
			attachmentsIds.push(attachment.id)
		}

		return attachmentsIds
	},

	async createPostDtoFromEntity(repository: Repository<PostLike>, post: Post): Promise<ResponsePost> {
		const imageAttachmentsIds = this.getImageAttachmentIds(post.attachments)

		const replies: PostReplyResponse[] = []

		for(const reply of post.replies) {
			const attachmentIds = reply.attachments

			replies.push({
				/** TODO */
				attachments: [],
				authorId: reply.authorId,
				authorHandle: reply.author.handle,
				authorName: reply.author.name,
				content: reply.content,
				id: reply.id,
				likes: Number(reply.likeCount),
				replies: [],
				repliesCount: Number(reply.repliesCount),
				replyingTo: '',
				timestamp: reply.timestamp.getTime(),
			})
		}

		return {
			id: post.id,
			attachments: imageAttachmentsIds,
			authorId: post.author.id,
			authorHandle: post.author.handle,
			authorName: post.author.name,
			content: post.content,
			timestamp: post.timestamp.getTime(),
			repliesCount: Number(post.repliesCount),
			replies: replies,
			likes: Number(post.likeCount),
		}
	},

	/** Gets all the likes for the given post. It doesn't use denormalized counter. */
	async countPostLikes(postLikesRepository: Repository<PostLike>, post: Post) {
		return await postLikesRepository.countBy({
			postId: post.id,
		})
	},

	/** Checks whether the post is liked by the given user. */
	async isPostLikedByUser(postLikesRepository: Repository<PostLike>, postId: string, userId: string) {
		return await postLikesRepository.findOneBy({
			postId: postId,
			userId: userId
		}) !== null
	},
}
