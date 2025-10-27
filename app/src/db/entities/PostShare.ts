import { Entity, PrimaryColumn, Column, type Relation, ManyToOne } from 'typeorm'
import User from './User'
import Post from './Post'
import TableName from '../TableName'

@Entity(TableName.POST_SHARES)
export default class PostShare {
    @PrimaryColumn('uuid')
    id!: string
    @Column('timestamptz')
    timestamp!: Date
    author!: Relation<User>
    @ManyToOne(() => User, (user) => user.posts)
    sharedPost!: Relation<Post>
}