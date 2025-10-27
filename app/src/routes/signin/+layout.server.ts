import "reflect-metadata"
import type { LayoutServerLoad } from './$types'
import UserSessionService from '$lib/server/services/UserSessionService.server'

export const load: LayoutServerLoad = async (event) => {
    await UserSessionService.guardAuthorizedRoute(event.cookies)
}