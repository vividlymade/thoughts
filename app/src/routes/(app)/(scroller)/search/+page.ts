import SearchIcon from '$lib/icons/search.svelte'
import Profile from '../../../../Profile'
import ImageAttachment from '../../../../post/ImageAttachment'
import Post from '../../../../post/Post.svelte.js'
import type { SearchResponse } from '../../../api/search/+server'

export function load(event) {
    const data = event.data

    const users: Profile[] = []
    const posts: Post[] = []

    for (const responseUser of data.result.users) {
        const user = new Profile(
            responseUser.id,
            `/api/users/${responseUser.id}/avatar`,
            responseUser.handle,
            responseUser.name,
        )

        user.followersCount = responseUser.followers

        users.push(user)
    }

    for (const responsePost of data.result.posts) {
        const attachments: ImageAttachment[] = []

        if(responsePost.attachments) {
            for (const attachmentId of responsePost.attachments) {
                attachments.push(
                    new ImageAttachment(`/api/posts/attachment/${attachmentId}`)
                )
            }
        }

        const post = new Post(
            responsePost.id,
            new Profile(
                '',
                `/api/users/${responsePost.authorId}/avatar`,
                responsePost.authorHandle,
                responsePost.authorName,
            ),
            responsePost.content,
            attachments,
            responsePost.time,
            /** TODO: Pass from the backend the denormalized replies count.  */
            responsePost.replies,
            [],
            responsePost.likes,
            /** TODO: Pass from the backend the denormalized share count. */
            0,
            /** TODO: Pass from the backend the state about whether it has been liked by the local user. */
            false
        )

        posts.push(post)
    }

    return {
        ...event.data,
        search: {
            users: users,
            posts: posts,

            hasMoreUsers: event.data.result.hasMoreUsers,
            hasMorePosts: event.data.result.hasMorePosts,
        },
        main: {
            headerIcon: SearchIcon,
            headerText: event.url.searchParams.get('q'),
        },
    }
}
