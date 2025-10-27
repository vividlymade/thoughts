import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../../HTTPCode'
import globals from '$lib/server/globals'
import type User from '../../../../../db/entities/User'
import TableName from '../../../../../db/TableName'
import AuthService from '$lib/server/services/AuthService.server'

export async function POST(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const formData = await event.request.formData()

	const currentPasswordInput = formData.get('currentPassword')

	if(typeof currentPasswordInput !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const newPasswordInput = formData.get('newPassword')

	if(typeof newPasswordInput !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const newPasswordConfirmInput = formData.get('newPasswordConfirm')

	if(typeof newPasswordConfirmInput !== 'string') {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(newPasswordInput !== newPasswordConfirmInput) {
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
	
	const isActionAuthorized = await AuthService.verifyPassword(currentPasswordInput, user.passwordHash)

	if(!isActionAuthorized) {
		throw error(HTTPCode.CONFLICT)
	}

	const newPasswordHash = await AuthService.hashPassword(newPasswordInput)

	await usersRepository.update({
		id: user.id,
	}, {
		passwordHash: newPasswordHash,
	})

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
