import { Entity, JoinColumn, OneToOne, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import TableName from '../TableName'
import User from './User'

@Entity(TableName.REQUESTED_USER_REMOVALS)
export default class RequestedUserRemoval {
	@PrimaryColumn('uuid')
    @RelationId((requestedUserRemoval: RequestedUserRemoval) => requestedUserRemoval.user)
    userId!: string

	/** The user that has requested its account removal. */
	@OneToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	user!: Relation<User>
	/** The time when the user has requested its account removal. */
	time!: Date
}
