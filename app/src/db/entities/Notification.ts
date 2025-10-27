import { Column, Entity, ManyToOne, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import TableName from '../TableName'
import User from './User'
import { NotificationStatus } from './NotificationStatus'

export enum NotificationType {
	WELCOME = 'welcome',
	POST_LIKE = 'post_like',
	POST_REPLY = 'post_reply',
	COMMENT_REPLY = 'comment_reply',
}

@Entity(TableName.NOTIFICATIONS)
export default class Notification {
	@PrimaryColumn('uuid')
	id!: string

	@Column('enum', { enum: NotificationType })
	type!: string

	@Column('uuid')
	@RelationId((notification: Notification) => notification.recipient)
	recipientId!: string

	@ManyToOne(() => User, (user) => user.notifications, {
		onDelete: 'CASCADE',
		nullable: false,
	})
	recipient!: Relation<User>

	@Column('text')
	title!: string

	@Column('text')
	content!: string

	@Column('enum', { enum: NotificationStatus, default: NotificationStatus.UNREAD })
	status!: NotificationStatus

	@Column('timestamptz')
	time!: Date
}
