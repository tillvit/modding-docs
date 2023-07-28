<script>
	import { StreamLanguage } from '@codemirror/language';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { EditorView, basicSetup } from 'codemirror';
	import { onMount } from 'svelte';

	// import { Application } from 'pixi.js';
	// import { Light, LightingEnvironment, Mesh3D } from 'pixi3d/pixi7';

	// import { interopTest } from './smlib/LuaManager';

	/**
	 * @type {HTMLDivElement}
	 */
	let container;

	/**
	 * @type {string}
	 */
	export let value;
	onMount(() => {
		async function load() {
			let PIXI = await import('pixi.js');
			let PIXI3D = await import('pixi3d/pixi7');
			let app = new PIXI.Application({
				backgroundColor: 0xdddddd,
				resizeTo: window,
				antialias: true
			});
			document.body.appendChild(app.view);
			let mesh = app.stage.addChild(PIXI3D.Mesh3D.createCube());

			// Create a light source and add it to the main lighting environment. Without
			// doing this, the rendered mesh would be completely black.
			let light = new PIXI3D.Light();
			light.position.set(-1, 0, 3);
			PIXI3D.LightingEnvironment.main.lights.push(light);

			let rotation = 0;
			app.ticker.add(() => {
				// This function will be called before each render happens. When rotating an
				// object in 3D, the "rotationQuaternion" is used instead of the regular
				// "rotation" available in PixiJS. "setEulerAngles" is called to be able to
				// set the rotation on all axes. In this case, only the y-axis is changed.
				mesh.rotationQuaternion.setEulerAngles(0, rotation++, 0);
			});
		}
		load();

		let view = new EditorView({
			extensions: [basicSetup, StreamLanguage.define(lua)],
			doc: value,
			parent: container
		});
		// interopTest();
	});
</script>

<div bind:this={container} />
