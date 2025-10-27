import { hash, verify, Algorithm } from '@node-rs/argon2'

export default {
	async hashPassword(password: string) {
		/** Note: Consider soft-coding the properties and referring to those via `AppConsts`. */
		return await hash(password, {
			/** ~19MB (based on the OWASP baseline) */
			memoryCost: 19456,
			/** 2 passes (recommended safe iteration count). */
			timeCost: 2,
			/** 1 thread (to not congest the application) */
			parallelism: 1,
			/** Keep it safe from both, timing and GPU attacks. */
			algorithm: Algorithm.Argon2id
		})
	},

	/**
	 * Verifies the password validity.
	 * @param password The password to validate.
	 * @param storedHash The valid hash string. Presumably fetched from the database.
	 */
	async verifyPassword(password: string, storedHash: string): Promise<boolean> {
		return await verify(storedHash, password)
	}
}
