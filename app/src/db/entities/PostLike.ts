import { Entity, Column, ManyToOne, type Relation, OneToMany, OneToOne, PrimaryColumn, JoinColumn, RelationId } from 'typeorm'
import User from './User'
import Post from './Post'
import TableName from '../TableName'

@Entity(TableName.POST_LIKES)
export default class PostLike {
    @PrimaryColumn('uuid')
    @RelationId((like: PostLike) => like.post)
    postId!: string

    @PrimaryColumn('uuid')
    @RelationId((like: PostLike) => like.user)
    userId!: string

    /** The post that has been liked. */
    @ManyToOne(() => Post, {
        onDelete: 'CASCADE',
    })
    post!: Relation<Post>
    /** The user that has liked the post. */
    @ManyToOne(() => User)
    user!: Relation<User>

    /** The time when the user liked the post. */
    @Column('timestamptz')
    timestamp!: Date
}
