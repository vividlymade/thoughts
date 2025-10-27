import type UserSession from './db/entities/UserSession'

declare global {
	namespace App {
		interface Locals {
			session?: UserSession

			hasRootLoadBeenInitialized?: boolean
		}
	}
}
