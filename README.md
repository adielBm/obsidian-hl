this repo is mainly based on that one: https://github.com/typhoon-kim/obsidian-svelte-syntax-highlighter 

--- 

- obsidian.md plugin that allows to add syntax highlighting (using prismjs) for some languages are not supported by default.
- currently added languages:
  - `mips` (MIPS Assembly) language.
  - `svelte` 
- you can add more languages by: 
	- adding `<language>.ts` file in `languages` directory.
	- register the language in `main.ts` file here: https://github.com/adielBm/obsidian-hl/blob/master/main.ts#L27-L41
- this is an **early version**, and it may have some issues, and it's **not** in the community plugins.
- see also:
	- https://github.com/typhoon-kim/obsidian-svelte-syntax-highlighter.
	- https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax#Code+blocks
	- https://prismjs.com/#supported-languages
	- https://prismjs.com/docs/
