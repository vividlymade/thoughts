import { test as setup, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import AppConsts from '../../../src/AppConsts'

const TEST_DATA = {
	email: faker.internet.exampleEmail(),
	handle: faker.internet.username(),
	name: faker.internet.displayName(),
	password: faker.internet.password(),
}

process.env.TEST_EMAIL = TEST_DATA.email
process.env.TEST_NAME = TEST_DATA.name
process.env.TEST_HANDLE = TEST_DATA.handle
process.env.TEST_PASSWORD = TEST_DATA.password

setup('create new account', async ({ page }) => {
	await page.goto('/signup')
	await page.getByRole('link', { name: "Use an e-mail" }).click()

	await page.getByPlaceholder("E-mail").fill(TEST_DATA.email)
	await page.getByRole('button', { name: 'Next' }).click()

	await page.getByPlaceholder("Your unique name on the platform").fill(TEST_DATA.handle)
	await page.getByPlaceholder("Your display name on the platform").fill(TEST_DATA.name)
	await page.getByPlaceholder(`Password – (at least ${AppConsts.MIN_PASSWORD_LENGTH} up to ${AppConsts.MAX_PASSWORD_LENGTH} characters length)`).fill(TEST_DATA.password)
	await page.getByPlaceholder("Repeat the password").fill(TEST_DATA.password)
	await page.getByRole('button', { name: 'Next' }).click()

	await page.getByRole('button', { name: 'Continue without' }).click()
})
