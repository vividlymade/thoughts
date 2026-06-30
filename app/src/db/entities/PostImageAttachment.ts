import { Entity, Column, ManyToOne, type Relation, OneToMany, OneToOne, PrimaryColumn, RelationId } from 'typeorm'
import Post from './Post'
import TableName from '../TableName'

@Entity(TableName.POST_IMAGE_ATTACHMENTS)
export default class PostImageAttachment {
    @PrimaryColumn('uuid')
    id!: string

    /** The post this attachment belongs to. */
    @ManyToOne(() => Post, (post) => post.attachments, {
        onDelete: 'CASCADE',
    })
    post!: Relation<Post>
    /** The order of the attachment in the post. */
    @Column('smallint')
    order!: number
    /** The OID of the attachment. */
    @Column({ type: 'oid' as any })
    contentOid!: number
}
