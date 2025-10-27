export default class Profile {
    id: string
    pictureURL: string
    handle: string
    name: string
    followersCount?: number
    followingCount?: number
    constructor(id: string, pictureURL: string, handle: string, name: string) {
        this.id = id
        this.pictureURL = pictureURL
        this.name = name
        this.handle = handle
    }
}
