import { redirect } from '@sveltejs/kit'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import globals from '$lib/server/globals'
import type UserSession from '../../../db/entities/UserSession'
import TableName from '../../../db/TableName'
import HTTPCode from '../../../HTTPCode'

export async function GET(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if (session) {
		await globals.db.manager.connection.getRepository<UserSession>(TableName.USER_SESSIONS)
			.remove(session)
	}

	return redirect(HTTPCode.FOUND, '/signin')
}
