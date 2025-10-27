import type User from '../../../../db/entities/User'
import TableName from '../../../../db/TableName'
import globals from '$lib/server/globals'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'

export async function load(event) {
	await event.parent()

	const userId = event.locals.session!.userId
	const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
	const user = await usersRepository.findOneBy({
		id: userId,
	})

	if(!user) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	return {
		settings: {
			notifications: {
				enabledNotificationSounds: user.enabledNotificationSounds,
			}
		}
	}
}
