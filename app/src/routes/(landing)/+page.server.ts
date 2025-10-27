import UserSessionService from '$lib/server/services/UserSessionService.server'
import { redirect } from '@sveltejs/kit'
import HTTPCode from '../../HTTPCode'

export const load = async (event) => {
    const session = await UserSessionService.getAndProcessSession(event.cookies)

    if (session) {
        throw redirect(HTTPCode.FOUND, '/home')
    }
}
