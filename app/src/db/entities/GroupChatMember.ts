import { Entity, Column, type Relation, ManyToOne } from 'typeorm'
import User from './User'

export enum MemberRole {
	MEMBER = 'member',
	ADMIN = 'admin',
}

@Entity('group_chat_members')
export default class GroupChatMember {
	/** The member of the group chat. */
	@ManyToOne(() => User, (user) => user.posts)
    user!: Relation<User>
	/** The role of the member within the group chat. */
	@Column({
		type: 'enum',
		enum: MemberRole,
		default: MemberRole.MEMBER,
	})
	role!: MemberRole
    /** The timestamp of when the user has joined the group chat. */
    @Column('timestamptz')
    joinTimestamp!: Date
	/** The member's nickname in the group chat. */
	@Column('string')
	nickname?: string
}
