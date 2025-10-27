import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../../../HTTPCode'
import globals from '$lib/server/globals'
import type User from '../../../../../../db/entities/User'
import TableName from '../../../../../../db/TableName'

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
	const user = await usersRepository.findOneBy({
		id: session.userId,
	})

	if(!user) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	if(user.allowMessagesFromEveryone) {
		await usersRepository.update({
			id: user.id,
		}, {
			allowMessagesFromEveryone: false,
		})
	}

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
