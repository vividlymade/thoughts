import { error, json } from '@sveltejs/kit'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import HTTPCode from '../../../../HTTPCode'
import globals from '$lib/server/globals'
import User from '../../../../db/entities/User'
import TableName from '../../../../db/TableName'
import type Post from '../../../../db/entities/Post'

/** TODO: Update an existing post if one owns it. */
export function PATCH() {
	throw new Error("Not implemented")
}

export async function DELETE(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const postId = event.params.id

	const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
	const user = await usersRepository.findOneBy({
		id: session.userId,
	})

	if(!user) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	const postsRepository = globals.db.manager.connection.getRepository<Post>(TableName.POSTS)
	const postToRemove = await postsRepository.findOne({
		where: {
			id: postId,
		},
		relations: {
			replyingToPost: true,
		},
	})

	if(!postToRemove) {
		throw error(HTTPCode.FORBIDDEN)
	}

	if(postToRemove.authorId !== session!.userId) {
		throw error(HTTPCode.FORBIDDEN)
	}

	await globals.db.manager.connection.transaction(async (transaction) => {
		const postsRepository = globals.db.manager.connection.getRepository<Post>(TableName.POSTS)

		await postsRepository.delete({
			id: postToRemove.id,
		})

		if(postToRemove.replyingToPost) {
			await postsRepository.decrement({
				id: postToRemove.replyingToPost.id,
			}, 'repliesCount', 1)
		}
	})

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
