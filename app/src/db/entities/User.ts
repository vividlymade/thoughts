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

    /** The e-mail of this user. */
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
    /** The posts that user has shared. */
    @OneToMany(() => PostShare, (postShare) => postShare.author)
    postShares!: Relation<PostShare>[]

    /** The currently active sessions for this user's account. */
    @OneToMany(() => UserSession, (session) => session.user)
    activeSessions!: Relation<UserSession>[]

    /** The users following this user. */
    @OneToMany(() => UserFollow, (follow) => follow.followee)
    followers!: Relation<UserFollow>[]

    /** The users followed by this user. */
    @OneToMany(() => UserFollow, (follow) => follow.follower)
    following!: Relation<UserFollow>[]

    @OneToMany(() => Notification, (notification) => notification.recipient)
    notifications!: Relation<Notification>[]

    /** The denormalized counter reflecting the total number of associated `UserFollow` records for this user. */
    @Column('bigint', { default: 0 })
    followersCount!: bigint

    /** The denormalized counter reflecting the total number of associated `UserFollow` records of other users followed by this user. */
    @Column('bigint', { default: 0 })
    followingCount!: bigint

    /** The conversations this user is participating in. */
    @OneToMany(() => MessageConversation, (conversation) => conversation.participants)
    conversations!: Relation<MessageConversation>

    /** The identifier of the last active conversation. Used for recalling the last conversation when opening the messenger. */
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
