import {
    Entity,
    Column,
    PrimaryColumn,
} from 'typeorm'
import TableName from '../TableName'

@Entity(TableName.PENDING_USER_EMAIL_SIGNUP_SESSIONS)
export default class PendingUserEmailSignupSession {
    @PrimaryColumn('text')
    token!: string

    @Column('text')
    email!: string

    @Column('timestamptz')
    startTimestamp!: Date
}
