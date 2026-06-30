import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import TableName from '../TableName'
import MessageConversation from './MessageConversation'
import User from './User'

@Entity(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)
export default class MessageConversationParticipation {
	/** The identifier of the participant user. */
	@PrimaryColumn('uuid')
	@RelationId((participation: MessageConversationParticipation) => participation.user)
	userId!: string
	@ManyToOne(() => User)
	/** The participant user. */
	user!: User

	@PrimaryColumn('uuid')
	@RelationId((participation: MessageConversationParticipation) => participation.conversation)
	conversationId!: string
	/** The conversation the user participates in. */
	@ManyToOne(() => MessageConversation, (conversation) => conversation.participants)
	conversation!: Relation<MessageConversation>

	/** The timestamp when the user joined the conversation. */
	@Column('timestamptz')
	joinTime!: Date
	/** The identifier of the last message that was read by the user. */
	@Column('uuid', { nullable: true })
	lastReadMessageId?: string
}
