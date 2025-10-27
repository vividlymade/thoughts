import { Entity, Column, ManyToOne, type Relation, PrimaryColumn } from 'typeorm'
import TableName from '../TableName'
import Message from './Message'

@Entity(TableName.MESSAGE_IMAGE_ATTACHMENTS)
export default class MessageImageAttachment {
    @PrimaryColumn('uuid')
    id!: string

    @ManyToOne(() => Message, (message) => message.attachments, {
        onDelete: 'CASCADE',
    })
    message!: Relation<Message>
    @Column('smallint')
    order!: number
    @Column({ type: 'oid' as any })
    contentOid!: number
}
