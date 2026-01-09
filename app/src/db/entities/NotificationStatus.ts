/** The status of a notification. */
export enum NotificationStatus {
	/** The notification that has already been read by the user. */
	READ = 'read',
	/** The notification that hasn't been yet read by the user. */
	UNREAD = 'unread',
	/** The notification that had gotten archived by the user. */
	ARCHIVED = 'archived',
}
