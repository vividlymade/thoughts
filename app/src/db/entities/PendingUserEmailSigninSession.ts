import {
    Entity,
    Column,
    PrimaryColumn,
    type Relation,
    ManyToOne, RelationId
} from 'typeorm'
import User from './User'
import TableName from '../TableName'

@Entity(TableName.PENDING_USER_EMAIL_SIGNIN_SESSIONS)
export default class PendingUserEmailSigninSession {
    /** The token assigned to the client during sign-in initiation. */
    @PrimaryColumn('text')
    token!: string

    @RelationId((session: PendingUserEmailSigninSession) => session.user)
    userId!: string

    /** The target user account the client is attempting to authenticate as. */
    @ManyToOne(() => User, (user) => user.activeSessions)
    user!: Relation<User>

    /** The time when the client initiated the session. */
    @Column('timestamptz')
    startTimestamp!: Date
}
