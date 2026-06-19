import { error, fail, redirect} from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import globals from '$lib/server/globals'
import UserSession from '../../../db/entities/UserSession'
import type User from '../../../db/entities/User'
import TableName from '../../../db/TableName'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import CookieName from '../../../CookieName'
import PendingUserEmailSigninSession from '../../../db/entities/PendingUserEmailSigninSession'
import AuthService from '$lib/server/services/AuthService.server'

export async function load(event) {
    const signinSessionToken = event.cookies.get(CookieName.LOGIN_SESSION_TOKEN)

    if(!signinSessionToken) {
        /** The provided cookie doesn't exist or has invalid type. */
        throw redirect(HTTPCode.FOUND, '/signin')
    }

    const pendingUserEmailSigninSessionRepository = globals.db.manager.connection.getRepository<PendingUserEmailSigninSession>(TableName.PENDING_USER_EMAIL_SIGNIN_SESSIONS)

    const signinSession = await pendingUserEmailSigninSessionRepository
        .createQueryBuilder('session')
        .select()
        .where('session.token = :token', { token: signinSessionToken })
        .getOne()

    if(!signinSession) {
        /** The sign-in session is either not valid anymore or was provided as invalid. */
        throw redirect(HTTPCode.FOUND, '/signin')
    }
}

export const actions = {
    default: async (event) => {
        const session = await UserSessionService.getAndProcessSession(event.cookies)
        const isSessionValid = !!session

        /** Redirects to the home page if the user has already logged in. */
        if(isSessionValid) {
            throw redirect(HTTPCode.FOUND, '/home')
        }

        const formData = await event.request.formData()

        const PASSWORD_FIELD_NAME = 'password'

        let password: string | undefined

        const REQUIRED_FIELD_COUNT = 1

        let currentFieldCount = 0

        for(const [key, value] of formData.entries()) {
            if(currentFieldCount++ > REQUIRED_FIELD_COUNT) {
                return fail(HTTPCode.BAD_REQUEST)
            }

            if(key === PASSWORD_FIELD_NAME) {
                if(typeof value === 'string') {
                    password = value
                } else {
                    return fail(HTTPCode.BAD_REQUEST)
                }
            } else {
                return fail(HTTPCode.BAD_REQUEST)
            }
        }

        if(currentFieldCount !== REQUIRED_FIELD_COUNT) {
            return fail(HTTPCode.BAD_REQUEST)
        }

        if(password === undefined) {
            return fail(HTTPCode.UNPROCESSABLE_ENTITY)
        }

        const signinSessionToken = event.cookies.get(CookieName.LOGIN_SESSION_TOKEN)

        if(!signinSessionToken) {
            /** The provided cookie doesn't exist or has invalid type. */
            throw redirect(HTTPCode.FOUND, '/signin')
        }

        const pendingUserEmailSigninSessionRepository = globals.db.manager.connection.getRepository<PendingUserEmailSigninSession>(TableName.PENDING_USER_EMAIL_SIGNIN_SESSIONS)

        const signinSession = await pendingUserEmailSigninSessionRepository.findOneBy({
            token: signinSessionToken,
        })

        if(!signinSession) {
            /** The sign-in session is either not valid anymore or was provided as invalid. */
            throw redirect(HTTPCode.FOUND, '/signin')
        }

        const userId = signinSession.userId

        const passwordHash = (await globals.db.getRepository<User>(TableName.USERS)
            .createQueryBuilder('user')
            .where({
                id: userId,
            })
            .addSelect('user.passwordHash')
            .getOne())?.passwordHash

        if(!passwordHash) {
            throw error(HTTPCode.INTERNAL_SERVER_ERROR)
        }

        const isPasswordValid = await AuthService.verifyPassword(password, passwordHash)

        if(!isPasswordValid) {
            return fail(HTTPCode.UNAUTHORIZED)
        }

        /** Transforms current sign-in session into an actual session. */

        const newSession = new UserSession()

        newSession.token = signinSessionToken

        const nowDate = new Date()

        newSession.lastTimeActive = nowDate
        newSession.loginTimestamp = nowDate
        newSession.userId = signinSession.userId

        await globals.db.manager.connection.transaction(async (entityManager) => {
            const signinSessionsRepository = entityManager.getRepository<PendingUserEmailSigninSession>(TableName.PENDING_USER_EMAIL_SIGNIN_SESSIONS)
            const sessionsRepository = entityManager.getRepository<UserSession>(TableName.USER_SESSIONS)

            await signinSessionsRepository.delete(signinSession!.token)
            await sessionsRepository.save(newSession)
        })

        event.cookies.delete(CookieName.LOGIN_SESSION_TOKEN, { path: '/' })
        event.cookies.set(CookieName.SESSION_TOKEN, newSession.token, { path: '/', maxAge: 60 * 60 * 24 * 30, httpOnly: true, })

        throw redirect(HTTPCode.SEE_OTHER, '/home')
    }
}
