import { Column, type Relation, ManyToOne, PrimaryColumn, RelationId, Entity } from 'typeorm'
import User from './User'
import TableName from '../TableName'

@Entity(TableName.USER_BLOCKS)
export class UserBlock {
    @PrimaryColumn('uuid')
    @RelationId((block: UserBlock) => block.blocker)
    blockerId!: string

    @PrimaryColumn('uuid')
    @RelationId((block: UserBlock) => block.blocked)
    blockedId!: string

    /** The user that blocks. */
    @ManyToOne(() => User)
    blocker!: Relation<User>
    /** The user being blocked. */
    @ManyToOne(() => User)
    blocked!: Relation<User>

    /** The timestamp of when the user has blocked the other user. */
    @Column('timestamptz')
    timestamp!: Date
}
