import { Entity, Column, ManyToOne, type Relation, OneToMany, OneToOne, PrimaryColumn, RelationId } from 'typeorm'
import Post from './Post'
import TableName from '../TableName'

@Entity(TableName.POST_IMAGE_ATTACHMENTS)
export default class PostImageAttachment {
    @PrimaryColumn('uuid')
    id!: string

    @ManyToOne(() => Post, (post) => post.attachments, {
        onDelete: 'CASCADE',
    })
    post!: Relation<Post>
    @Column('smallint')
    order!: number
    @Column({ type: 'oid' as any })
    contentOid!: number
}
