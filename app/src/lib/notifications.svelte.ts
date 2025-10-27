import { Howl } from 'howler'
import notificationSoundSrc from '$lib/sounds/notification.mp3'
import settings from '$lib/settings.svelte'

const notificationSound = new Howl({
	src: [notificationSoundSrc],
	volume: 0.2,
})

export class Notification {
	id: string
	title: string
	content: string
	time: number
	isRead: boolean

	constructor(id: string, title: string, content: string, time: number, isRead: boolean) {
		this.id = id
		this.title = title
		this.content = content
		this.time = time
		this.isRead = $state(isRead)
	}
}

export default new class {
	list: Notification[] = $state([])
    pushNew(notification: Notification) {
		this.list.unshift(notification)

        if(settings.notificationSoundEnabled) {
        	notificationSound.play()
		}
    }
}
