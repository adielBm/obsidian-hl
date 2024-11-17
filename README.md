- based on https://github.com/typhoon-kim/obsidian-svelte-syntax-highlighter.
- obsidian plugin that allows to add syntax highlighting for some languages are not supported by default.
- currently added languages:
  - `mips` (MIPS Assembly) language.
  - you can add more languages by: 
    - adding `<language>.ts` file in `languages` directory (like `languages/mips.ts`).
    - register the language in `main.ts` file here: https://github.com/adielBm/obsidian-hl/blob/127a22cee30f0bf5de201c4dd7492df6bdd22782/main.ts#L24-L34
- this is an early version, and it may have some issues, and it's not in the community plugins.
- reference:
  - https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax#Code+blocks
  - https://prismjs.com/#supported-languages
  - https://prismjs.com/docs/