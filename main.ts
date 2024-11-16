import { Plugin } from 'obsidian';
import loadPrismWithMips from 'loadPrismWithMips';
import MipsHighlight from 'mipsHighlighter';
import { ViewPlugin } from '@codemirror/view';

export default class MipsSyntaxHighlightingPlugin extends Plugin {
    obsidianPrism: any;

    async onload() {
        try {
            console.log('Loading Mips Syntax Highlighting Plugin');
            this.obsidianPrism = await loadPrismWithMips();

            this.registerMarkdownPostProcessor((el, ctx) => {
                el.querySelectorAll('pre > code.language-mips').forEach((block) => {
                    this.obsidianPrism.highlightElement(block);
                });
            });

            this.registerEditorExtension(
                ViewPlugin.fromClass(
                    MipsHighlight, { 
                        decorations: (plugin) => plugin.decorations,
                    }
                )
            );

            this.app.workspace.updateOptions();

        } catch (error) {
            console.error('Failed to load Prism: ', error);
        }
    }

    onunload() {
        console.log('Unloading Mips Syntax Highlighting Plugin');

        if (this.obsidianPrism && this.obsidianPrism.languages.mips) {
            delete this.obsidianPrism.languages.mips;
        }
    }
}