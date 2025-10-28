import 'reflect-metadata'
import { type Handle, redirect, type ServerInit } from '@sveltejs/kit'
import globals from '$lib/server/globals'
import { DataSource, type EntityTarget, type QueryRunner, Table } from 'typeorm'
import User from './db/entities/User'
import HTTPCode from './HTTPCode'
import CookieName from './CookieName'
import ErrorPages from './ErrorPages'
import TableName from './db/TableName'
import UserSessionService from '$lib/server/services/UserSessionService.server'

export const init: ServerInit = async() => {
    console.log('Initializing database...')

    try {
        await globals.db.initialize()
        globals.dbConstraintRegistry.initialize()
    } catch(err) {
        console.error("Error during database initialization:", err)
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    if(!globals.db.isInitialized) {
        const code = HTTPCode.APPLICATION_DOWN_FOR_MAINTENANCE

        return new Response(ErrorPages[code], {
            status: code,
            headers: { 'Content-Type': 'text/html' }
        })
    }

    const clientApiMatchesServer = event.cookies.get(CookieName.API_ID) === globals.apiId

    if(!clientApiMatchesServer) {
        event.cookies.set(CookieName.API_ID, globals.apiId, { path: '/' })
    }

    if(event.url.pathname === '/messages') {
        const session = await UserSessionService.getAndProcessSession(event.cookies)

        if(!session) {
            throw redirect(HTTPCode.FOUND, '/signin')
        }

        const lastActiveConversationId = (await globals.db.manager.connection.getRepository<User>(TableName.USERS)
            .findOne({
                select: {
                    lastActiveConversationId: true,
                },
                where: {
                    id: session.userId,
                }
            }))?.lastActiveConversationId

        if(lastActiveConversationId) {
            throw redirect(HTTPCode.SEE_OTHER, `/messages/${lastActiveConversationId}`)
        }
    }

    const response = await resolve(event)

    return response
}
