import { expect, test } from '../fixtures'

test.describe('settings', () => {
	test(`persists setting toggle state after page reload`, async ({ page, signIn}) => {
		await signIn(process.env.TEST_EMAIL, process.env.TEST_PASSWORD)

		await page.goto('/settings/notifications')

		let soundSwitch = page.getByRole('checkbox', { name: "Sound" })

		await soundSwitch.waitFor({ state: 'attached' })
		await soundSwitch.click()

		const soundSwitchExpectedState = await soundSwitch.isChecked()

		await page.reload()

		soundSwitch = page.getByRole('checkbox', { name: "Sound" })

		await expect(soundSwitch).toBeChecked({ checked: soundSwitchExpectedState })
	})
})
