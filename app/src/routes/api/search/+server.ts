import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import SearchService from '$lib/server/services/SearchService.server'

export interface SearchResponse {
    users: {
        id: string
        name: string
        handle: string
        followers: number
    }[]

    hasMoreUsers?: boolean

    posts: {
        id: string

        authorId: string
        authorName: string
        authorHandle: string

        content: string

        attachments?: string[]

        likes: number
        replies: number

        time: number
    }[]

    hasMorePosts?: boolean
}

export async function GET(event) {
    const searchTerm = event.url.searchParams.get('q')

    if(!searchTerm) {
        throw error(HTTPCode.UNPROCESSABLE_ENTITY)
    }

    const searchResult = await SearchService.searchAll(searchTerm)

    const responseUsers: SearchResponse['users'] = []

    for(const user of searchResult.users) {
        responseUsers.push({
            id: user.id,
            name: user.name,
            handle: user.handle,
            followers: Number(user.followersCount),
        })
    }

    const responsePosts: SearchResponse['posts'] = []

    return json({
        users: responseUsers,
        posts: responsePosts,
    } satisfies SearchResponse, {
        status: HTTPCode.SUCCESS,
    })
}
