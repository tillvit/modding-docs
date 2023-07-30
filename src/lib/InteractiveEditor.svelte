<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { EditorView, basicSetup } from 'codemirror';
	import { onMount } from 'svelte';
	import { SCREEN_HEIGHT, SCREEN_WIDTH } from './smlib/Constants';

	let container: HTMLDivElement;

	let canvas: HTMLCanvasElement;

	let app: import('pixi.js').Application;

	export let value: string;
	onMount(() => {
		async function load() {
			// Load libraries from onMount so that they don't error on SSR
			const { Application, Point } = await import('pixi.js');
			const { LuaManager } = await import('./smlib/LuaManager');
			const { LoadMenuPerspective } = await import('./smlib/Util');

			// Load Lua
			const luaManager = new LuaManager();

			// Load application
			app = new Application({
				backgroundColor: 0xdddddd,
				view: canvas,
				antialias: true,
				width: SCREEN_WIDTH,
				height: SCREEN_HEIGHT
			});

			const pixiObj = await luaManager.run(`
      return Def.Sprite{
        Texture="https://picsum.photos/100",
        OnCommand=function(self)
        end,
        InitCommand=function(self)
        end,
      }
      `);
			LoadMenuPerspective(0, 640, 480, 320, 240);
			pixiObj.x = 50;
			pixiObj.y = 50;

			app.stage.addChild(pixiObj);
		}
		load();
		let view = new EditorView({
			extensions: [basicSetup, StreamLanguage.define(lua)],
			doc: value,
			parent: container
		});
	});
</script>

<div bind:this={container} />
<canvas bind:this={canvas} />
