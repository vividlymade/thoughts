export async function load(event) {
	const data = await event.parent()

	return {
		...data,
	}
}
