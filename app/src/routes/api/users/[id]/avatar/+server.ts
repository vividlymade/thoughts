import ProfilePictureService from '$lib/server/services/ProfilePictureService.server'
import HTTPCode from '../../../../../HTTPCode'
import { error } from '@sveltejs/kit'
import * as UUIDUtils from '../../../../../utils/UUIDUtils'
import defaultAvatar from '$lib/images/profile/default.jpg?arraybuffer'

export async function GET(event) {
	const profileId = event.params.id

	if(!UUIDUtils.isUUIDv4Valid(profileId)) {
		throw error(HTTPCode.UNPROCESSABLE_ENTITY)
	}

	const avatarBuffer = await ProfilePictureService.downloadProfilePicture(profileId)

	return new Response(avatarBuffer ? avatarBuffer : defaultAvatar as any, {
		status: HTTPCode.SUCCESS,
	})
}
