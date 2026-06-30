import { describe, test, expect } from 'vitest'
import { isUUIDv4Valid } from './UUIDUtils'

describe('isUUIDv4Valid', () => {
	test('returns false for an empty string', () => {
		expect(isUUIDv4Valid('')).toBe(false)
	})

	test('returns false for non-UUID text', () => {
		expect(isUUIDv4Valid('not-a-uuid')).toBe(false)
	})

	test('returns false if UUID has invalid length', () => {
		expect(isUUIDv4Valid('954a8e22-8bfb-449e-b747-d5d11cfc366')).toBe(false)
		expect(isUUIDv4Valid('954a8e22-8bfb-449e-b747-d5d11cfc3664a')).toBe(false)
	})

	test('returns true for a valid lower-case UUID v4', () => {
		const validUUID = '954a8e22-8bfb-449e-b747-d5d11cfc3664'

		expect(isUUIDv4Valid(validUUID)).toBe(true)
	})

	test('returns true for a valid upper-case UUID v4', () => {
		const validUUID = '954A8E22-8BFB-449E-B747-D5D11CFC3664'

		expect(isUUIDv4Valid(validUUID)).toBe(true)
	})

	test('returns true for all valid variant characters (8, 9, a, b)', () => {
		const variant8 = '00000000-0000-4000-8000-000000000000'
		const variant9 = '00000000-0000-4000-9000-000000000000'
		const variantA = '00000000-0000-4000-a000-000000000000'
		const variantB = '00000000-0000-4000-b000-000000000000'

		expect(isUUIDv4Valid(variant8)).toBe(true)
		expect(isUUIDv4Valid(variant9)).toBe(true)
		expect(isUUIDv4Valid(variantA)).toBe(true)
		expect(isUUIDv4Valid(variantB)).toBe(true)
	})

	test('returns false for invalid UUID version', () => {
		const uuidV1 = '954a8e22-8bfb-149e-b747-d5d11cfc3664'
		const uuidV5 = '954a8e22-8bfb-549e-b747-d5d11cfc3664'

		expect(isUUIDv4Valid(uuidV1)).toBe(false)
		expect(isUUIDv4Valid(uuidV5)).toBe(false)
	})

	test('returns false for invalid variant character', () => {
		const invalidVariant7 = '00000000-0000-4000-7000-000000000000'
		const invalidVariantC = '00000000-0000-4000-c000-000000000000'

		expect(isUUIDv4Valid(invalidVariant7)).toBe(false)
		expect(isUUIDv4Valid(invalidVariantC)).toBe(false)
	})
})