import { loadPrism, Plugin } from "obsidian"

import {
	ViewPlugin,
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewUpdate,
} from "@codemirror/view"
import { RangeSetBuilder } from "@codemirror/state"

import mips from "./languages/mips"

export type Prism = typeof import("prismjs")

const loadPrismWithLanguages = async () => {
	try {
		const Prism = await loadPrism()
		mips(Prism)
		return Prism
	} catch (error) {
		console.error("Failed to load Prism:", error)
		throw error
	}
}

export default class HighlightingPlugin extends Plugin {
	prism: Prism | null

	async onload() {
		console.log("Loading Mips Syntax Highlighting Plugin 🔥🔥🔥")
		try {
			this.prism = await loadPrismWithLanguages()

			this.registerMarkdownPostProcessor((el, ctx) => {
				el.querySelectorAll("pre > code.language-mips").forEach((block) => {
					this.prism && this.prism.highlightElement(block)
				})
			})

			this.registerEditorExtension(
				ViewPlugin.fromClass(MipsHighlight, {
					decorations: (plugin) => plugin.decorations,
				}),
			)

			this.app.workspace.updateOptions()
		} catch (error) {
			console.error("Failed to load Prism: ", error)
		}
	}

	onunload() {
		console.log("Unloading Mips Syntax Highlighting Plugin")

		if (this.prism && this.prism.languages.mips) {
			delete this.prism.languages.mips
		}
	}
}

class MipsHighlight implements PluginValue {
	decorations: DecorationSet
	prism: Prism | null

	constructor(view: EditorView) {
		this.decorations = Decoration.none
		this.load().then(() => {
			this.decorations = this.buildDecorations(view)
			view.update([])
		})
	}

	update(update: ViewUpdate): void {
		if (update.viewportChanged || update.docChanged) {
			this.decorations = this.buildDecorations(update.view)
		}
	}

	async load() {
		this.prism = await loadPrismWithLanguages()
	}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>()

		if (!this.prism) {
			return Decoration.none
		}

		const text = view.state.doc.toString() // Text of the entire document
		const regex = /```mips(?:[\s:!?.;,@%&(){}[\]<>*~]*)([\s\S]*?)\n```/gi // mips code block

		let match
		while ((match = regex.exec(text)) !== null) {
			const codeBlock = match[0]
			const highlighted = this.prism.highlight(codeBlock, this.prism.languages.mips, "mips")

			const blockStart = match.index // Calculate the start index within the code block
			this.applyHighlighting(highlighted, blockStart, builder)
		}

		return builder.finish()
	}

	applyHighlighting(highlighted: string, blockStart: number, builder: RangeSetBuilder<Decoration>) {
		const parser = new DOMParser()
		const doc = parser.parseFromString(highlighted, "text/html")
		const tempEl = doc.body

		let currentIndex = blockStart

		const ranges: { start: number; end: number; className: string }[] = []

		const traverse = (node: Node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || ""
				currentIndex += text.length
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement
				const className = element.className

				// Traverse the child to add style classes for each range
				const start = currentIndex
				element.childNodes.forEach((child) => {
					traverse(child)
				})

				const end = currentIndex

				ranges.push({ start, end, className })
			}
		}

		tempEl.childNodes.forEach((child) => {
			traverse(child)
		})

		// Sort ranges by start index - necessary to apply to builder in order
		ranges.sort((a, b) => a.start - b.start)

		// Build according to sorted styles
		for (const range of ranges) {
			builder.add(range.start, range.end, Decoration.mark({ class: range.className }))
		}
	}
}
