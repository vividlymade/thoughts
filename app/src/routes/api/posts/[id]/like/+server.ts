import { error } from '@sveltejs/kit'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import HTTPCode from '../../../../../HTTPCode'
import globals from '$lib/server/globals'
import type Post from '../../../../../db/entities/Post'
import TableName from '../../../../../db/TableName'
import PostLike from '../../../../../db/entities/PostLike'

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const postId = event.params.id

	return await globals.db.manager.connection.transaction(async (entityManager) => {
		const postRepository = entityManager.getRepository<Post>(TableName.POSTS)

		const post = await postRepository.findOneBy({
			id: postId,
		})

		if(!post) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const postLikesRepository = entityManager.getRepository<PostLike>(TableName.POST_LIKES)

		const existentPostLike = await postLikesRepository.findOneBy({
			postId: postId,
			userId: session!.userId,
		})

		if(existentPostLike) {
			throw error(HTTPCode.CONFLICT)
		}

		const newLike = new PostLike()

		newLike.postId = post.id
		newLike.userId = session!.userId
		newLike.timestamp = new Date()

		await postLikesRepository.save(newLike)

		await postRepository.increment({
			id: postId,
		}, 'likeCount', 1)

		return new Response(null, {
			status: HTTPCode.SUCCESS_NO_CONTENT,
		})
	})
}

export async function DELETE(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const postId = event.params.id

	return await globals.db.manager.connection.transaction(async (entityManager) => {
		const postRepository = entityManager.getRepository<Post>(TableName.POSTS)

		const post = await postRepository.findOneBy({
			id: postId,
		})

		if(!post) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const postLikesRepository = entityManager.getRepository<PostLike>(TableName.POST_LIKES)

		const existentPostLike = await postLikesRepository.findOneBy({
			postId: postId,
			userId: session!.userId,
		})

		if(!existentPostLike) {
			throw error(HTTPCode.CONFLICT)
		}

		await postLikesRepository.delete(existentPostLike!)

		await postRepository.decrement({
			id: postId,
		}, 'likeCount', 1)

		return new Response(null, {
			status: HTTPCode.SUCCESS_NO_CONTENT,
		})
	})
}
