import { test as base } from '@playwright/test'

export const test = base.extend<{
	signIn: (email: string, password: string) => Promise<void>
}>({
	signIn: async ({ page }, use) => {
		const signInFunction = async (email: string, password: string) => {
			await page.goto('/signin')
			await page.getByRole('link', { name: "Use an e-mail" }).click()

			await page.getByPlaceholder('E-mail').fill(email)
			await page.getByRole('button', { name: 'Next' }).click()

			await page.getByPlaceholder('Password').fill(password)
			await page.getByRole('button', { name: 'Next' }).click()

			await page.waitForURL((url) => {
				return url.pathname === '/home'
			})
		}

		await use(signInFunction)
	},
})

export { expect } from '@playwright/test'
