<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import type { FormEventHandler, FullAutoFill, HTMLInputTypeAttribute } from 'svelte/elements'
    import ViewIcon from '$lib/icons/view.svelte'
    import { scale } from 'svelte/transition'

	let {
		label,
        icon,
        type,
        name,
        placeholder,
        value = $bindable(),
        isRequired,
        autocomplete,
        pattern,
        minLength,
        maxLength,
        hidden,
        onInput,
	}: {
		label: string,
        icon: Snippet | any,
        type?: HTMLInputTypeAttribute,
        name?: string,
        placeholder: string,
		value?: string,
        isRequired?: boolean,
        autocomplete?: FullAutoFill,
        pattern?: RegExp,
        minLength?: number,
        maxLength?: number,
        hidden?: boolean,
        onInput?: FormEventHandler<HTMLInputElement>,
    } = $props()

    let rawPattern = $derived(pattern ? pattern.toString() : undefined)
    let isFocused = $state(false)
    let element: HTMLInputElement

    onMount(() => {
		if(type === 'password') {
			const mouseUpHandler = () => {
				if(element.type !== 'password') {
					element.type = 'password'

                    const lastIndex = value!.length

                    setTimeout(() => {
						element.setSelectionRange(lastIndex, lastIndex)
                    }, 0)
				}
			}

			window.addEventListener('mouseup', mouseUpHandler)

			return () => {
				window.removeEventListener('mouseup', mouseUpHandler)
			}
		}
    })
</script>

<div class="flex flex-col space-y-2.5 text-[#B1B1B1] font-light mx-3 mb-2.25 self-stretch">
    <p class="font-extralight text-[#5B5B5B] text-[11px]">{label}</p>
    <div class="flex border border-[#eeeeee] rounded-2xl bg-white mx-2
        focus-within:outline-solid focus-within:outline-1 focus-within:outline-zinc-300 items-center"
         style="box-shadow: 0px 2px 10px rgba(0,0,0,0.05);">
        <label class="group flex select-none items-center w-full">
            <span class="flex size-6 pl-5 box-content group-focus-within:scale-115 duration-250 will-change-transform
                transition-all origin-center transform-fill">
                {@render icon()}
            </span>
            <input class="p-4.5 text-[11px] w-full outline-none"
                   type={type}
                   name={name}
                   bind:value={value}
                   bind:this={element}
                   onfocus={() => isFocused = true}
                   onblur={() => isFocused = false}
                   placeholder={placeholder}
                   required={isRequired}
                   autocomplete={autocomplete}
                   pattern={rawPattern}
                   minlength={minLength}
                   maxlength={maxLength}
                   hidden={hidden}
                   oninput={onInput}
            >
            {#if type === 'password' && isFocused}
                <button
                    onmousedown={(e) => {
						e.preventDefault()
						element.type = 'text'
					}}
                    transition:scale
                    class="flex size-8 mr-5 cursor-pointer items-center text-zinc-300 hover:text-zinc-400
                        active:scale-90 transition-all duration-200 will-change-transform"
                >
                    <ViewIcon/>
                </button>
            {/if}
        </label>
    </div>
</div>
