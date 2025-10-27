import { error } from '@sveltejs/kit'
import HTTPCode from '../../../../HTTPCode'
import SearchService from '$lib/server/services/SearchService.server'
import type { SearchResponse } from '../../../api/search/+server'

export async function load(event) {
    const searchTerm = event.url.searchParams.get('q')

	if(!searchTerm) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	if(searchTerm.length === 0) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const result = await SearchService.searchAll(searchTerm)

    let users: SearchResponse['users'] = []
    let posts: SearchResponse['posts'] = []

	for(const user of result.users) {
		users.push({
			id: user.id,
			name: user.name,
			handle: user.handle,
			followers: Number(user.followersCount),
		})
	}

	for(const post of result.posts) {
		const attachmentsIds: string[] = []

		for(const attachment of post.attachments) {
			attachmentsIds.push(attachment.id)
		}

		posts.push({
			id: post.id,

			authorId: post.author.id,
			authorHandle: post.author.handle,
			authorName: post.author.name,

			attachments: attachmentsIds,
			content: post.content,
			likes: Number(post.likeCount),
			replies: Number(post.repliesCount),

			time: post.timestamp.getTime(),
		})
	}

	const responseResult: SearchResponse = {
		users: users,
		posts: posts,
	}

	if(result.hasMoreUsers) {
		responseResult.hasMoreUsers = true
	}

	if(result.hasMorePosts) {
		responseResult.hasMorePosts = true
	}

	const parentData = await event.parent()

    return {
		...parentData,
		result: responseResult,
    }
}
