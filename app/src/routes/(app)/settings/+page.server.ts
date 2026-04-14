import { redirect } from '@sveltejs/kit'
import HTTPCode from '../../../HTTPCode'

export const trailingSlash = 'always'

export function load(event) {
	/** Redirects to the default settings page. */
	throw redirect(HTTPCode.TEMPORARY_REDIRECT, '/settings/account')
}
