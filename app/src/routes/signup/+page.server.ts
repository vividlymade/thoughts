import { json, error, fail, redirect, type RequestHandler } from '@sveltejs/kit'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import CookieName from '../../CookieName'
import globals from '$lib/server/globals'
import UserSession from '../../db/entities/UserSession'
import TableName from '../../db/TableName'
import type PendingUserEmailSigninSession from '../../db/entities/PendingUserEmailSigninSession'
import type PendingUserEmailSignupSession from '../../db/entities/PendingUserEmailSignupSession'
import { LessThan, MoreThan, QueryFailedError, Repository } from 'typeorm'
import AppConsts from '../../AppConsts'
import HTTPCode from '../../HTTPCode'
import User from '../../db/entities/User'
import { DatabaseError } from 'pg'
import { randomUUID } from 'crypto'
import crypto from 'node:crypto'
import AuthService from '$lib/server/services/AuthService.server'
import FormField from './FormField'

async function cleanupExpiredSignupTokens(sessionRepository: Repository<PendingUserEmailSignupSession>) {
    await sessionRepository
        .delete({
            startTimestamp: LessThan(new Date(Date.now() - AppConsts.MAX_ALLOWED_SIGNUP_TOKEN_TIME)),
        })
}

export const load = async (event) => {
    await UserSessionService.guardAuthorizedRoute(event.cookies)

    const loginSessionToken = event.cookies.get(CookieName.LOGIN_SESSION_TOKEN)

    if(!loginSessionToken) {
        throw redirect(HTTPCode.FOUND, '/signin')
    }

    const pendingUserEmailSignupSessionRepository = globals.db.manager.connection.getRepository<PendingUserEmailSignupSession>(TableName.PENDING_USER_EMAIL_SIGNUP_SESSIONS)

    await cleanupExpiredSignupTokens(pendingUserEmailSignupSessionRepository)

    const signupSession = await pendingUserEmailSignupSessionRepository
        .createQueryBuilder('session')
        .select()
        .where('session.token = :token', { token: loginSessionToken })
        .getOne()

    const signupSessionExists = !!signupSession

    if(!signupSessionExists) {
        throw redirect(HTTPCode.FOUND, '/signin')
    }

    const sessionTime = Date.now() - signupSession!.startTimestamp.getTime()
    const hasSessionExpired = sessionTime >= AppConsts.MAX_ALLOWED_SIGNUP_TOKEN_TIME

    if(hasSessionExpired) {
        await pendingUserEmailSignupSessionRepository.delete(signupSession!.token)

        throw redirect(HTTPCode.FOUND, '/signin')
    }

    return {
        email: signupSession!.email
    }
}

const INVALID_DATA_REDIRECT_URL = '/signin'

function handleInvalidDataValue(name: string, data: FormDataEntryValue | null) {
    console.error("Invalid form data value for", name + ':', data)

    return redirect(HTTPCode.FOUND, INVALID_DATA_REDIRECT_URL)
}

export const actions = {
    default: async (event) => {
        const sessionToken = event.cookies.get(CookieName.LOGIN_SESSION_TOKEN)

        if (!sessionToken) {
            throw redirect(HTTPCode.FOUND, '/signin')
        }

        const pendingSignupSessionsRepository = globals.db.manager.connection
            .getRepository<PendingUserEmailSignupSession>(TableName.PENDING_USER_EMAIL_SIGNUP_SESSIONS)

        const signupSession = await pendingSignupSessionsRepository
            .createQueryBuilder('session')
            .select()
            .where('session.token = :token', { token: sessionToken })
            .getOne()

        const signupSessionExists = !!signupSession

        if(!signupSessionExists) {
            throw redirect(302, '/signin')
        }

        const formData = await event.request.formData()

        const handle = formData.get(FormField.HANDLE)

        if (typeof handle !== 'string') {
            throw handleInvalidDataValue(FormField.HANDLE, handle)
        }

        const name = formData.get(FormField.NAME)

        if (typeof name !== 'string') {
            throw handleInvalidDataValue(FormField.NAME, name)
        }

        const password = formData.get(FormField.PASSWORD)

        if(typeof password !== 'string') {
            throw handleInvalidDataValue(FormField.PASSWORD, password)
        }

        const stickyFields = [handle, name]

        if (password.length < AppConsts.MIN_PASSWORD_LENGTH) {
            return fail(HTTPCode.BAD_REQUEST, {
                data: { stickyFields },
                error: {
                    fieldName: 'password',
                    message: "The password is too short!"
                }
            })
        }

        if (password.length > AppConsts.MAX_PASSWORD_LENGTH) {
            return fail(HTTPCode.BAD_REQUEST, {
                data: { stickyFields },
                error: {
                    fieldName: 'password',
                    message: "The password is too long!"
                }
            })
        }

        const passwordConfirm = formData.get(FormField.PASSWORD_CONFIRM)

        if (typeof passwordConfirm !== 'string') {
            throw handleInvalidDataValue(FormField.PASSWORD_CONFIRM, passwordConfirm)
        }

        const userRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)

        const isHandleTaken = await userRepository
            .existsBy({
                handle: handle,
            })

        if (isHandleTaken) {
            fail(HTTPCode.BAD_REQUEST, {
                error: {
                    fieldName: FormField.NAME,
                    message: "The handle is already taken, try a different one!"
                }
            })
        }

        if(passwordConfirm !== password) {
            return fail(HTTPCode.BAD_REQUEST, {
                error: {
                    fieldName: FormField.PASSWORD,
                    message: "The repeated password doesn't match!"
                }
            })
        }

        const newUser = new User()

        newUser.name = name
        newUser.handle = handle
        newUser.passwordHash = await AuthService.hashPassword(password)
        newUser.email = signupSession!.email
        newUser.id = randomUUID()
        newUser.registrationTimestamp = new Date()

        /** Transforms current sign-up session into an actual session. */
        const newSession = new UserSession()

        newSession.token = sessionToken

        const nowDate = new Date()

        newSession.lastTimeActive = nowDate
        newSession.loginTimestamp = nowDate
        newSession.user = newUser

        await globals.db.manager.connection.transaction('READ COMMITTED', async (entityManager) => {
            const usersRepository = entityManager.getRepository<User>(TableName.USERS)

            try {
                await usersRepository.insert(newUser)
            } catch(e) {
                if (e instanceof QueryFailedError) {
                    const driverError = e.driverError as DatabaseError

                    if(globals.dbConstraintRegistry.isConflictOnColumn(driverError, User, 'email')) {
                        await pendingSignupSessionsRepository
                            .delete({
                                email: signupSession!.email,
                            })

                        throw redirect(HTTPCode.FOUND, '/signin')
                    } else {
                        throw error(HTTPCode.INTERNAL_SERVER_ERROR)
                    }
                }
            }

            await entityManager.getRepository<PendingUserEmailSignupSession>(TableName.PENDING_USER_EMAIL_SIGNUP_SESSIONS)
                .delete(signupSession!.token)
            await entityManager.getRepository<UserSession>(TableName.USER_SESSIONS)
                .insert(newSession)
        }).catch(reason => {
            console.error(reason)

            throw redirect(HTTPCode.FOUND, '/signin')
        })

        event.cookies.delete(CookieName.LOGIN_SESSION_TOKEN, { path: '/', httpOnly: true, })
        event.cookies.set(CookieName.SESSION_TOKEN, sessionToken, { path: '/', httpOnly: true, })

        throw redirect(HTTPCode.FOUND, '/welcome')
    }
}
