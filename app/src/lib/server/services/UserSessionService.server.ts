import globals from '../globals'
import UserSession from '../../../db/entities/UserSession'
import { type Cookies, redirect } from '@sveltejs/kit'
import CookieName from '../../../CookieName'
import TableName from '../../../db/TableName'
import AppConsts from '../../../AppConsts'
import HTTPCode from '../../../HTTPCode'

export default {
    findSessionBySessionToken(sessionToken: string) {
        return globals.db.manager.connection.getRepository<UserSession>(TableName.USER_SESSIONS)
            .createQueryBuilder('session')
            .select()
            .where('session.token = :token', { token: sessionToken })
            .getOne()
    },

    /**
     * Gets and processes the user session from the database based on the provided cookies.
     *
     * It invalidates the provided session if it's being found outdated.
     * It handles the cookie removal.
     **/
    async getAndProcessSession(cookies: Cookies) {
        const sessionToken = cookies.get(CookieName.SESSION_TOKEN)

        if(!sessionToken) {
            return null
        }

        const session = await this.findSessionBySessionToken(sessionToken)

        if(!session) {
            cookies.delete(CookieName.SESSION_TOKEN, { path: '/' })

            return null
        }

        const sessionTime = Date.now() - session.lastTimeActive.getTime()

        if(sessionTime > AppConsts.MAX_SESSION_TIME) {
            /** Invalidates the session and removes from the database. */
            globals.db.manager.connection.getRepository<UserSession>(TableName.USER_SESSIONS)
                .delete(session.token).then()

            cookies.delete(CookieName.SESSION_TOKEN, { path: '/' })

            return null
        }

        const sessionsRepository = globals.db.manager.connection.getRepository<UserSession>(TableName.USER_SESSIONS)

        await sessionsRepository.update(sessionToken, {
            lastTimeActive: new Date()
        })

        return session
    },

    /** Performs a check and guards the route from unauthorized access during an HTTP request. */
    async guardAuthorizedRoute(cookies: Cookies) {
        const isValidSession = await this.getAndProcessSession(cookies)

        if(isValidSession) {
            throw redirect(HTTPCode.TEMPORARY_REDIRECT, '/home')
        }
    },
}
