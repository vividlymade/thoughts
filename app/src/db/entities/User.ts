import { Entity, PrimaryColumn, Column, OneToMany, type Relation, AfterRemove, Index, OneToOne } from 'typeorm'
import PostShare from './PostShare'
import UserSession from './UserSession'
import Post from './Post'
import MessageConversation from './MessageConversation'
import TableName from '../TableName'
import ProfilePictureService from '$lib/server/services/ProfilePictureService.server'
import UserFollow from './UserFollow'
import Notification from './Notification'
import RequestedUserRemoval from './RequestedUserRemoval'

@Entity(TableName.USERS)
export default class User {
    @PrimaryColumn('uuid')
    id!: string

    /** The unique public handle of this user. */
    @Index()
    @Column('text', { unique: true })
    handle!: string

    /** The public name of this user. */
    @Column('text')
    name!: string

    @Index()
    @Column('text', { unique: true })
    email!: string

    /** The profile picture OID of this user. */
    @Column({ type: 'oid' as any, nullable: true })
    pictureOid!: number

    /** The description of this user's profile. */
    @Column('text', { nullable: true })
    description?: string

    @Column('text', { select: false })
    passwordHash!: string
    /** The registration timestamp of this user. */
    @Column('timestamptz')
    registrationTimestamp!: Date

    @Column('boolean', { default: false })
    hasVisitedWelcomePage!: boolean

    /** The posts that user has posted. */
    @OneToMany(() => Post, (post) => post.author)
    posts!: Relation<Post>[]
    @OneToMany(() => PostShare, (postShare) => postShare.author)
    postShares!: Relation<PostShare>[]

    @OneToMany(() => UserSession, (session) => session.user)
    activeSessions!: Relation<UserSession>[]

    @OneToMany(() => UserFollow, (follow) => follow.followee)
    followers!: Relation<UserFollow>[]

    @OneToMany(() => UserFollow, (follow) => follow.follower)
    following!: Relation<UserFollow>[]

    @OneToMany(() => Notification, (notification) => notification.recipient)
    notifications!: Relation<Notification>[]

    @Column('bigint', { default: 0 })
    followersCount!: bigint

    @Column('bigint', { default: 0 })
    followingCount!: bigint

    @OneToMany(() => MessageConversation, (conversation) => conversation.participants)
    conversations!: Relation<MessageConversation>

    @Column('uuid', { nullable: true })
    lastActiveConversationId?: string

    /** The pending account removal request, if it has been previously requested. */
    @OneToOne(() => RequestedUserRemoval, (requestedUserRemoval) => requestedUserRemoval.user)
    requestedAccountRemoval?: RequestedUserRemoval

    /** Settings. */

    @Column('boolean', { default: true })
    enabledNotificationSounds!: boolean

    @Column('boolean', { default: true })
    allowMessagesFromEveryone!: boolean

    @Column('boolean', { default: false })
    keepAccountPrivate!: boolean

    @AfterRemove()
    private async afterRemove() {
        if(this.pictureOid) {
            await ProfilePictureService.removeProfilePicture(this.id)
        }
    }
}
