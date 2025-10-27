export async function load(event) {
	const parentData = await event.parent()

	return {
		localUserId: parentData.localUserId,
		localUserHandle: parentData.localUserHandle,
		localUserName: parentData.localUserName,
	}
}
