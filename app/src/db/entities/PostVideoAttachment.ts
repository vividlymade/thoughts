import { Entity, Column, ManyToOne, type Relation, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import Post from './Post'
import TableName from '../TableName'

/** TODO: Implement video attachments. */
// @Entity(TableName.POST_VIDEO_ATTACHMENTS)
// export default class PostVideoAttachment {
//     @PrimaryColumn('uuid')
//     id!: string
//     /** The post that has the attachment included. */
//     @ManyToOne(() => Post)
//     post!: Relation<Post>
//     @Column('bytea')
//     content!: Buffer
// }
