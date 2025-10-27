import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../../HTTPCode'
import globals from '$lib/server/globals'
import type User from '../../../../../db/entities/User'
import TableName from '../../../../../db/TableName'

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const formData = await event.request.formData()

	const providedCurrentEmail = formData.get('currentEmail')

	if(typeof providedCurrentEmail !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const providedNewEmail = formData.get('newEmail')

	if(typeof providedNewEmail !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const providedPassword = formData.get('password')

	if(typeof providedPassword !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
	const user = await usersRepository.findOne({
		where: {
			id: session.userId,
		},

		select: {
			passwordHash: true,
		}
	})

	if(!user) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	if(providedCurrentEmail !== user.email) {
		throw error(HTTPCode.CONFLICT)
	}

	/** TODO */
	const hashOfProvidedPassword = '' + providedPassword

	if(hashOfProvidedPassword !== user.passwordHash) {
		throw error(HTTPCode.CONFLICT)
	}

	await usersRepository.update({
		id: user.id,
	}, {
		email: providedNewEmail,
	})

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
