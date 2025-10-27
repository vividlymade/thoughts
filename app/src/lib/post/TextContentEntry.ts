export const enum TextContentEntryType {
	TEXT,
	HASHTAG,
}

abstract class TextContentEntry {
	type: TextContentEntryType

	protected constructor(type: TextContentEntryType) {
		this.type = type
	}
}

class TextContentTextEntry extends TextContentEntry {
	text: string
	constructor(text: string) {
		super(TextContentEntryType.TEXT)

		this.text = text
	}
}

class TextContentHashtagEntry extends TextContentEntry {
	value: string
	constructor(value: string) {
		super(TextContentEntryType.HASHTAG)

		this.value = value
	}
}

export function parseHashtags(text: string) {
	const regex = /#(\w+)/g
	const parts = []
	let lastIndex = 0
	let match: RegExpExecArray | null

	while ((match = regex.exec(text)) !== null) {
		/** Adds the text before the hashtag. */
		if (match.index > lastIndex) {
			parts.push(new TextContentTextEntry(text.substring(lastIndex, match.index)))
		}

		const hashtagValue = match[1]

		/** Adds the found hashtag. */
		parts.push(new TextContentHashtagEntry(hashtagValue))

		lastIndex = match.index + match[0].length;
	}

	/** Adds the final text after all hashtags. */
	if (lastIndex < text.length) {
		parts.push(new TextContentTextEntry(text.substring(lastIndex)))
	}

	return parts
}
