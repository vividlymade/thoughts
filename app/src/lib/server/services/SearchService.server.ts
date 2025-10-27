import AppConsts from '../../../AppConsts'
import globals from '$lib/server/globals'
import type User from '../../../db/entities/User'
import TableName from '../../../db/TableName'
import type Post from '../../../db/entities/Post'

export default {
	/** TODO: Implement returning DTO objects. */
	async searchTag(tag: string) {
		const postsRepository = globals.db.manager.connection.getRepository<Post>(TableName.POSTS)

		const posts = await postsRepository.createQueryBuilder('post')
			.select(['post.id', 'post.content', 'post.timestamp', 'post.likeCount', 'post.repliesCount'])
			.leftJoin('post.author', 'author')
			.addSelect(['author.id', 'author.handle', 'author.name'])
			.leftJoin('post.attachments', 'attachment')
				.addSelect('attachment.id')
			.where('entry.content ~* :pattern', { pattern: `(^|\\s)#[[:alpha:]_][[:alnum:]_]*(\\b|$)` })
			.orderBy('post.likeCount', 'DESC')
			.take(AppConsts.MAX_SEARCH_POST_RESULTS + 1)
			.getMany()

		// const responsePosts = []

		return {
			// posts: responsePosts,
			hasMore: posts.length > AppConsts.MAX_SEARCH_TAG_RESULTS,
		}
	},
	async searchAll(searchTerm: string) {
		const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
		const postsRepository = globals.db.manager.connection.getRepository<Post>(TableName.POSTS)

		const users = await usersRepository
			.createQueryBuilder('user')
			.select([
				'user.id',
				'user.handle',
				'user.name',
				'user.followersCount',
				'user.pictureOid',
			])
			.where('user.name ILIKE :pattern OR user.handle ILIKE :pattern', { pattern: `${searchTerm}%` })
			.orderBy('CASE ' +
					'WHEN user.handle ILIKE :pattern THEN 1 ' +
					'ELSE 2 ' +
				'END', 'ASC')
			.addOrderBy('user.followersCount', 'DESC')
			.addOrderBy('user.handle', 'ASC')
			.take(AppConsts.MAX_SEARCH_USER_RESULTS + 1)
			.getMany()

		const posts = await postsRepository.createQueryBuilder('post')
			.select(['post.id', 'post.content', 'post.timestamp', 'post.likeCount', 'post.repliesCount'])
			.leftJoin('post.author', 'author')
			.addSelect(['author.id', 'author.handle', 'author.name'])
			.leftJoin('post.attachments', 'attachment')
				.addSelect('attachment.id')
			.where('post.content ILIKE :pattern', { pattern: `%${searchTerm}%` })
			.orderBy('post.likeCount', 'DESC')
			.addOrderBy('post.timestamp', 'DESC')
			.take(AppConsts.MAX_SEARCH_POST_RESULTS + 1)
			.getMany()

		return {
			users: users,
			posts: posts,

			hasMoreUsers: users.length > AppConsts.MAX_SEARCH_USER_RESULTS,
			hasMorePosts: posts.length > AppConsts.MAX_SEARCH_POST_RESULTS,
		}
	}
}
