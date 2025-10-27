import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../../../HTTPCode'
import globals from '$lib/server/globals'
import TableName from '../../../../../../db/TableName'
import RequestedUserRemoval from '../../../../../../db/entities/RequestedUserRemoval'

export async function DELETE(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const requestedUserRemovals = globals.db.manager.connection.getRepository<RequestedUserRemoval>(TableName.REQUESTED_USER_REMOVALS)

	/** Creates new or upserts existing user removal request if there has been any in the past. */
	const result = await requestedUserRemovals.upsert({
		userId: session.userId,
		time: new Date(),
	}, [
		'userId',
	] as (keyof RequestedUserRemoval)[])

	if(result.identifiers.length !== 1) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	return new Response(null, {
		status: HTTPCode.SUCCESS_NO_CONTENT,
	})
}
