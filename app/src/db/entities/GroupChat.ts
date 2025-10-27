import { Entity, PrimaryColumn } from 'typeorm'

/** TODO: Implement proper group chats. */
@Entity('group_chat')
export default class GroupChat {
	/**
	 * Group chats are not obligated to have names.
	 * Those can dynamically update its names at runtime
	 * based on its member names.
	 */
	name?: string

    /** The identifier of the group chat. */
    @PrimaryColumn('uuid')
    id!: string
}