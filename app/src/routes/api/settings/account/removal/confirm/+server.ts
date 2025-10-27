import UserSessionService from '$lib/server/services/UserSessionService.server'
import { error, redirect } from '@sveltejs/kit'
import HTTPCode from '../../../../../../HTTPCode'
import globals from '$lib/server/globals'
import RequestedUserRemoval from '../../../../../../db/entities/RequestedUserRemoval'
import TableName from '../../../../../../db/TableName'
import User from '../../../../../../db/entities/User'
import AppConsts from '../../../../../../AppConsts'

export async function DELETE(event) {
	const session = await UserSessionService.getAndProcessSession(event.cookies)

	if(!session) {
		throw error(HTTPCode.UNAUTHORIZED)
	}

	const requestedUserRemovals = globals.db.manager.connection.getRepository<RequestedUserRemoval>(TableName.REQUESTED_USER_REMOVALS)
	const requestedUserRemoval = await requestedUserRemovals.findOne({
		where: {
			userId: session.userId,
		},
	})

	if(!requestedUserRemoval) {
		throw error(HTTPCode.CONFLICT)
	}

	const requestHasExpired = Date.now() - requestedUserRemoval.time.getTime() > AppConsts.ACCOUNT_REMOVAL_GRACE_PERIOD

	if(requestHasExpired) {
		throw error(HTTPCode.CONFLICT)
	}

	const users = globals.db.manager.connection.getRepository<User>(TableName.USERS)
	const result = await users.delete({
		id: session.userId,
	})

	if(result.affected !== 1) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	throw redirect(HTTPCode.TEMPORARY_REDIRECT, '/home')
}
