import { describe, test, expect } from 'vitest'
import { isEmailValid } from './EmailUtils'

describe('isEmailValid', () => {
	test('returns true for a valid email', () => {
		expect(isEmailValid('user@example.com')).toBe(true)
	})

	test('returns true for email with subdomains', () => {
		expect(isEmailValid('user@subdomain.example.com')).toBe(true)
	})

	test('returns true for email with plus sign (address tagging)', () => {
		expect(isEmailValid('user+mailbox@example.com')).toBe(true)
	})

	test('returns true for email with dots and dashes in the username part', () => {
		expect(isEmailValid('james.kowalski-jones@example.com')).toBe(true)
	})

	test('returns false for an empty string', () => {
		expect(isEmailValid('')).toBe(false)
	})

	test('returns false if "@" symbol is missing', () => {
		expect(isEmailValid('userexample.com')).toBe(false)
	})

	test('returns false if there is no username part before "@"', () => {
		expect(isEmailValid('@example.com')).toBe(false)
	})

	test('returns false if there is no domain after "@"', () => {
		expect(isEmailValid('user@')).toBe(false)
	})

	test('returns false if there are spaces in the email', () => {
		expect(isEmailValid('user @example.com')).toBe(false)
		expect(isEmailValid('user@example .com')).toBe(false)
	})

	test('returns false for multiple "@" symbols', () => {
		expect(isEmailValid('user@bad@example.com')).toBe(false)
	})

	test('returns false if domain starts or ends with a dash', () => {
		expect(isEmailValid('user@-example.com')).toBe(false)
		expect(isEmailValid('user@example-.com')).toBe(false)
	})
})
