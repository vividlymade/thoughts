import { error, redirect } from '@sveltejs/kit'
import UserSessionService from '$lib/server/services/UserSessionService.server'
import HTTPCode from '../../../HTTPCode'
import AppConsts from '../../../AppConsts'
import sharp from 'sharp'
import ImageUtils from './ImageUtils'
import ProfilePictureService from '$lib/server/services/ProfilePictureService.server'
import globals from '$lib/server/globals'
import TableName from '../../../db/TableName'
import type User from '../../../db/entities/User'
import Notification, { NotificationType } from '../../../db/entities/Notification'
import NotificationService from '$lib/server/services/NotificationService.server'
import type { Repository } from 'typeorm'
import { randomUUID } from 'crypto'

export async function load(event) {
	await event.parent()

	const session = event.locals.session

	if(!session) {
		throw redirect(HTTPCode.FOUND, '/signin')
	}

	const userRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)

	const user = await userRepository.findOneBy({
		id: session.userId,
	})

	if(!user) {
		throw error(HTTPCode.INTERNAL_SERVER_ERROR)
	}

	if(user.hasVisitedWelcomePage) {
		throw redirect(HTTPCode.FOUND, '/home')
	}
}

function markInDatabaseAsVisited(usersRepository: Repository<User>, userId: string) {
	return usersRepository.update({
		id: userId,
	}, {
		hasVisitedWelcomePage: true,
	})
}

async function onFinish(usersRepository: Repository<User>, userId: string) {
	await markInDatabaseAsVisited(usersRepository, userId)

	const welcomeNotification = new Notification()

	welcomeNotification.id = randomUUID()
	welcomeNotification.recipientId = userId
	welcomeNotification.type = NotificationType.WELCOME
	welcomeNotification.title = `Welcome on ${AppConsts.PROJECT_NAME}!`
    welcomeNotification.content = "You are free to start posting your own content from now on!"
	welcomeNotification.time = new Date()

	NotificationService.sendNotification(userId, welcomeNotification).then()
}

export const actions = {
	default: async (event) => {
		const session = await UserSessionService.getAndProcessSession(event.cookies)
		const sessionExists = !!session

		if(!sessionExists) {
		    throw redirect(HTTPCode.FOUND, '/signin')
		}

		const formData = await event.request.formData()

		const action = formData.get('action')

		if (action === 'continueWithout') {
			const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
			const user = await usersRepository.findOneBy({
				id: session.userId,
			})

			if(!user) {
				throw error(HTTPCode.INTERNAL_SERVER_ERROR)
			}

			await onFinish(usersRepository, user.id)

			throw redirect(HTTPCode.FOUND, '/home')
		}

		const avatar = formData.get('avatar')

		if (!(avatar instanceof File)) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		if (avatar.size > AppConsts.MAX_ALLOWED_AVATAR_SIZE) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		const avatarBuffer = await avatar.arrayBuffer()

		const validatedImage = await ImageUtils.validateUserImageFormatFromBuffer(avatarBuffer, false)

		if(!(validatedImage instanceof sharp)) {
			throw error(HTTPCode.UNPROCESSABLE_ENTITY)
		}

		ImageUtils.applyExifRotation(validatedImage)

		const processedImage = await ImageUtils.convertAndCompressImageIntoNormalizedFormat(validatedImage)

		const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
		const user = await usersRepository.findOneBy({
			id: session.userId,
		})

		if(!user) {
			throw error(HTTPCode.INTERNAL_SERVER_ERROR)
		}

		await ProfilePictureService.uploadOrReplaceProfilePicture(user.id, processedImage)

		await onFinish(usersRepository, user.id)

		throw redirect(HTTPCode.FOUND, '/home')
	}
}
