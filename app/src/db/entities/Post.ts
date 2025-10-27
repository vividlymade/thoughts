import { Entity, PrimaryColumn, Column, type Relation, ManyToOne, OneToMany, RelationId, Index } from 'typeorm'

import User from './User'
import TableName from '../TableName'
import PostImageAttachment from './PostImageAttachment'
import type UserSession from './UserSession'

@Entity(TableName.POSTS)
export default class Post {
    /** The identifier of the post. */
    @PrimaryColumn('uuid')
    id!: string

    @Column('uuid', { nullable: true })
    @RelationId((post: Post) => post.replyingToPost)
    replyingToPostId?: string
    @ManyToOne(() => Post, (post) => post, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    replyingToPost?: Post

    /** The timestamp of when the post was created. */
    @Index({
        /** TODO: Fix this to use descending (DESC) order once typeorm supports index ordering configuration or rewrite to use completely different orm (e.g. Kysely). */
    })
    @Column('timestamptz')
    timestamp!: Date

    @RelationId((post: Post) => post.author)
    authorId!: string
    @ManyToOne(() => User, (user) => user.posts)
    author!: Relation<User>

    @Column('text')
    content!: string

    @OneToMany(() => PostImageAttachment, (attachment) => attachment.post)
    attachments!: Relation<PostImageAttachment>[]

    @OneToMany(() => Post, (post) => post.replyingToPost)
    replies!: Relation<Post>[]

    @Column('bigint', { default: 0 })
    likeCount!: bigint

    @Column('bigint', { default: 0 })
    repliesCount!: bigint

    // @Column('bigint')
    // views!: BigInt
}
