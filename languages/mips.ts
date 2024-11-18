import type { Prism } from "main";
/* eslint-disable no-useless-escape */
export default function mips(prism: Prism) {
    prism.languages.mips = {
        comment: {
            pattern: /#.*$/m,
            greedy: true,
            alias: "comment",
        },
        number: {
            pattern: /\b(?:0x[\da-fA-F]+|\d+)\b/,
            alias: "number",
        },
        string: {
            pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
            greedy: true,
        },
        directive: {
            pattern: /^\s*\.[a-zA-Z]+/,
            alias: "keyword",
        },
        keyword: {
            pattern:
                /\b(?:add|addi|addiu|addu|and|andi|beq|bgez|bgezal|bgtz|blez|bltz|bltzal|bne|div|divu|j|jal|jr|lbu|lhu|ll|lui|lw|mfhi|mflo|mult|multu|nor|or|ori|sb|sh|sll|sllv|slt|slti|sltiu|sltu|sra|srav|srl|srlv|sub|subu|sw|syscall|xor|xori)\b/,
            alias: "keyword",
        },
        label: [
            {
                // Labels at the start of lines (without the colon)
                pattern: /^\s*[a-zA-Z0-9_]+(?=:)/m,
                alias: "function",
            },
            {
                // Labels used as arguments (without the comma)
                pattern: /(?:(?:^|\s+))[a-zA-Z0-9_]+(?=\s*(?:$|[,)]|\s+#))/m,
                alias: "function",
            },
        ],
        register: {
            pattern: /\$[a-z0-9]+/,
            alias: "variable",
        },
        operator: {
            pattern: /[+\-*/%<>=&|]/,
            alias: "operator",
        },
        instruction: {
            pattern: /^\s*\b[a-zA-Z]+/,
            alias: "builtin",
        },
        // Updated punctuation to include colons for labels
        punctuation: /[(),:]/,
        symbol: {
            pattern: /\$\b(?:zero|at|v[01]|a[0-3]|t\d|s[0-7]|k[01]|gp|sp|fp|ra)\b/,
            alias: "variable",
        },
    }
    prism.hooks.add(
        "wrap",
        (env: { type: string; attributes: { [x: string]: any }; content: string }) => {
            if (env.type === "entity") {
                env.attributes["title"] = env.content.replace(/&amp;/, "&")
            }
        },
    )
}