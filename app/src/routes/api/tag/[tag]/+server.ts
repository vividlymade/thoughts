import { error, json } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import SearchService from '$lib/server/services/SearchService.server'

export interface TagResponse {
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

/** TODO: Implement tag results fetching via API (required for pagination). */
export async function GET(event) {
    const searchResult = await SearchService.searchTag(event.params.tag)

    const responsePosts: TagResponse['posts'] = []

    const response: TagResponse = {
        posts: responsePosts,
    }

    return json(response, {
        status: HTTPCode.SUCCESS,
    })
}
