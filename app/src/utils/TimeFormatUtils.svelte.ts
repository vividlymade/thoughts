export const MILLISECONDS_IN_SECOND = 1000
export const MILLISECONDS_IN_MINUTE = 60 * MILLISECONDS_IN_SECOND
export const MILLISECONDS_IN_HOUR   = 60 * MILLISECONDS_IN_MINUTE
export const MILLISECONDS_IN_DAY    = 24 * MILLISECONDS_IN_HOUR
export const MILLISECONDS_IN_WEEK   = 7 * MILLISECONDS_IN_DAY
export const MILLISECONDS_IN_MONTH  = 30 * MILLISECONDS_IN_DAY
export const MILLISECONDS_IN_YEAR   = 365 * MILLISECONDS_IN_DAY

export function createTimeAgo(timestamp: number) {
	let refresh = $state(0)

	const value = $derived(() => {
		refresh

		return formatTimeAgo(Date.now() - timestamp)
	})

	$effect(() => {
		let timeoutId: ReturnType<typeof setTimeout>

		const scheduleNextUpdate = () => {
			const now = Date.now()
			const differenceBetweenProvidedTime = now - timestamp

			/** Calculated time difference for the next update. */
			const timeUntilNextUpdate = getTimeUntilNextUpdate(
				differenceBetweenProvidedTime
			)

			clearTimeout(timeoutId)

			timeoutId = setTimeout(() => {
				refresh++

				scheduleNextUpdate()
			}, timeUntilNextUpdate)
		}

		/** Schedules the initial update. */
		scheduleNextUpdate()

		return () => clearTimeout(timeoutId)
	})

	return {
		get value() {
			return value()
		}
	}
}

function getTimeUntilNextUpdate(timeDifference: number) {
	/** For seconds (< 1 minute) it is supposed to update every second. */
	if (timeDifference < 60000) return 1000

	/** For minutes (< 1 hour) it is supposed to update at the next minute boundary. */
	if (timeDifference < 3600000) {
		const minutes = Math.floor(timeDifference / 60000)
		const nextMinuteBoundary = (minutes + 1) * 60000

		return nextMinuteBoundary - timeDifference
	}

	/** For hours (< 1 day) it is supposed to update at the next hour boundary. */
	if (timeDifference < 86400000) {
		const hours = Math.floor(timeDifference / 3600000)
		const nextHourBoundary = (hours + 1) * 3600000

		return nextHourBoundary - timeDifference
	}

	/** For days (< 1 week) it is supposed to update at the next day boundary. */
	if (timeDifference < 604800000) {
		const days = Math.floor(timeDifference / 86400000)
		const nextDayBoundary = (days + 1) * 86400000

		return nextDayBoundary - timeDifference

	}

	/** For weeks (< ~1 month) it is supposed to update at the next week boundary. */
	if (timeDifference < 2592000000) {
		const weeks = Math.floor(timeDifference / 604800000)
		const nextWeekBoundary = (weeks + 1) * 604800000

		return nextWeekBoundary - timeDifference
	}

	/** For months (< 1 year) it is supposed to update at the next month boundary. */
	if (timeDifference < 31536000000) {
		const months = Math.floor(timeDifference / 2592000000)
		const nextMonthBoundary = (months + 1) * 2592000000

		return nextMonthBoundary - timeDifference
	}

	/** For years, it is supposed to update at the next year boundary. */
	const years = Math.floor(timeDifference / 31536000000)
	const nextYearBoundary = (years + 1) * 31536000000

	return nextYearBoundary - timeDifference
}

export function formatTimeAgo(timeDifference: number) {
	if (timeDifference < 0)
		return 'in the future'
	if (timeDifference < MILLISECONDS_IN_SECOND)
		return 'just now'
	if (timeDifference < MILLISECONDS_IN_MINUTE)
		return `${Math.floor(timeDifference / MILLISECONDS_IN_SECOND)}s ago`
	if (timeDifference < MILLISECONDS_IN_HOUR)
		return `${Math.floor(timeDifference / MILLISECONDS_IN_MINUTE)}m ago`
	if (timeDifference < MILLISECONDS_IN_DAY)
		return `${Math.floor(timeDifference / MILLISECONDS_IN_HOUR)}h ago`
	if (timeDifference < MILLISECONDS_IN_WEEK)
		return `${Math.floor(timeDifference / MILLISECONDS_IN_DAY)}d ago`
	if (timeDifference < MILLISECONDS_IN_MONTH)
		return `${Math.floor(timeDifference / MILLISECONDS_IN_WEEK)}w ago`
	if (timeDifference < MILLISECONDS_IN_YEAR)
		return `${Math.floor(timeDifference / MILLISECONDS_IN_MONTH)}mo ago`

	return `${Math.floor(timeDifference / MILLISECONDS_IN_YEAR)}y ago`
}
