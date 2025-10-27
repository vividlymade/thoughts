import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import TableName from '../TableName'
import MessageConversation from './MessageConversation'
import User from './User'

@Entity(TableName.MESSAGE_CONVERSATION_PARTICIPATIONS)
export default class MessageConversationParticipation {
	@PrimaryColumn('uuid')
	@RelationId((participation: MessageConversationParticipation) => participation.user)
	userId!: string
	@ManyToOne(() => User)
	user!: User

	@PrimaryColumn('uuid')
	@RelationId((participation: MessageConversationParticipation) => participation.conversation)
	conversationId!: string
	@ManyToOne(() => MessageConversation, (conversation) => conversation.participants)
	conversation!: Relation<MessageConversation>

	@Column('timestamptz')
	joinTime!: Date
	@Column('uuid', { nullable: true })
	lastReadMessageId?: string
}
