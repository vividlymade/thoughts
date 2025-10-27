import { redirect } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'

export async function load(event) {
	const parentData = await event.parent()

    const session = event.locals.session

    if(!session) {
        throw redirect(HTTPCode.TEMPORARY_REDIRECT, '/signin')
    }

	return {
		...parentData,
	}
}
