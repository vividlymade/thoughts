/** The global instance of EmojiMart library to keep it always loaded in memory.
 * TODO: Consider moving from `stores` as it doesn't utilize Svelte store anymore. */
const EmojiMart = await import('emoji-mart')

export default EmojiMart
