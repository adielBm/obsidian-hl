import type { Prism } from "main";
import type { Grammar, GrammarValue } from "prismjs";

/* eslint-disable no-useless-escape */
export default function svelte(prism: Prism) {
    const blocks = '(if|else if|await|then|catch|each|html|debug)';

    // Extend the markup language with Svelte-specific syntax
    prism.languages.svelte = prism.languages.extend('markup', {
        each: {
            pattern: new RegExp(
                '{[#/]each' +
                '(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}'
            ),
            inside: {
                'language-javascript': [
                    {
                        pattern: /(as[\s\S]*)\([\s\S]*\)(?=\s*\})/,
                        lookbehind: true,
                        inside: prism.languages['javascript'],
                    },
                    {
                        pattern: /(as[\s]*)[\s\S]*(?=\s*)/,
                        lookbehind: true,
                        inside: prism.languages['javascript'],
                    },
                    {
                        pattern: /(#each[\s]*)[\s\S]*(?=as)/,
                        lookbehind: true,
                        inside: prism.languages['javascript'],
                    },
                ],
                keyword: /[#/]each|as/,
                punctuation: /{|}/,
            },
        },
        block: {
            pattern: new RegExp(
                '{[#:/@]/s' +
                blocks +
                '(?:(?:\\{(?:(?:\\{(?:[^{}])*\\})|(?:[^{}]))*\\})|(?:[^{}]))*}'
            ),
            inside: {
                punctuation: /^{|}$/,
                keyword: [new RegExp('[#:/@]' + blocks + '( )*'), /as/, /then/],
                'language-javascript': {
                    pattern: /[\s\S]*/,
                    inside: prism.languages['javascript'],
                },
            },
        },
        tag: {
            pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?:"[^"]*"|'[^']*'|{[\s\S]+?}(?=[\s/>])))|(?=[\s/>])))+)?\s*\/?>/i,
            greedy: true,
            inside: {
                tag: {
                    pattern: /^<\/?[^\s>\/]+/i,
                    inside: {
                        punctuation: /^<\/?/,
                        namespace: /^[^\s>\/:]+:/,
                    },
                },
                'language-javascript': {
                    pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
                    inside: prism.languages['javascript'],
                },
                'attr-value': {
                    pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
                    inside: {
                        punctuation: [
                            /^=/,
                            {
                                pattern: /^(\s*)["']|["']$/,
                                lookbehind: true,
                            },
                        ],
                        'language-javascript': {
                            pattern: /{[\s\S]+}/,
                            inside: prism.languages['javascript'],
                        },
                    },
                },
                punctuation: /\/?>/,
                'attr-name': {
                    pattern: /[^\s>\/]+/,
                    inside: {
                        namespace: /^[^\s>\/:]+:/,
                    },
                },
            },
        },
        'language-javascript': {
            pattern: /\{(?:(?:\{(?:(?:\{(?:[^{}])*\})|(?:[^{}]))*\})|(?:[^{}]))*\}/,
            lookbehind: true,
            inside: prism.languages['javascript'],
        },
    }) as Grammar & { tag: GrammarValue };

    // Type assertion to handle the entity assignment
    const svelteGrammar = prism.languages.svelte as Grammar & { 
        tag: GrammarValue & { 
            inside: { 
                'attr-value': { 
                    inside: { entity: GrammarValue } 
                } 
            } 
        } 
    };
    
    if (svelteGrammar.tag?.inside?.['attr-value']?.inside) {
        svelteGrammar.tag.inside['attr-value'].inside['entity'] = 
            (prism.languages.svelte as Grammar & { entity: GrammarValue }).entity;
    }

    prism.hooks.add('wrap', (env: { type: string; attributes: { [x: string]: any; }; content: string; }) => {
        if (env.type === 'entity') {
            env.attributes['title'] = env.content.replace(/&amp;/, '&');
        }
    });

    // Add the addInlined method to the tag grammar
    type AddInlined = (tagName: string, lang: string) => void;
    
    const addInlined: AddInlined = function(tagName: string, lang: string) {
        const includedCdataInside: { [key: string]: any } = {};
        includedCdataInside['language-' + lang] = {
            pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
            lookbehind: true,
            inside: prism.languages[lang],
        };
        includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

        const inside: { [key: string]: any } = {
            'included-cdata': {
                pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
                inside: includedCdataInside,
            },
        };
        inside['language-' + lang] = {
            pattern: /[\s\S]+/,
            inside: prism.languages[lang],
        };

        const def: { [key: string]: any } = {};
        def[tagName] = {
            pattern: RegExp(
                /(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(
                    /__/g,
                    tagName
                ),
                'i'
            ),
            lookbehind: true,
            greedy: true,
            inside,
        };

        prism.languages.insertBefore('svelte', 'cdata', def);
    };

    Object.defineProperty(svelteGrammar.tag, 'addInlined', {
        value: addInlined
    });


    //@ts-ignore
    svelteGrammar.tag.addInlined('style', 'css');
    //@ts-ignore
    svelteGrammar.tag.addInlined('script', 'javascript');
}