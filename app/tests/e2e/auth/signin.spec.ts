import { expect, test } from '../fixtures'

test('signs in with the setup account', async ({ page, signIn }) => {
	await signIn(process.env.TEST_EMAIL, process.env.TEST_PASSWORD)
})
