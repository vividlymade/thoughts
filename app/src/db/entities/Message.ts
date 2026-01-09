import { Entity, PrimaryColumn, Column, type Relation, ManyToOne, RelationId, Index, OneToMany } from 'typeorm'
import User from './User'
import TableName from '../TableName'
import MessageConversation from './MessageConversation'
import MessageImageAttachment from './MessageImageAttachment'

@Entity(TableName.MESSAGES)
export default class Message {
    /** The identifier of the conversation this message belongs to. */
    @Column('uuid')
    @Index()
    conversationId!: string

    /** The conversation this message belongs to. */
    @ManyToOne(() => MessageConversation)
    conversation!: Relation<MessageConversation>

    @Column('uuid', { nullable: true })
    @RelationId((message: Message) => message.replyingTo)
    /** The identifier of the message the user is replying to. */
    replyingToId?: string
    /** The message the user is replying to. */
    @ManyToOne(() => Message, { nullable: true })
    replyingTo?: Relation<Message>

    @PrimaryColumn('uuid')
    id!: string
    /** The timestamp when this message was received by the server. */
    @Column('timestamptz')
    time!: Date

    @Column('uuid')
    @RelationId((post: Message) => post.author)
    authorId!: string
    /** The author of this message. */
    @ManyToOne(() => User)
    author!: Relation<User>

    /** The content of this message. */
    @Column('text')
    content!: string

    /** The attachments of this message. */
    @OneToMany(() => MessageImageAttachment, (attachment) => attachment.message)
    attachments!: Relation<MessageImageAttachment>[]
}
