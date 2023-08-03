<script lang="ts">
	import { defaultKeymap, indentWithTab } from '@codemirror/commands';
	import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { lintGutter } from '@codemirror/lint';
	import { keymap } from '@codemirror/view';
	import { tags } from '@lezer/highlight';
	import { EditorView, basicSetup } from 'codemirror';
	import { onMount } from 'svelte';
	import { lua } from './lualib/LuaLang';
	import { luaLint } from './lualib/LuaLint';
	import { SCREEN_HEIGHT, SCREEN_WIDTH } from './smlib/Constants';

	let editor: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let stdout: HTMLPreElement;
	let loaded = false;

	const CONSOLE_COLORS: Record<string, string> = {
		error: '#bf2626'
	};

	const theme = EditorView.theme(
		{
			'&': {
				color: 'var(--text)',
				backgroundColor: 'var(--secondary)',
				height: '500px',
				flex: '1',
				minWidth: '0'
			},
			'.cm-scroller': {
				overflow: 'auto',
				fontFamily: 'Source Code Pro, Consolas, monospace'
			},
			'.cm-content': {
				caretColor: 'var(--text)'
			},
			'&.cm-focused .cm-cursor': {
				borderLeftColor: 'var(--text)'
			},
			'.cm-content .cm-activeLine': {
				backgroundColor: '#4d4d5133'
			},
			'.cm-gutters': {
				backgroundColor: 'var(--secondary)',
				color: '#ddd',
				borderRight: '3px solid #16181a'
			},
			'&.cm-focused .cm-scroller .cm-selectionLayer .cm-selectionBackground': {
				background: '#334'
			},
			'.cm-gutters .cm-activeLineGutter': {
				backgroundColor: '#4d4d5133'
			},
			'.cm-selectionMatch': {
				backgroundColor: '#5f5f6d55'
			}
		},
		{ dark: true }
	);

	const highlightTheme = HighlightStyle.define([
		{ tag: tags.comment, color: '#585b6e', fontStyle: 'italic' },
		{ tag: tags.blockComment, color: '#585b6e', fontStyle: 'italic' },
		{ tag: tags.labelName, color: '#f5bc42' },
		{ tag: tags.definition(tags.variableName), color: '#ffbc2c' },
		{ tag: tags.number, color: '#b2f597' },
		{ tag: tags.string, color: '#f5b3a3' },
		{ tag: tags.escape, color: '#e3b75f' },
		{ tag: tags.logicOperator, color: '#b8b8b8', fontWeight: 'bold' },
		{ tag: tags.self, color: '#c97e5b', fontWeight: 'bold' },
		{ tag: tags.special(tags.string), color: '#782e1e' },
		{ tag: tags.variableName, color: '#6bb3ff' },
		{ tag: tags.propertyName, color: '#3cc9c5' },
		{ tag: tags.function(tags.propertyName), color: '#fffeb3' },
		{ tag: tags.controlKeyword, color: '#ef42f5', fontWeight: 'bold' },
		{ tag: tags.operatorKeyword, color: '#ef42f5', fontWeight: 'bold' },
		{ tag: tags.definitionKeyword, color: '#ef42f5', fontWeight: 'bold' },
		{ tag: tags.bool, color: '#555fcf', fontWeight: 'bold' },
		{ tag: tags.null, color: '#c2c2c2', fontWeight: 'bold' },
		{ tag: tags.function(tags.variableName), color: '#a6a6e3' },
		{ tag: tags.function(tags.definition(tags.variableName)), color: '#a6a6e3' }
	]);

	let runTimeout = 0;

	export let value: string;

	onMount(() => {
		async function load() {
			loaded = true;

			// Load libraries from onMount so that they don't error on SSR
			const { Application } = await import('pixi.js');
			const { LuaManager } = await import('./smlib/LuaManager');
			const { LoadMenuPerspective } = await import('./smlib/Util');

			// Load Lua
			const luaManager = new LuaManager();

			// Redirect log
			luaManager.onLog = (msg) => log(msg);

			// Load application
			const app = new Application({
				backgroundColor: 0xdddddd,
				view: canvas,
				antialias: true,
				width: SCREEN_WIDTH,
				height: SCREEN_HEIGHT
			});

			LoadMenuPerspective(0, 640, 480, 320, 240);

			let view = new EditorView({
				extensions: [
					basicSetup,
					EditorView.updateListener.of(function (e) {
						if (e.docChanged) {
							clearTimeout(runTimeout);
							runTimeout = setTimeout(() => runCode(), 200);
						}
					}),
					lua,
					lintGutter(),
					luaLint,
					syntaxHighlighting(highlightTheme),
					theme,
					keymap.of([...defaultKeymap, indentWithTab])
				],
				doc: value
			});

			editor.replaceWith(view.dom);

			async function runCode() {
				try {
					stdout.replaceChildren();
					const pixiObj = await luaManager.run(view.state.doc.toString());
					app.stage.removeChildren();
					if (!pixiObj) return;
					app.stage.addChild(pixiObj);
				} catch (e: any) {
					const errorMessage = typeof e == 'string' ? e : e.message.split('\n')[0];
					// remove weird [string "default.lua"]
					const match = /\[string "(.+)"\](.+)/g.exec(errorMessage);
					const msg = match ? match[1] + match[2] : errorMessage;
					console.log(e);
					log(msg, 'error');
				}
			}

			runCode();
		}

		function log(message: string, type?: string) {
			const error = document.createElement('code');
			error.innerText = message;
			if (type && CONSOLE_COLORS[type]) error.style.color = CONSOLE_COLORS[type];
			stdout.appendChild(error);
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !loaded) {
						load();
						observer.disconnect();
					}
				});
			},
			{ threshold: 0.1 }
		);
		observer.observe(editor);
	});
</script>

<div class="editor-container">
	<div class="editor-placeholder" bind:this={editor} />
	<div class="editor-split" />
	<div class="output-container">
		<canvas bind:this={canvas} />
		<div class="output-split" />
		<pre class="console" bind:this={stdout} />
	</div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: row;
		background-color: var(--secondary);
		font-size: 13px;
	}
	.editor-placeholder {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		color: #3c4044;
	}
	.editor-placeholder::after {
		content: 'loading editor...';
		text-align: center;
		width: 100%;
		font-family: monospace;
		font-size: 1em;
	}
	.editor-container canvas {
		width: 400px;
		height: 300px;
	}
	.editor-split {
		padding: 0px 2px;
		background-color: #16181a;
	}
	.output-split {
		padding: 2px 0;
		background-color: #16181a;
	}
	.output-container {
		display: flex;
		flex-direction: column;
		padding: 4px 0;
		flex-grow: 0;
		height: 500px;
	}
	.console {
		font-size: 1em;
		font-family: monospace;
		padding: 2px 8px;
		width: 400px;
		white-space: normal;
		display: flex;
		flex-direction: column;
		overflow: auto;
		height: 100%;
		white-space: nowrap;
	}
</style>
