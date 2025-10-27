<script lang="ts">
    let {
		name,
        description,
        checked = $bindable(),
        onChange,
        disabled,
	}: {
		name: string,
        description: string,
        checked: boolean,
        onChange: () => void,
        disabled: boolean,
    } = $props()
</script>

<div class="flex justify-between items-center">
    <div class="select-none flex-1">
        <span class="block text-sm">{name}</span>
        <span class="block font-light ml-2 text-xs max-w-3/4 text-zinc-600">{description}</span>
    </div>
    <div class="relative inline-block w-11 h-5">
        <label
            class="w-11 h-6 cursor-pointer"
        >
            <input
                bind:checked={checked}
                disabled={disabled}
                onchange={onChange}
                aria-label={name}
                type="checkbox"
                class="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-[#4071E4] cursor-pointer transition-colors duration-300"
            >
            <span class="absolute top-0 left-0 size-5 bg-white rounded-full border-zinc-100 border-2 shadow-sm transition-transform duration-300 peer-checked:translate-x-6"></span>
        </label>
    </div>
</div>
