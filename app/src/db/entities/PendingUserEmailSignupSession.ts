import {
    Entity,
    Column,
    PrimaryColumn,
} from 'typeorm'
import TableName from '../TableName'

@Entity(TableName.PENDING_USER_EMAIL_SIGNUP_SESSIONS)
export default class PendingUserEmailSignupSession {
    /** The token assigned to the client during sign-up initialization. */
    @PrimaryColumn('text')
    token!: string

    /**
     * The e-mail the user has requested to sign-up with.
     * It's not unique so if two or more clients try to sign-up with the same email
     * simultaneously the one that was first to fill up the form takes the precedence.
     */
    @Column('text')
    email!: string

    /** The time when the client initiated the session. */
    @Column('timestamptz')
    startTimestamp!: Date
}
