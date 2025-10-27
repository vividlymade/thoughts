import { Entity, Column, type Relation, ManyToOne, PrimaryColumn, JoinColumn, RelationId } from 'typeorm'
import User from './User'
import TableName from '../TableName'

@Entity(TableName.USER_FOLLOWS)
export default class UserFollow {
    @PrimaryColumn('uuid')
    @RelationId((follow: UserFollow) => follow.follower)
    followerId!: string

    @PrimaryColumn('uuid')
    @RelationId((follow: UserFollow) => follow.followee)
    followeeId!: string

    /** The user following the followee. */
    @ManyToOne(() => User)
    follower!: Relation<User>
    /** The user being followed. */
    @ManyToOne(() => User)
    followee!: Relation<User>

    /** The time when this user started following the other user. */
    @Column('timestamptz')
    timestamp!: Date
}
