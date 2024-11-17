import { App, loadPrism, Plugin, PluginManifest } from "obsidian"
import {
    ViewPlugin,
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
    ViewUpdate,
} from "@codemirror/view"
import { RangeSetBuilder } from "@codemirror/state"

export type Prism = typeof import("prismjs")

// Interface for language definitions
interface LanguageDefinition {
    name: string;
    definition: (Prism: Prism) => void;
}

export default class HighlightingPlugin extends Plugin {
    prism: Prism | null = null;
    languages: Map<string, LanguageDefinition> = new Map();

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);

		// Register new languages:
        this.registerLanguage({
            name: 'mips',
            definition: (Prism) => require('./languages/mips').default(Prism)
        });

		// and so on...
    }

    registerLanguage(lang: LanguageDefinition) {
        this.languages.set(lang.name, lang);
        if (this.prism) {
            // If Prism is already loaded, register the language immediately
            lang.definition(this.prism);
        }
    }

    async loadPrismWithLanguages() {
        try {
            const Prism = await loadPrism();
            // Load all registered languages
            for (const lang of this.languages.values()) {
                lang.definition(Prism);
            }
            return Prism;
        } catch (error) {
            console.error("Failed to load Prism:", error);
            throw error;
        }
    }

    async onload() {
        try {
            this.prism = await this.loadPrismWithLanguages();

            // Register post processor for all supported languages
            this.registerMarkdownPostProcessor((el, ctx) => {
                this.languages.forEach(lang => {
                    el.querySelectorAll(`pre > code.language-${lang.name}`).forEach((block) => {
                        this.prism && this.prism.highlightElement(block);
                    });
                });
            });

            // Store plugin instance for use in the ViewPlugin
            const pluginInstance = this;

            this.registerEditorExtension(
                ViewPlugin.fromClass(
                    class SyntaxHighlight extends BaseHighlight {
                        constructor(view: EditorView) {
                            // Pass the stored plugin instance
                            super(view, pluginInstance);
                        }
                    },
                    {
                        decorations: (plugin) => plugin.decorations,
                    }
                )
            );

            this.app.workspace.updateOptions();
        } catch (error) {
            console.error("Failed to load Prism: ", error);
        }
    }

    onunload() {
        console.log("Unloading Syntax Highlighting Plugin");
        if (this.prism) {
            // Clean up all registered languages
            this.languages.forEach(lang => {
                if (this.prism?.languages[lang.name]) {
                    delete this.prism.languages[lang.name];
                }
            });
        }
    }
}

// Base class for syntax highlighting
class BaseHighlight implements PluginValue {
    decorations: DecorationSet;
    prism: Prism | null;
    plugin: HighlightingPlugin;

    constructor(view: EditorView, plugin: HighlightingPlugin) {
        this.decorations = Decoration.none;
        this.plugin = plugin;
        this.prism = null;
        this.load().then(() => {
            this.decorations = this.buildDecorations(view);
            view.update([]);
        });
    }

    async load() {
        this.prism = await this.plugin.loadPrismWithLanguages();
    }

    update(update: ViewUpdate): void {
        if (update.viewportChanged || update.docChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        if (!this.prism) {
            return Decoration.none;
        }

        const text = view.state.doc.toString();
        
        // Handle all registered languages
        this.plugin.languages.forEach(lang => {
            const regex = new RegExp(`\`\`\`${lang.name}(?:[\\s:!?.;,@%&(){}[\\]<>*~]*)([\\s\\S]*?)\\n\`\`\``, 'gi');
            
            let match;
            while ((match = regex.exec(text)) !== null) {
                const codeBlock = match[0];
                const highlighted = this.prism!.highlight(
                    codeBlock,
                    this.prism!.languages[lang.name],
                    lang.name
                );

                const blockStart = match.index;
                this.applyHighlighting(highlighted, blockStart, builder);
            }
        });

        return builder.finish();
    }

    applyHighlighting(highlighted: string, blockStart: number, builder: RangeSetBuilder<Decoration>) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(highlighted, "text/html");
        const tempEl = doc.body;

        let currentIndex = blockStart;
        const ranges: { start: number; end: number; className: string }[] = [];

        const traverse = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || "";
                currentIndex += text.length;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const className = element.className;

                const start = currentIndex;
                element.childNodes.forEach((child) => traverse(child));
                const end = currentIndex;

                ranges.push({ start, end, className });
            }
        };

        tempEl.childNodes.forEach((child) => traverse(child));
        ranges.sort((a, b) => a.start - b.start);

        for (const range of ranges) {
            builder.add(
                range.start,
                range.end,
                Decoration.mark({ class: range.className })
            );
        }
    }
}