import {
    Entity,
    Column,
    OneToMany,
    PrimaryColumn,
    type Relation,
    ManyToOne, RelationId
} from 'typeorm'
import User from './User'
import TableName from '../TableName'

@Entity(TableName.PENDING_USER_EMAIL_SIGNIN_SESSIONS)
export default class PendingUserEmailSigninSession {
    @PrimaryColumn('text')
    token!: string

    @RelationId((session: PendingUserEmailSigninSession) => session.user)
    userId!: string

    @ManyToOne(() => User, (user) => user.activeSessions)
    user!: Relation<User>

    @Column('timestamptz')
    startTimestamp!: Date
}
