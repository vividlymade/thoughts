import { test, expect } from '@playwright/test'

const protectedRoutes = [
	'/messages',
	'/settings',
]

const UNAUTHORIZED_REDIRECTION_ROUTE = '/signin'

test.describe('route guarding', () => {
	for (const route of protectedRoutes) {
		test(`redirects unauthorized user from "${route}" to ${UNAUTHORIZED_REDIRECTION_ROUTE}`, async ({page}) => {
			/** Attempts to navigate to the secure page. */
			await page.goto(route)

			await expect(page).toHaveURL(UNAUTHORIZED_REDIRECTION_ROUTE)
		})
	}
})
