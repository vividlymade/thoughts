import globals from '$lib/server/globals'
import type User from '../../../../db/entities/User'
import TableName from '../../../../db/TableName'
import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import UserSessionService from '$lib/server/services/UserSessionService'

export interface ResponseProfile {
    name: string
    handle: string
    id: string

    followers: number
    following: number

    description?: string

    joinDate: number

    isFollowing?: boolean
    isBlocked?: boolean
}

export const load = async (event) => {
    await event.parent()

    const rawProfileHandle = event.params.profile

    if(!rawProfileHandle) {
        throw error(HTTPCode.UNPROCESSABLE_ENTITY)
    }

    const queryBuilder = globals.db.manager.connection.getRepository<User>(TableName.USERS)
        .createQueryBuilder('user')
        .where('user.handle = :handle', { handle: rawProfileHandle })

    const session = event.locals.session
	const isLoggedIn = !!session

    if(isLoggedIn) {
		/** Queries additional virtual columns for logged user. */
		queryBuilder
			.addSelect(
	            `EXISTS(
				SELECT 1 FROM "${TableName.USER_FOLLOWS}" follow
				WHERE follow."followeeId" = id
				AND follow."followerId" = :followerId)`,
				'isFollowing'
            )
            .addSelect(
	            `EXISTS(
				SELECT 1 FROM "${TableName.USER_BLOCKS}" block
				WHERE block."blockedId" = id
				AND block."blockerId" = :blockerId)`,
				'isBlocked'
            )
            .setParameters({
                followerId: session!.userId,
                blockerId: session!.userId,
            })
	}

    const queryResult = await queryBuilder.getRawAndEntities()
    const parentData = await event.parent()

    const profileNotFound = queryResult.entities.length !== 1

    if(profileNotFound) {
        return {
            ...parentData,
        }
    }

    const isFollowing = queryResult.raw[0].isFollowing
    const isBlocked = queryResult.raw[0].isBlocked
    const profile = queryResult.entities[0]

    const registrationDate = profile.registrationTimestamp

    const roundedJoinDate = new Date(registrationDate.getFullYear(), registrationDate.getMonth())

    const responseProfile: ResponseProfile = {
        name: profile.name,
        handle: rawProfileHandle,
        id: profile.id,

        followers: Number(profile.followersCount),
        following: Number(profile.followingCount),

        description: profile.description,

        joinDate: roundedJoinDate.getTime(),
    }

    if(isFollowing) {
        responseProfile.isFollowing = true
    }

    if(isBlocked) {
        responseProfile.isBlocked = true
    }

    return {
        ...parentData,
        profile: responseProfile,
    }
}
