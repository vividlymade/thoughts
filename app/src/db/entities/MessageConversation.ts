import 'reflect-metadata'
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import User from './User'
import TableName from '../TableName'
import MessageConversationParticipation from './MessageConversationParticipation'
import { MessageConversationType } from './MessageConversationType'
import Message from './Message'

@Entity(TableName.MESSAGE_CONVERSATIONS)
export default class MessageConversation {
    @PrimaryColumn('uuid')
    id!: string

    @Column('enum', { enum: MessageConversationType })
    type!: MessageConversationType

    @OneToMany(() => MessageConversationParticipation, (participation) => participation.conversation)
    participants!: Relation<MessageConversationParticipation>[]

    @Column('timestamptz')
    creationTime!: Date

    @Column('uuid', { nullable: true })
    latestMessageId?: string

    @Column('uuid', { nullable: true })
    @RelationId((conversation: MessageConversation) => conversation.latestMessageAuthor)
    latestMessageAuthorId?: string
    /** The author of the latest message. */
    @ManyToOne(() => User, { nullable: true })
    latestMessageAuthor?: Relation<User>
    /** The timestamp of when the latest message was received by the server. */
    @Column('timestamptz', { nullable: true })
    latestMessageTime?: Date

    /** The content of the latest message. */
    @Column('text', { nullable: true })
    latestMessageContent!: string

    @OneToMany(() => Message, (message: Message) => message.conversation)
    messages!: Relation<Message>[]
}