import { Entity, PrimaryColumn, Column, type Relation, ManyToOne, RelationId, Index, OneToMany } from 'typeorm'
import User from './User'
import TableName from '../TableName'
import MessageConversation from './MessageConversation'
import type { Attachment } from 'svelte/attachments'
import MessageImageAttachment from './MessageImageAttachment'

@Entity(TableName.MESSAGES)
export default class Message {
    @Column('uuid')
    @Index()
    conversationId!: string
    @ManyToOne(() => MessageConversation)
    conversation!: Relation<MessageConversation>

    @Column('uuid', { nullable: true })
    @RelationId((message: Message) => message.replyingTo)
    replyingToId?: string
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
    @ManyToOne(() => User)
    author!: Relation<User>

    /** The content of this message. */
    @Column('text')
    content!: string

    @OneToMany(() => MessageImageAttachment, (attachment) => attachment.message)
    attachments!: Relation<MessageImageAttachment>[]
}
