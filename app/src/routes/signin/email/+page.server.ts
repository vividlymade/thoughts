import { error, fail, json, redirect, type RequestHandler, text } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'
import globals from '$lib/server/globals'
import UserSession from '../../../db/entities/UserSession'
import type User from '../../../db/entities/User'
import { Brackets } from 'typeorm'
import TableName from '../../../db/TableName'
import { setTimeout } from 'timers/promises'
import * as EmailUtils from '../../../utils/EmailUtils'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import CookieName from '../../../CookieName'
import PendingUserEmailSignupSession from '../../../db/entities/PendingUserEmailSignupSession'
import crypto from 'node:crypto'
import PendingUserEmailSigninSession from '../../../db/entities/PendingUserEmailSigninSession'

function generateNewSessionToken() {
    return crypto.randomBytes(32).toString('hex')
}

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData()

        const EMAIL_FIELD_NAME = 'email'

        let email: string | undefined

        const REQUIRED_FIELD_COUNT = 1

        let currentFieldCount = 0

        for(const [key, value] of formData.entries()) {
            if(currentFieldCount++ > REQUIRED_FIELD_COUNT) {
                return fail(400)
            }

            if(key === EMAIL_FIELD_NAME) {
                if(typeof value === 'string') {
                    /** Store e-mail as a normalized one with a lower case. */
                    email = value.toLowerCase()
                } else {
                    return fail(400)
                }
            } else {
                return fail(400)
            }
        }

        if(currentFieldCount !== REQUIRED_FIELD_COUNT) {
            return fail(400)
        }

        if(!EmailUtils.isEmailValid(email!)) {
            return fail(400)
		}

        const foundUser = await globals.db.getRepository<User>(TableName.USERS)
            .createQueryBuilder('user')
            .where({
                email: email!,
            })
            .getOne()

        if(!foundUser) {
            const newSignupSession = new PendingUserEmailSignupSession()
            const newSessionToken = generateNewSessionToken()

            newSignupSession.email = email!
            newSignupSession.token = newSessionToken
            newSignupSession.startTimestamp = new Date()

            await globals.db.manager.connection.getRepository<PendingUserEmailSignupSession>(TableName.PENDING_USER_EMAIL_SIGNUP_SESSIONS)
                .insert(newSignupSession)

            event.cookies.set(CookieName.LOGIN_SESSION_TOKEN, newSessionToken, { path: '/', maxAge: 60, httpOnly: true, })

            throw redirect(303, '/signup')
        }

        const newSigninSession = new PendingUserEmailSigninSession()
        const newSessionToken = generateNewSessionToken()

        newSigninSession.token = newSessionToken
        newSigninSession.user = foundUser
        newSigninSession.startTimestamp = new Date()

        await globals.db.manager.connection.getRepository<PendingUserEmailSigninSession>(TableName.PENDING_USER_EMAIL_SIGNIN_SESSIONS)
            .insert(newSigninSession)

        event.cookies.set(CookieName.LOGIN_SESSION_TOKEN, newSessionToken, { path: '/', maxAge: 60, httpOnly: true, })

        throw redirect(303, '/signin/password')
    }
}
