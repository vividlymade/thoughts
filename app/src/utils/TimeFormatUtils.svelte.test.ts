import { describe, test, expect } from 'vitest'
import {
	formatTimeAgo, MILLISECONDS_IN_DAY, MILLISECONDS_IN_HOUR,
	MILLISECONDS_IN_MINUTE, MILLISECONDS_IN_MONTH,
	MILLISECONDS_IN_SECOND, MILLISECONDS_IN_WEEK, MILLISECONDS_IN_YEAR
} from './TimeFormatUtils.svelte'

describe('formatTimeAgo', () => {
	test('returns "in the future" for negative values', () => {
		expect(formatTimeAgo(-1)).toBe('in the future')
		expect(formatTimeAgo(-1000)).toBe('in the future')
	})

	test('returns "just now" for durations under 1 second', () => {
		expect(formatTimeAgo(0)).toBe('just now')
		expect(formatTimeAgo(999)).toBe('just now')
	})

	test('returns seconds for durations under 1 minute', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_SECOND)).toBe('1s ago')
		expect(formatTimeAgo(MILLISECONDS_IN_SECOND * 15)).toBe('15s ago')
		expect(formatTimeAgo(MILLISECONDS_IN_SECOND * 59)).toBe('59s ago')
	})

	test('returns minutes for durations under 1 hour', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_MINUTE)).toBe('1m ago')
		expect(formatTimeAgo(MILLISECONDS_IN_MINUTE * 30)).toBe('30m ago')
		expect(formatTimeAgo(MILLISECONDS_IN_MINUTE * 59)).toBe('59m ago')
	})

	test('returns hours for durations under 1 day', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_HOUR)).toBe('1h ago')
		expect(formatTimeAgo(MILLISECONDS_IN_HOUR * 5)).toBe('5h ago')
		expect(formatTimeAgo(MILLISECONDS_IN_HOUR * 23)).toBe('23h ago')
	})

	test('returns days for durations under 1 week', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_DAY)).toBe('1d ago')
		expect(formatTimeAgo(MILLISECONDS_IN_DAY * 4)).toBe('4d ago')
		expect(formatTimeAgo(MILLISECONDS_IN_DAY * 6)).toBe('6d ago')
	})

	test('returns weeks for durations under 1 month', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_WEEK)).toBe('1w ago')
		expect(formatTimeAgo(MILLISECONDS_IN_WEEK * 3)).toBe('3w ago')
		expect(formatTimeAgo(MILLISECONDS_IN_WEEK * 4)).toBe('4w ago')
	})

	test('returns months for durations under 1 year', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_MONTH)).toBe('1mo ago')
		expect(formatTimeAgo(MILLISECONDS_IN_MONTH * 6)).toBe('6mo ago')
		expect(formatTimeAgo(MILLISECONDS_IN_MONTH * 12)).toBe('12mo ago')
	})

	test('returns years for durations equal to or greater than 1 year', () => {
		expect(formatTimeAgo(MILLISECONDS_IN_YEAR)).toBe('1y ago')
		expect(formatTimeAgo(MILLISECONDS_IN_YEAR * 2.5)).toBe('2y ago')
		expect(formatTimeAgo(MILLISECONDS_IN_YEAR * 10)).toBe('10y ago')
	})
})
