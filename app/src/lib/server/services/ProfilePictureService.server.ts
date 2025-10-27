import globals from '../globals'
import { LargeObjectManager } from 'pg-large-object'
import User from '../../../db/entities/User'
import TableName from '../../../db/TableName'
import PGLargeObjectUtils from '$lib/server/PGLargeObjectUtils'

export default {
	async downloadProfilePicture(userId: string) {
		const usersRepository = globals.db.manager.connection.getRepository<User>(TableName.USERS)
		const user = await usersRepository.findOneBy({
			id: userId,
		})

		if(!user) {
			return null
		}

		if (!user.pictureOid) {
			return null
		}

		return await globals.db.manager.connection.transaction(async (manager) => {
			const largeObjectManager = new LargeObjectManager({ pg: manager })

			return PGLargeObjectUtils.readAsBuffer(largeObjectManager, user.pictureOid)
		})
	},
	async uploadOrReplaceProfilePicture(userId: string, image: Buffer) {
		return globals.db.manager.connection.transaction(async (entityManager) => {
			const usersRepository = entityManager.getRepository<User>(TableName.USERS)

			const user = await usersRepository.findOneBy({
				id: userId,
			})

			if (!user) {
				return null
			}

			const loManager = new LargeObjectManager({ pg: entityManager })

			if (user.pictureOid) {
				await loManager.unlinkAsync(user.pictureOid)
			}

			/** New profile picture large object. */
			const pictureOid = await loManager.createAsync()
			const largeObject = await loManager.openAsync(pictureOid, LargeObjectManager.WRITE)

			await new Promise((resolve, reject) => {
				const stream = largeObject.getWritableStream()

				stream.write(image, (err) => {
					if (err) {
						reject(err)
					} else {
						resolve(null)
					}
				})

				stream.end()
			})

			await largeObject.closeAsync()

			await usersRepository.update({
				id: user.id,
			}, {
				pictureOid: pictureOid,
			})

			return pictureOid
		})
	},

	async removeProfilePicture(userId: string) {
		return await globals.db.manager.connection.transaction(async (manager) => {
			const usersRepository = manager.getRepository<User>(TableName.USERS)
			const largeObjectManager = new LargeObjectManager({ client: manager })

			const user = await usersRepository.findOneBy({
				id: userId,
			})

			if (!user?.pictureOid) {
				return
			}

			/** Deletes the picture Large Object. */
			await largeObjectManager.unlinkAsync(user.pictureOid)

			/** Clears the picture OID from user. */
			await manager.update(User, userId, {
				pictureOid: undefined,
			})
		})
	}
}