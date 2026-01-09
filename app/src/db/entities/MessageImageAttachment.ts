import { Entity, Column, ManyToOne, type Relation, PrimaryColumn } from 'typeorm'
import TableName from '../TableName'
import Message from './Message'

@Entity(TableName.MESSAGE_IMAGE_ATTACHMENTS)
export default class MessageImageAttachment {
    /** The identifier of the attachment. */
    @PrimaryColumn('uuid')
    id!: string

    /** The message this attachment belongs to. */
    @ManyToOne(() => Message, (message) => message.attachments, {
        onDelete: 'CASCADE',
    })
    message!: Relation<Message>
    @Column('smallint')
    /** The order of the attachment in the message. */
    order!: number
    @Column({ type: 'oid' as any })
    /** The OID of the attachment. */
    contentOid!: number
}
