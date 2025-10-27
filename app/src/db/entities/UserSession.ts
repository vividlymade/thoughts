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
    @PrimaryColumn('text')
    token!: string

    @Column('uuid')
    @RelationId((session: UserSession) => session.user)
    userId!: string

    @ManyToOne(() => User, (user) => user.activeSessions, {
        onDelete: 'CASCADE',
    })
    user!: Relation<User>

    @Column('timestamptz')
    loginTimestamp!: Date
    @Column('timestamptz')
    lastTimeActive!: Date
}
