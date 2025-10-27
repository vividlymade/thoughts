import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import globals from '$lib/server/globals'
import type User from '../../../../db/entities/User'
import TableName from '../../../../db/TableName'
import AppConsts from '../../../../AppConsts'

export type SearchSuggestionsResponse = {
    id: string
    name: string
    handle: string
    followers: number
}[]

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
        .take(AppConsts.MAX_SEARCH_SUGGESTIONS)
        .getMany()

    const usersResponse: SearchSuggestionsResponse = []

    for(const user of users) {
        usersResponse.push({
            id: user.id,
            name: user.name,
            handle: user.handle,
            followers: Number(user.followersCount),
        })
    }

    return json(usersResponse, {
        status: HTTPCode.SUCCESS,
    })
}
