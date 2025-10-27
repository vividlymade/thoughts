import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import globals from '$lib/server/globals'
import type User from '../../../../db/entities/User'
import TableName from '../../../../db/TableName'
import AppConsts from '../../../../AppConsts'

export interface UsersSearchResponse {
    users: {
        id: string
        name: string
        handle: string
        followers: number
    }[]

    hasMore?: boolean
}

export async function GET(event) {
    const searchTerm = event.url.searchParams.get('q')

    if(!searchTerm) {
        throw error(HTTPCode.UNPROCESSABLE_ENTITY)
    }

    const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)

	const users = await usersRepository
        .createQueryBuilder('user')
        .select([
            'user.id',
            'user.handle',
            'user.name',
            'user.followersCount',
            'user.pictureOid',
        ])
        .where('user.name ILIKE :pattern OR user.handle ILIKE :pattern', { pattern: `${searchTerm}%` })
        .orderBy('CASE ' +
                'WHEN user.handle ILIKE :pattern THEN 1 ' +
                'ELSE 2 ' +
            'END', 'ASC')
        .addOrderBy('user.followersCount', 'DESC')
        .addOrderBy('user.handle', 'ASC')
        .take(AppConsts.MAX_SEARCH_USER_RESULTS + 1)
        .getMany()

    const usersResponse: UsersSearchResponse = {
        users: []
    }

    for(const user of users) {
        usersResponse.users.push({
            id: user.id,
            name: user.name,
            handle: user.handle,
            followers: Number(user.followersCount),
        })
    }

    const hasMoreUsers = users.length > AppConsts.MAX_SEARCH_USER_RESULTS

    if(hasMoreUsers) {
        usersResponse.hasMore = true
    }

    return json(usersResponse, {
        status: HTTPCode.SUCCESS,
    })
}
