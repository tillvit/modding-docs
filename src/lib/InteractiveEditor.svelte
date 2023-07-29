<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { EditorView, basicSetup } from 'codemirror';
	import type { Sprite3D } from 'pixi3d/*';
	import { onMount } from 'svelte';
	import { SCREEN_HEIGHT, SCREEN_WIDTH } from './smlib/Constants';

	let container: HTMLDivElement;

	let canvas: HTMLCanvasElement;

	let app: import('pixi.js').Application;

	export let value: string;
	onMount(() => {
		async function load() {
			// Load libraries from onMount so that they don't error on SSR
			const { Application } = await import('pixi.js');
			const { LuaManager } = await import('./smlib/LuaManager');
			const { Camera, CameraOrbitControl } = await import('pixi3d/pixi7');

			// Load Lua
			const luaManager = new LuaManager();
			await luaManager.loaded;

			// Load application
			app = new Application({
				backgroundColor: 0xdddddd,
				view: canvas,
				antialias: true,
				width: SCREEN_WIDTH,
				height: SCREEN_HEIGHT
			});

			const pixiObj: Sprite3D = await luaManager.run(`
      return Def.Sprite{
        Texture="https://picsum.photos/100",
        OnCommand=function(self)
        end,
        InitCommand=function(self)
        end,
      }
      `);

			pixiObj.scale.set(100, 100, 1);

			// let control = new CameraOrbitControl(canvas);
			// Camera.main.scale.set(0.01, 0.01, 1);
			// console.log(Camera.main);
			Camera.main.position.set(SCREEN_WIDTH / 2, -SCREEN_HEIGHT / 2, SCREEN_HEIGHT);
			app.stage.removeChildren();
			app.stage.addChild(pixiObj);
			// control.target = {
			// 	x: SCREEN_WIDTH / 2,
			// 	y: -SCREEN_HEIGHT / 2,
			// 	z: 240
			// };
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
