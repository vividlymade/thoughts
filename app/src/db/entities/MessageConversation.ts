import 'reflect-metadata'
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import User from './User'
import TableName from '../TableName'
import MessageConversationParticipation from './MessageConversationParticipation'
import { MessageConversationType } from './MessageConversationType'
import Message from './Message'

@Entity(TableName.MESSAGE_CONVERSATIONS)
export default class MessageConversation {
    /** The identifier of this conversation. */
    @PrimaryColumn('uuid')
    id!: string

    /** The type of this conversation. */
    @Column('enum', { enum: MessageConversationType })
    type!: MessageConversationType

    /** The all participants of this conversation. */
    @OneToMany(() => MessageConversationParticipation, (participation) => participation.conversation)
    participants!: Relation<MessageConversationParticipation>[]

    /** The creation time of this conversation. */
    @Column('timestamptz')
    creationTime!: Date

    /** The identifier of the latest message in this conversation. */
    @Column('uuid', { nullable: true })
    latestMessageId?: string

    /** The identifier of the author of the latest message in this conversation. */
    @Column('uuid', { nullable: true })
    @RelationId((conversation: MessageConversation) => conversation.latestMessageAuthor)
    latestMessageAuthorId?: string
    /** The author of the latest message in this conversation. */
    @ManyToOne(() => User, { nullable: true })
    latestMessageAuthor?: Relation<User>
    /** The timestamp of when the latest message in this conversation was received by the server. */
    @Column('timestamptz', { nullable: true })
    latestMessageTime?: Date
    /** The content of the latest message in this conversation. */
    @Column('text', { nullable: true })
    latestMessageContent!: string

    /** The message entries of this conversation. */
    @OneToMany(() => Message, (message: Message) => message.conversation)
    messages!: Relation<Message>[]
}
