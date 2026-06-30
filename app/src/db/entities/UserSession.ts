import {
    Entity,
    Column,
    PrimaryColumn,
    type Relation,
    ManyToOne, RelationId
} from 'typeorm'
import User from './User'
import TableName from '../TableName'

@Entity(TableName.USER_SESSIONS)
export default class UserSession {
    /** The token associated with the active session used by browser. */
    @PrimaryColumn('text')
    token!: string

    @Column('uuid')
    @RelationId((session: UserSession) => session.user)
    userId!: string

    @ManyToOne(() => User, (user) => user.activeSessions, {
        onDelete: 'CASCADE',
    })
    user!: Relation<User>

    /** The time when the session was created. */
    @Column('timestamptz')
    loginTimestamp!: Date
    /** The time when the user was last active using this session. */
    @Column('timestamptz')
    lastTimeActive!: Date
}
