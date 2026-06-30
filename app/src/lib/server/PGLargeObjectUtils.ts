import { LargeObjectManager } from 'pg-large-object'

export default {
	/** Reads LargeObject's binary data into a buffer in one shot. */
	async readAsBuffer(largeObjectManager: LargeObjectManager, oid: number) {
		const largeObject = await largeObjectManager.openAsync(oid, LargeObjectManager.READ)

		return new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = []
			const stream = largeObject.getReadableStream()

			stream.on('data', (chunk: Buffer) => {
				chunks.push(chunk)
			})

			stream.on('end', async () => {
				try {
					await largeObject.closeAsync()

					/** Resolves with combined chunks. */
					resolve(Buffer.concat(chunks as any))
				} catch (error) {
					reject(error)
				}
			})

			stream.on('error', async (error) => {
				try {
					await largeObject.closeAsync()

					reject(error)
				} catch (closeError) {
					reject(closeError)
				}
			})
		})
	},
	/** Writes binary data from a buffer into a LargeObject's stream. */
	async writeFromBuffer(largeObjectManager: LargeObjectManager, oid: number, buffer: Buffer) {
		const largeObject = await largeObjectManager.openAsync(oid, LargeObjectManager.WRITE)

		await new Promise((resolve, reject) => {
			const stream = largeObject.getWritableStream()

			stream.write(buffer, (err) => {
				if (err) {
					reject(err)
				} else {
					resolve(null)
				}
			})

			stream.end()
		})

		await largeObject.closeAsync()
	}
}
