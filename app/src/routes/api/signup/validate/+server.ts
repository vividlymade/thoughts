import HTTPCode from '../../../../HTTPCode'
import { json } from '@sveltejs/kit'

export async function GET(event) {
	const errors: string[] = []

	const formData = await event.request.formData()

	const handle = formData.get('handle')

	if(typeof handle === 'string') {
		return new Response(null, {
			status: HTTPCode.UNPROCESSABLE_ENTITY,
		})
	}

	const password = formData.get('password')

	if(typeof password !== 'string') {
		return new Response(null, {
			status: HTTPCode.UNPROCESSABLE_ENTITY,
		})
	}

	let isHandleTaken = false
	let isHandleInvalid = false

	/** TODO: Check if the handle is taken and valid. */
	if(isHandleTaken) {
		errors.push('handleIsTaken')
	}

	if(isHandleInvalid) {
		errors.push('handleIsInvalid')
	}

	const isPasswordTooShort = false
	const isPasswordTooLong = false
	const hasSpecialCharacters = true

	if(isPasswordTooShort) {
		errors.push('passwordIsTooShort')
	}

	if(isPasswordTooLong) {
		errors.push('passwordIsTooLong')
	}

	if(!hasSpecialCharacters) {
		errors.push('passwordRequiresSpecialCharacters')
	}

	const isInvalid = errors.length > 0

	if(isInvalid) {
		return json(errors, {
			status: HTTPCode.SUCCESS,
		})
	}

	return new Response(null, { status: HTTPCode.SUCCESS })
}
