export const VALID_UUID_V4_PATTERN = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

export function isUUIDv4Valid(uuid: string) {
	return VALID_UUID_V4_PATTERN.test(uuid)
}
