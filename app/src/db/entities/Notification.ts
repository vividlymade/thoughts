import { Column, Entity, ManyToOne, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import TableName from '../TableName'
import User from './User'
import { NotificationStatus } from './NotificationStatus'

export enum NotificationType {
	/** The notification that is sent to the user when they finish setting up their account. */
	WELCOME = 'welcome',
	/** The notification that is sent to the user when another user likes their post. */
	POST_LIKE = 'post_like',
	/** The notification that is sent to the user when another user replies to their post. */
	POST_REPLY = 'post_reply',
	/** The notification that is sent to the user when another user replies to their comment. */
	COMMENT_REPLY = 'comment_reply',
}

@Entity(TableName.NOTIFICATIONS)
export default class Notification {
	@PrimaryColumn('uuid')
	id!: string

	/** The type of this notification. */
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

	/** The current status of this notification. */
	@Column('enum', { enum: NotificationStatus, default: NotificationStatus.UNREAD })
	status!: NotificationStatus

	/** The time when this notification was sent. */
	@Column('timestamptz')
	time!: Date
}
