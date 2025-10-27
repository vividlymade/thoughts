import type Profile from '../Profile'
import PostType from './PostType'
import PostBase from './PostBase.svelte.js'
import type Attachment from './Attachment'

export default class Post extends PostBase {
    constructor(
        id: string,
        author: Profile,
        content: string,
        attachments: Attachment[],
        time: number,
        repliesCount: number,
        replies: Post[],
        likes: number,
        shares: number,
        hasBeenLikedLocally: boolean,
    ) {
        super(
            PostType.ROOT_POST,
            id,
            author,
            content,
            attachments,
            time,
            repliesCount,
            replies,
            likes,
            shares,
            hasBeenLikedLocally,
        )
    }
}
