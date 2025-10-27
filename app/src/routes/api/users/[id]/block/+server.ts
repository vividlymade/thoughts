import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../../HTTPCode'
import globals from '$lib/server/globals'
import TableName from '../../../../../db/TableName'
import type User from '../../../../../db/entities/User'
import * as UUIDUtils from '../../../../../utils/UUIDUtils'
import { UserBlock } from '../../../../../db/entities/UserBlock'

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const userId = event.params.id

	if(!UUIDUtils.isUUIDv4Valid(userId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const requestingUserId = session!.userId.toLowerCase()
	const requestedUserToBlockId = userId.toLowerCase()

	if(requestingUserId === requestedUserToBlockId) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	return await globals.db.manager.connection.transaction(async (entityManager) => {
		const userBlocksRepository = entityManager.getRepository<UserBlock>(TableName.USER_BLOCKS)
		const usersRepository = entityManager.getRepository<User>(TableName.USERS)

		const userToBlock = await usersRepository.findOneBy({
			id: requestedUserToBlockId,
		})

		if(!userToBlock) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const existentUserBlock = await userBlocksRepository.findOneBy({
			blockerId: requestingUserId,
			blockedId: requestedUserToBlockId,
		})

		if(existentUserBlock) {
			throw error(HTTPCode.CONFLICT)
		}

		const userFollow = new UserBlock()

		userFollow.blockedId = requestedUserToBlockId
		userFollow.blockerId = requestingUserId
		userFollow.timestamp = new Date()

		await userBlocksRepository.save(userFollow)

		await usersRepository.increment({
			id: requestedUserToBlockId,
		}, 'followersCount', 1)

		await usersRepository.increment({
			id: requestingUserId,
		}, 'followingCount', 1)

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

	const userId = event.params.id

	if(!UUIDUtils.isUUIDv4Valid(userId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const requestingUserId = session!.userId.toLowerCase()
	const requestedUserToBlockId = userId.toLowerCase()

	if(requestingUserId === requestedUserToBlockId) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	return await globals.db.manager.connection.transaction(async (entityManager) => {
		const userFollowsRepository = entityManager.getRepository<UserBlock>(TableName.USER_BLOCKS)
		const usersRepository = entityManager.getRepository<User>(TableName.USERS)

		const userToFollow = await usersRepository.findOneBy({
			id: requestedUserToBlockId,
		})

		if(!userToFollow) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const existentUserFollow = await userFollowsRepository.findOneBy({
			blockerId: requestingUserId,
			blockedId: requestedUserToBlockId,
		})

		if(!existentUserFollow) {
			throw error(HTTPCode.CONFLICT)
		}

		await userFollowsRepository.delete(existentUserFollow)

		await usersRepository.decrement({
			id: requestedUserToBlockId,
		}, 'followersCount', 1)

		await usersRepository.decrement({
			id: requestingUserId,
		}, 'followingCount', 1)

		return new Response(null, {
			status: HTTPCode.SUCCESS_NO_CONTENT,
		})
	})
}
