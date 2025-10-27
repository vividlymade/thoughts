import type Profile from '../Profile'
import type PostType from './PostType'
import type Attachment from './Attachment'

export default abstract class PostBase {
    type: PostType
    id: string
    author: Profile
    content: string
    attachments: Attachment[]
    time: number
    repliesCount: number
    replies: PostBase[]
    likes: number
    shares: number
    hasBeenLikedLocally: boolean
    protected constructor(
        type: PostType,
        id: string,
        author: Profile,
        content: string,
        attachments: Attachment[],
        time: number,
        repliesCount: number,
        replies: PostBase[],
        likes: number,
        shares: number,
        hasBeenLikedLocally: boolean,
    ) {
        this.type = type
        this.id = id
        this.author = author
        this.content = $state(content)
        this.attachments = attachments
        this.time = time
        this.repliesCount = $state(repliesCount)
        this.replies = $state(replies)
        this.likes = $state(likes)
        this.shares = shares
        this.hasBeenLikedLocally = $state(hasBeenLikedLocally)
    }
}
