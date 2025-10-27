import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../../HTTPCode'
import globals from '$lib/server/globals'
import TableName from '../../../../../db/TableName'
import UserFollow from '../../../../../db/entities/UserFollow'
import type User from '../../../../../db/entities/User'
import * as UUIDUtils from '../../../../../utils/UUIDUtils'

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const userId = event.params.id

	if(!UUIDUtils.isUUIDv4Valid(userId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const requestingFollowerId = session!.userId
	const requestedFolloweeId = userId

	if(requestingFollowerId === requestedFolloweeId) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	return await globals.db.manager.connection.transaction(async (entityManager) => {
		const userFollowsRepository = entityManager.getRepository<UserFollow>(TableName.USER_FOLLOWS)
		const usersRepository = entityManager.getRepository<User>(TableName.USERS)

		const userToFollow = await usersRepository.findOneBy({
			id: requestedFolloweeId,
		})

		if(!userToFollow) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const existentUserFollow = await userFollowsRepository.findOneBy({
			followerId: requestingFollowerId,
			followeeId: requestedFolloweeId,
		})

		if(existentUserFollow) {
			throw error(HTTPCode.CONFLICT)
		}

		const userFollow = new UserFollow()

		userFollow.followeeId = requestedFolloweeId
		userFollow.followerId = requestingFollowerId
		userFollow.timestamp = new Date()

		await userFollowsRepository.save(userFollow)

		await usersRepository.increment({
			id: requestedFolloweeId,
		}, 'followersCount', 1)

		await usersRepository.increment({
			id: requestingFollowerId,
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

	const requestingFollowerId = session!.userId
	const requestedFolloweeId = userId

	if(requestingFollowerId === requestedFolloweeId) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	return await globals.db.manager.connection.transaction(async (entityManager) => {
		const userFollowsRepository = entityManager.getRepository<UserFollow>(TableName.USER_FOLLOWS)
		const usersRepository = entityManager.getRepository<User>(TableName.USERS)

		const userToFollow = await usersRepository.findOneBy({
			id: requestedFolloweeId,
		})

		if(!userToFollow) {
			throw error(HTTPCode.NOT_FOUND)
		}

		const existentUserFollow = await userFollowsRepository.findOneBy({
			followerId: requestingFollowerId,
			followeeId: requestedFolloweeId,
		})

		if(!existentUserFollow) {
			throw error(HTTPCode.CONFLICT)
		}

		await userFollowsRepository.delete(existentUserFollow)

		await usersRepository.decrement({
			id: requestedFolloweeId,
		}, 'followersCount', 1)

		await usersRepository.decrement({
			id: requestingFollowerId,
		}, 'followingCount', 1)

		return new Response(null, {
			status: HTTPCode.SUCCESS_NO_CONTENT,
		})
	})
}
