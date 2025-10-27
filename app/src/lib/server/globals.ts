import 'reflect-metadata'
import { DataSource } from 'typeorm'
import PostShare from '../../db/entities/PostShare'
import UserSession from '../../db/entities/UserSession'
import User from '../../db/entities/User'
import Post from '../../db/entities/Post'
import type { Peer } from '@sveltejs/kit'
import PostLike from '../../db/entities/PostLike'
import Message from '../../db/entities/Message'
import GroupChat from '../../db/entities/GroupChat'
import UserFollow from '../../db/entities/UserFollow'
import MessageConversation from '../../db/entities/MessageConversation'
import PostImageAttachment from '../../db/entities/PostImageAttachment'
// import PostVideoAttachment from './db/entities/PostVideoAttachment'
import PendingUserEmailSigninSession from '../../db/entities/PendingUserEmailSigninSession'
import PendingUserEmailSignupSession from '../../db/entities/PendingUserEmailSignupSession'
import type ClientContext from '../../routes/api/ws/ClientContext'
import Notification from '../../db/entities/Notification'
import MessageConversationParticipation from '../../db/entities/MessageConversationParticipation'
import MessageImageAttachment from '../../db/entities/MessageImageAttachment'
import RequestedUserRemoval from '../../db/entities/RequestedUserRemoval'
import DBConstraintRegistry from '$lib/server/DBConstraintRegistry'
import { UserBlock } from '../../db/entities/UserBlock'

/** Gets an environment variable. */
function getEnvVariable(key: string) {
    /** Makes sure that it works with migrations and runtime code. */
    return process.env[key] || import.meta.env[key]
}

const port = Number(getEnvVariable('VITE_DB_PORT')) || undefined

const isViteDev = typeof import.meta.env !== "undefined" && import.meta.env.DEV;

function getViteMigrations(): Function[] {
	const modules = import.meta.glob<{ default: Function }>(
		'./migrations/*.ts',
		{ eager: true }
	)

	return Object.values(modules)
        .map((entry) => entry.default)
}

const migrations: (string | Function)[] =
    isViteDev ? getViteMigrations() : ['migrations/*.ts']

export const db = new DataSource({
    /** Note: It doesn't seem to be required. The `bigint` values seem to be properly handled without it. */
    // parseInt8: true,
    type: 'postgres',
    host: getEnvVariable('VITE_DB_HOST'),
    port: port,
    username: getEnvVariable('VITE_DB_USER'),
    password: getEnvVariable('VITE_DB_PASSWORD'),
    database: getEnvVariable('VITE_DB_NAME'),
    synchronize: true,
    entities: [
        Post,
        PostLike,
        PostShare,

        PendingUserEmailSigninSession,
        PendingUserEmailSignupSession,

        RequestedUserRemoval,

        UserSession,

        User,
        UserFollow,
        UserBlock,

        Notification,

        // PostReplyLike,
        // PostReplyShare,

        PostImageAttachment,
        // PostVideoAttachment,

        MessageConversation,
        MessageConversationParticipation,
        Message,
        MessageImageAttachment,
        // GroupChat,
    ],
    migrations: migrations,
    // logging: 'all',
    connectTimeoutMS: 5000,
    // loggerLevel: "info",
    // logNotifications: true
})

if(!db.driver.supportedDataTypes.includes('oid' as any)) {
    db.driver.supportedDataTypes.push('oid' as any)
}

const globals = {
    connectedWebSocketClientsByUserIdMap: new Map<string, ClientContext[]>(),
    connectedWebSocketClients: <ClientContext[]>[],
    /** API ID used for runtime verification of the validity of the API.
     * Encoded in Base64. */
    apiId: (Math.random() * 10).toString(36).slice(2),
    db: db,
    dbConstraintRegistry: new DBConstraintRegistry(db),
}

export default globals
