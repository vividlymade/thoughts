import { Entity, JoinColumn, OneToOne, PrimaryColumn, type Relation, RelationId } from 'typeorm'
import TableName from '../TableName'
import User from './User'

@Entity(TableName.REQUESTED_USER_REMOVALS)
export default class RequestedUserRemoval {
	@PrimaryColumn('uuid')
    @RelationId((requestedUserRemoval: RequestedUserRemoval) => requestedUserRemoval.user)
    userId!: string

	@OneToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	user!: Relation<User>
	time!: Date
}
